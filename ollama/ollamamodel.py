# app.py
from __future__ import annotations
import os
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_ollama import ChatOllama, OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough

# Optional reranker (improves precision of top-k)
try:
    from flashrank import Ranker, RerankRequest
    RERANK = True
    ranker = Ranker(model_name="BAAI/bge-reranker-v2-m3")  # multilingual, fast
except Exception:
    RERANK = False
    ranker = None

# ---------- Paths & constants ----------
BASE_DIR = os.path.dirname(__file__)
DB_DIR   = os.path.join(BASE_DIR, "db", "chroma")     # <project>/ollama/db/chroma
BASE_URL = "http://127.0.0.1:11434"                   # Ollama default
COLLECTION = "basketball_rules"

# Ensure vector DB exists (ingest.py should have created it)
if not os.path.exists(DB_DIR) or not os.listdir(DB_DIR):
    raise RuntimeError(
        f"Vector DB not found or empty at {DB_DIR}. "
        "Run ingestion first: `py ingest.py` from the ollama folder."
    )

# ---------- Embeddings via Ollama ----------
emb = OllamaEmbeddings(model="nomic-embed-text", base_url=BASE_URL)

# ---------- Vector store & retriever ----------
vectordb = Chroma(
    persist_directory=DB_DIR,
    embedding_function=emb,
    collection_name=COLLECTION,
)
# similarity is fine; switch to search_type="mmr" for more diversity
retriever = vectordb.as_retriever(search_kwargs={"k": 8})

def rerank(query: str, docs):
    if not RERANK or not docs:
        return docs
    req = RerankRequest(query=query, passages=[d.page_content for d in docs])
    scores = ranker.rerank(req)  # sorted by relevance desc
    order = [s.index for s in scores]
    return [docs[i] for i in order]

def format_docs(docs) -> str:
    lines: List[str] = []
    for i, d in enumerate(docs):
        src = d.metadata.get("source", "")
        page = d.metadata.get("page", "?")
        lines.append(f"[{i+1}] {d.page_content}\nSOURCE: {src} | page {page}")
    return "\n\n".join(lines)

def retrieve(query: str):
    docs = retriever.get_relevant_documents(query)
    return rerank(query, docs)

SYSTEM = """You are a basketball rules assistant. Prefer official sources (FIBA/NBA/WNBA).
- Distinguish between FIBA vs NBA when relevant.
- Quote rule numbers and page numbers when available.
- If unsure, say so and point to the exact section to check.
- Keep answers concise and accurate.
- Answer in the user's language (Hebrew/English) based on the question.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM),
    ("human", "Question: {question}\n\nContext:\n{context}")
])

# ---------- Chat LLM (your current local model) ----------
llm = ChatOllama(
    model="deepseek-r1:1.5b",
    temperature=0.1,
    base_url=BASE_URL,
)

# ---------- RAG chain ----------
rag_chain = (
    {
        "question": RunnablePassthrough(),
        "context": RunnableLambda(retrieve) | RunnableLambda(format_docs),
    }
    | prompt
    | llm
    | StrOutputParser()
)

# ---------- FastAPI ----------
app = FastAPI(title="Basketball RAG (Ollama + Chroma)")

# CORS (adjust origins for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

@app.get("/health")
def health():
    try:
        count = vectordb._collection.count()  # type: ignore
        return {"status": "ok", "docs": int(count)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(req: ChatRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    answer = rag_chain.invoke(req.question)
    top_docs = retrieve(req.question)[:4] or []
    sources = [{"source": d.metadata.get("source",""), "page": d.metadata.get("page")} for d in top_docs]
    return {"answer": answer, "sources": sources}
