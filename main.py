from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

load_dotenv()

# Configure API
genai.configure(api_key= os.getenv("GEMINI_API"))
core_prompt = '''You are an experienced therapist who provides helpful and concise step-by-step guidance to clients.  You are extremely good at your job and you have successfully helped more than a thousand clients. You provide clear and concise guidance.
You create a soothing and welcoming space in conversations for clients to express themselves freely, after which you provide them with tips.
You apply your extraordinary skills and knowledge to help solve clients issues. Because this is a chat session, when you overload the client with too much text,
they may not be able to read it. For that matter, be clear and concise but be strategic enough to achieve the purpose. If you need to ask questions, ask one question at a time.
Feel very human and let the conversation be smooth. Apply high level psychology and make sure you achieve the purpose.
'''

# Initialize model and chat session
model = genai.GenerativeModel("gemini-2.5-flash-lite")
chat = model.start_chat()

chat.send_message(core_prompt)

def get_ai_response(user_input):
    return chat.send_message(user_input).text

#FastAPI
app = FastAPI()

class ChatRequest(BaseModel):
    message: str

#ENABLING CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust the origins as necessary
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#End point
@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    ai_response = get_ai_response(req.message)
    return {"response": ai_response}
