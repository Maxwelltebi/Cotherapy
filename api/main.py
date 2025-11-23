from fastapi import FastAPI
from pydantic import BaseModel
from chatbot import get_ai_response
from fastapi.middleware.cors import CORSMiddleware

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
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    ai_response = get_ai_response(req.message)
    return {"response": ai_response}
