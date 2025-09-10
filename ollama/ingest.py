# ingest.py
import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data", "pdfs")
DB_DIR   = os.path.join(BASE_DIR, "db", "chroma")

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(DB_DIR, exist_ok=True)

    loader = PyPDFDirectoryLoader(DATA_DIR, recursive=True)
    docs = loader.load()
    if not docs:
        raise RuntimeError(f"No PDF files found in {DATA_DIR}. Make sure valid PDFs exist.")

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120, add_start_index=True)
    chunks = splitter.split_documents(docs)

    embeddings = OllamaEmbeddings(
        model="nomic-embed-text",
        base_url="http://127.0.0.1:11434"  # חשוב ב-Windows לפעמים
    )

    vectordb = Chroma.from_documents(
        chunks,
        embedding=embeddings,
        persist_directory=DB_DIR,
        collection_name="basketball_rules",
    )
    vectordb.persist()
    print(f"Ingested {len(chunks)} chunks into {DB_DIR}")

if __name__ == "__main__":
    main()
