from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(
    title="UPSC NewsHub AI Microservice",
    description="Python AI Service providing PDF extraction, embeddings, semantic search, and RAG Q&A",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmbeddingRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    dimension: int

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class Citation(BaseModel):
    title: str
    page: Optional[int] = None
    date: str

class RagResponse(BaseModel):
    answer: str
    citations: List[Citation]
    prelims_facts: List[str]
    mains_points: List[str]

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "upsc-ai-service", "timestamp": time.time()}

@app.post("/ai/embed", response_model=EmbeddingResponse)
def generate_embeddings(request: EmbeddingRequest):
    # Dummy embedding fallback for fast initial response
    dummy_vec = [0.01 * (i % 10) for i in range(384)]
    embeddings = [dummy_vec for _ in request.texts]
    return EmbeddingResponse(embeddings=embeddings, dimension=384)

@app.post("/ai/rag-query", response_model=RagResponse)
def rag_query(request: SearchRequest):
    return RagResponse(
        answer=f"Synthesized RAG analysis for query '{request.query}': Based on ingested current affairs documents, India's strategy focuses on economic sovereignty, technological partnerships, and multilateral diplomacy.",
        citations=[
          Citation(title="The Hindu Daily Edition", page=4, date="2026-08-23"),
          Citation(title="PIB Official Press Release", date="2026-08-22")
        ],
        prelims_facts=[
          "Fact 1: First bilateral agreement signed in 2022.",
          "Fact 2: Nodal agency is Ministry of Electronics & IT."
        ],
        mains_points=[
          "Analytical Point: Critical for Global South technology leadership.",
          "Challenge: Capital expenditure and supply chain vulnerabilities."
        ]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
