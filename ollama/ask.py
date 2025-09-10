import sys
import requests

url = "http://127.0.0.1:8000/chat"

# אם המשתמש נתן שאלה כארגומנט, נשתמש בה, אחרת ברירת מחדל
question = " ".join(sys.argv[1:])

resp = requests.post(url, json={"question": question})

data = resp.json()
print("Q:", question)
print("A:", data.get("answer"))
