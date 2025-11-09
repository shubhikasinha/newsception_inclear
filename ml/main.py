from fastapi import FastAPI
from summarizer import app as sum
from sentimentanalysis import app as sent

main_app = FastAPI(title="Combined FastAPI Apps")

# Mount both apps under different paths
main_app.mount(sum)
main_app.mount(sent)

@main_app.get("/")
def root():
    return {"message": "Main FastAPI is running"}
