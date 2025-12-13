# config.py (Final Fix for Pydantic Validation)

import os
from typing import List, Optional
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables (including .env file).
    """
    model_config = SettingsConfigDict(
        env_file='.env', 
        case_sensitive=True,
    )

    # --- API Key Variables (Raw environment fields) ---
    OPENROUTER_API_KEYS: Optional[str] = Field(None)
    OPENROUTER_API_KEY: Optional[str] = Field(None)
    
    # CRITICAL FIX: The Pydantic field name must match the environment variable name (OPENWEATHER_API_KEY)
    # If the agent constructor requires 'openweather_key', we handle the mapping below.
    OPENWEATHER_API_KEY: str = Field(
        ..., 
        description="OpenWeather API Key (required for WeatherTool)."
    ) 

    # --- LLM and Embedder Configuration ---
    EMBEDDING_MODEL_NAME: str = "all-mpnet-base-v2"

    RESPONSE_LLM_MODEL: str = Field(
        "mistralai/mistral-7b-instruct-v0.2", 
        description="LLM used for final response generation."
    ) 

    AGENT_LLM_MODEL: str = Field(
        "mistralai/mistral-7b-instruct-v0.2", 
        description="LLM used for tool selection and reasoning."
    ) 
    
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    KEY_COOLDOWN_MINUTES: int = 5 

    # --- VectorDB Configuration & Tool Paths ---
    # These fields are loaded directly from .env since they match exactly
    FAISS_INDEX_PATH: str = str(Path("faiss_index") / "faiss_index.bin")
    METADATA_PATH: str = str(Path("faiss_index") / "documents_metadata.pkl")
    MARKET_PRICES_PATH: str = str(Path("DATA FOR AGENT") / "day_prices.csv")
    
    @property
    def OPENROUTER_KEYS(self) -> List[str]:
        # ... (key logic remains the same)
        keys = []
        if self.OPENROUTER_API_KEYS:
            keys.extend([k.strip() for k in self.OPENROUTER_API_KEYS.split(',') if k.strip()])
        if not keys and self.OPENROUTER_API_KEY:
            keys.append(self.OPENROUTER_API_KEY.strip())
        return keys

# Instantiate the settings object
settings = Settings()