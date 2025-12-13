# models.py

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional 

class QueryRequest(BaseModel):
    """Schema for a RAG or Agent query request."""
    question: str = Field(..., description="The user's agricultural question.")
    top_k: int = Field(5, description="Number of passages to retrieve from the VectorDB.")
    similarity_threshold: float = Field(0.35, description="Minimum similarity score for a passage to be included.")
    temperature: float = Field(0.1, description="LLM temperature for response generation.")

class VectorSearchResponse(BaseModel):
    """Schema for direct VectorDB search results."""
    question: str
    passages: List[Dict[str, Any]]

class RAGResponse(BaseModel):
    """Schema for the RAG pipeline's final answer."""
    question: str
    answer: str
    sources: List[Dict[str, Any]]
    llm_model: str

class AgentResponse(BaseModel):
    """
    Schema for the Agent's response, including tool usage.
    This schema aligns with the structure returned by AgriAgent.query().
    """
    question: str
    answer: str
    tools_used: List[str]
    # Corrected: 'context' is the compiled string of all tool results + RAG passages
    context: str