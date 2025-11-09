# main_app.py
from transformers import pipeline
from getting_sentiments import get_sentiment_pipeline
from fastapi import FastAPI
from helper import clean_text
from summarizer import summarize_text
from pydantic import BaseModel
import uvicorn
class TextRequest(BaseModel):
    text: str
def get_sentiment(text):
    pipe=get_sentiment_pipeline()
    text=clean_text(text)
    summary=summarize_text(text)
    result=pipe(text)
    return result

app = FastAPI()
@app.post("/sentimentanalysis")
async def sentiment_analysis(req:TextRequest):
    result=get_sentiment(req.text)
    sentiment = result[0]["label"]
    return sentiment

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
