# Newsception ML Service

FastAPI-based microservice for NLP analysis of news articles.

## Features

- Sentiment analysis
- Perspective detection (support/oppose)
- Bias detection and loaded language identification  
- Claim extraction
- Entity recognition
- Historical context generation

## Setup

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Or with uvicorn
uvicorn main:app --reload --port 8000
```

### Docker

```bash
docker build -t newsception-ml .
docker run -p 8000:8000 newsception-ml
```

## API Endpoints

### POST /analyze

Analyze news articles for perspectives, sentiment, and bias.

**Request:**
```json
{
  "articles": [
    {
      "title": "Article title",
      "url": "https://example.com/article",
      "source": "News Source",
      "description": "Article description...",
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "topic": "climate change"
}
```

**Response:**
```json
[
  {
    "perspective": "support",
    "stance": "Urgent climate action needed",
    "sentiment": "positive",
    "sentimentScore": 0.65,
    "summary": "Article summary...",
    "keyPoints": ["Point 1", "Point 2"],
    "credibilityScore": 85,
    "biasScore": 25,
    "entities": [...],
    "emotionalTones": [...],
    "claims": [...],
    "biasAnalysis": {...}
  }
]
```

### POST /historical-context

Get historical timeline for a topic.

**Request:**
```json
{
  "topic": "artificial intelligence"
}
```

**Response:**
```json
{
  "events": [
    {
      "date": "2023-01-15T00:00:00",
      "headline": "Major AI development",
      "summary": "Description...",
      "significance": "Why it matters",
      "sources": ["Source 1", "Source 2"]
    }
  ],
  "keyDevelopments": ["Development 1", "Development 2"],
  "relatedTopics": ["Topic 1", "Topic 2"]
}
```

### GET /health

Health check endpoint.

## Production Enhancements

For production deployment, replace mock analysis with:

1. **Sentiment Analysis**: HuggingFace transformers (BERT, RoBERTa)
2. **Named Entity Recognition**: spaCy or Stanza
3. **Bias Detection**: Custom fine-tuned models
4. **Claim Detection**: Fact-checking models
5. **Topic Modeling**: LDA or BERTopic
6. **Historical Context**: Knowledge graph queries

## Environment Variables

- `PORT` - Service port (default: 8000)
- `MODEL_CACHE_DIR` - Directory for model caching
- `MAX_ARTICLES` - Maximum articles per request (default: 50)

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=main
```

## Performance

- Response time: ~100-500ms for 10 articles
- Concurrent requests: Handled by uvicorn workers
- Scalability: Deploy multiple instances behind load balancer

## License

MIT
