from transformers import pipeline
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
class TextRequest(BaseModel):
    text: str

def summarize_text(text, model_name="sshleifer/distilbart-cnn-12-6"):
    summarizer = pipeline("summarization", model=model_name)
    summary = summarizer(
        text,
        max_length=80,    
        min_length=20,     
        do_sample=False    
    )

    return summary[0]['summary_text']
app = FastAPI()
@app.post("/summarize")
async def summarize(req:TextRequest):
    summary = summarize_text(req.text)
    return {"summary": summary}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
