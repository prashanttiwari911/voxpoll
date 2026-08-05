from fastapi import FastAPI
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = FastAPI(title="VoTI Sentiment Analysis Service")
analyzer = SentimentIntensityAnalyzer()

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    compound: float
    label: str

@app.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    # Calculate sentiment scores
    # scores is a dictionary: {'neg': float, 'neu': float, 'pos': float, 'compound': float}
    scores = analyzer.polarity_scores(request.text)
    compound = scores["compound"]
    
    # Determine label based on standard VADER thresholds
    if compound >= 0.05:
        label = "POSITIVE"
    elif compound <= -0.05:
        label = "NEGATIVE"
    else:
        label = "NEUTRAL"
        
    return SentimentResponse(compound=compound, label=label)

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
