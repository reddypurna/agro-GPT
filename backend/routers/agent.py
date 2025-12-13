# routers/agent.py

import os
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

# IMPORTANT: Ensure config.py, agent.py, and models.py are accessible (e.g., in the root folder)
from config import Settings 
from agent import AgriAgent 
from models import AgentResponse, QueryRequest 

# Load settings to get configuration details
settings = Settings() 

router = APIRouter()

# ====================================================================
# AGENT INITIALIZATION
# ====================================================================

def check_paths(s: Settings):
    """
    Ensure all required files for the agent (especially RAG components) exist 
    and warn the user if they are missing.
    """
    missing_files = []
    # Check paths defined in config.py
    for path in [s.FAISS_INDEX_PATH, s.METADATA_PATH, s.MARKET_PRICES_PATH]:
        # Path is accessible even if the file is not, but we check for existence
        if not os.path.exists(path):
            missing_files.append(path)
    
    if missing_files:
        print("\n" + "="*70)
        print("❌ AGENT INITIALIZATION WARNING: Missing data files detected.")
        print("The AgriAgent's RAG and Market tools may not function until these are available:")
        for path in missing_files:
             print(f"  - {path}")
        print("="*70 + "\n")

# Check paths before agent initialization
check_paths(settings)

try:
    # Initialize the core AgriAgent instance using configuration
    agri_agent = AgriAgent(
        openrouter_keys=settings.OPENROUTER_KEYS,
        openweather_key=settings.OPENWEATHER_API_KEY, 
        faiss_index_path=settings.FAISS_INDEX_PATH,
        metadata_path=settings.METADATA_PATH,
        market_prices_path=settings.MARKET_PRICES_PATH,
        response_llm_model=settings.RESPONSE_LLM_MODEL,
        agent_llm_model=settings.AGENT_LLM_MODEL,
        key_cooldown_minutes=settings.KEY_COOLDOWN_MINUTES
    )
    print("🤖 AgriAgent successfully instantiated and ready for queries.")
except Exception as e:
    # Log critical failure and set agent to None to block requests
    print(f"❌ FATAL ERROR during AgriAgent initialization: {e}")
    agri_agent = None 

# ====================================================================
# ENDPOINT: /agent/query
# ====================================================================

@router.post("/query", response_model=AgentResponse)
async def agent_query(request: QueryRequest):
    """
    Accepts a user query and runs it through the AgriAgent pipeline 
    (Tool selection, RAG, Weather, Market Price lookup, and final LLM response).
    """
    if agri_agent is None:
        raise HTTPException(
            status_code=503, 
            detail="AgriAgent service is currently unavailable due to initialization failure. Check server logs."
        )

    try:
        # Pass the question to the agent's query method. 
        # The AgriAgent.query() returns a dictionary that matches the AgentResponse schema.
        result: Dict[str, Any] = agri_agent.query(request.question, verbose=True)
        
        # The result includes 'question', 'answer', 'tools_used', and 'context'
        return AgentResponse(**result)

    except ConnectionError as e:
        # Catches the specific 'All API keys exhausted' error from the agent
        raise HTTPException(
            status_code=503,
            detail=f"Service Exhausted: {str(e)}. Please check OpenRouter API keys."
        )
    except Exception as e:
        # General internal server error
        raise HTTPException(
            status_code=500,
            detail=f"Internal Agent Processing Error: {type(e).__name__}: {str(e)}"
        )