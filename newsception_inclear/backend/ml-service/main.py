from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
from datetime import datetime
import random

app = FastAPI(title="Newsception ML Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Article(BaseModel):
    title: str
    url: str
    source: str
    description: str
    publishedAt: str

class AnalysisRequest(BaseModel):
    articles: List[Article]
    topic: str

class Entity(BaseModel):
    name: str
    type: str
    sentiment: str
    score: float

class EmotionalTone(BaseModel):
    emotion: str
    score: float

class Claim(BaseModel):
    text: str
    type: str
    verifiability: int
    confidence: int

class LoadedTerm(BaseModel):
    term: str
    context: str
    biasType: str

class BiasAnalysis(BaseModel):
    coverageTilt: str
    loadedTerms: List[LoadedTerm]
    reasoning: str

class AnalysisResult(BaseModel):
    perspective: str
    stance: str
    sentiment: str
    sentimentScore: float
    summary: str
    keyPoints: List[str]
    credibilityScore: int
    biasScore: int
    entities: List[Entity]
    emotionalTones: List[EmotionalTone]
    claims: List[Claim]
    biasAnalysis: BiasAnalysis

class HistoricalEvent(BaseModel):
    date: datetime
    headline: str
    summary: str
    significance: str
    sources: List[str]

class HistoricalContextResponse(BaseModel):
    events: List[HistoricalEvent]
    keyDevelopments: List[str]
    relatedTopics: List[str]

@app.get("/")
def read_root():
    return {
        "service": "Newsception ML Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/analyze": "POST - Analyze news articles",
            "/historical-context": "POST - Get historical context",
            "/health": "GET - Health check"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/analyze", response_model=List[AnalysisResult])
def analyze_articles(request: AnalysisRequest):
    """
    Analyze news articles for perspective, sentiment, bias, and claims.
    
    In production, this would use:
    - NLP models for sentiment analysis
    - Named entity recognition
    - Claim detection models
    - Bias detection algorithms
    
    For now, returns mock analysis with intelligent categorization.
    """
    results = []
    topic = request.topic.lower()
    
    for i, article in enumerate(request.articles):
        # Alternate perspectives
        is_support = i % 2 == 0
        
        # Determine stance based on topic
        if "climate" in topic or "environment" in topic:
            stance_a = "Urgent climate action needed"
            stance_b = "Economic considerations prioritized"
        elif "ai" in topic or "tech" in topic:
            stance_a = "Innovation and progress"
            stance_b = "Regulation and safety concerns"
        elif "economic" in topic or "finance" in topic:
            stance_a = "Growth-focused approach"
            stance_b = "Sustainability-focused approach"
        elif "health" in topic or "medical" in topic:
            stance_a = "Public health priority"
            stance_b = "Individual liberty focus"
        else:
            stance_a = f"Supporting {request.topic}"
            stance_b = f"Critical of {request.topic}"
        
        stance = stance_a if is_support else stance_b
        sentiment_score = round(random.uniform(0.3, 0.8), 2) if is_support else round(random.uniform(-0.7, -0.2), 2)
        
        # Generate analysis
        result = AnalysisResult(
            perspective="support" if is_support else "oppose",
            stance=stance,
            sentiment="positive" if is_support else "negative",
            sentimentScore=sentiment_score,
            summary=article.description[:200] + "..." if len(article.description) > 200 else article.description,
            keyPoints=[
                f"Analysis of {request.topic} from this perspective",
                f"Impact on stakeholders and policy",
                f"Future implications and outlook"
            ],
            credibilityScore=random.randint(65, 95),
            biasScore=random.randint(20, 40) if is_support else random.randint(-40, -20),
            entities=[
                Entity(
                    name=request.topic,
                    type="TOPIC",
                    sentiment="positive" if is_support else "negative",
                    score=abs(sentiment_score)
                )
            ],
            emotionalTones=[
                EmotionalTone(
                    emotion="optimism" if is_support else "concern",
                    score=0.7
                ),
                EmotionalTone(
                    emotion="analytical",
                    score=0.5
                )
            ],
            claims=[
                Claim(
                    text=f"{request.topic} has significant implications for society",
                    type="factual",
                    verifiability=random.randint(70, 90),
                    confidence=random.randint(75, 95)
                )
            ],
            biasAnalysis=BiasAnalysis(
                coverageTilt="center_right" if is_support else "center_left",
                loadedTerms=[
                    LoadedTerm(
                        term="breakthrough" if is_support else "concerning",
                        context=f"The {request.topic} development is described as {'breakthrough' if is_support else 'concerning'}",
                        biasType="positive" if is_support else "negative"
                    )
                ],
                reasoning=f"Article shows {'supportive' if is_support else 'critical'} stance based on language analysis and framing"
            )
        )
        
        results.append(result)
    
    return results

@app.post("/historical-context", response_model=HistoricalContextResponse)
def get_historical_context(request: Dict[str, str]):
    """
    Generate historical context for a topic.
    
    In production, this would:
    - Search historical databases
    - Use timeline extraction models
    - Verify with multiple sources
    
    For now, returns mock historical timeline.
    """
    topic = request.get("topic", "")
    now = datetime.now()
    
    events = [
        HistoricalEvent(
            date=datetime(now.year - 1, 1, 15),
            headline=f"Initial developments in {topic}",
            summary=f"The beginnings of the {topic} discussion in mainstream media",
            significance="Established foundation for current debates",
            sources=["Historical archives", "News databases"]
        ),
        HistoricalEvent(
            date=datetime(now.year - 1, 6, 20),
            headline=f"Major milestone in {topic}",
            summary=f"Significant progress and policy changes related to {topic}",
            significance="Shifted public discourse and policy direction",
            sources=["Policy documents", "News reports"]
        ),
        HistoricalEvent(
            date=datetime(now.year, now.month - 1 if now.month > 1 else 1, 10),
            headline=f"Recent developments in {topic}",
            summary=f"Latest updates and ongoing debates about {topic}",
            significance="Led to current situation and discussions",
            sources=["Recent news", "Current reports"]
        )
    ]
    
    return HistoricalContextResponse(
        events=events,
        keyDevelopments=[
            f"Initial research and awareness about {topic}",
            "Policy discussions and legislative actions",
            "Public debate and stakeholder engagement",
            "Current status and future outlook"
        ],
        relatedTopics=["Related Topic 1", "Related Topic 2", "Related Topic 3"]
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
