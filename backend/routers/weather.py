import os
import requests
from fastapi import APIRouter
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

router = APIRouter(prefix="/weather", tags=["Weather"])

# Get API key from .env file
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# Default location: Hyderabad
DEFAULT_LAT = 17.3850
DEFAULT_LON = 78.4867


@router.get("/")
def get_weather(lat: float = None, lon: float = None):
    """
    If user does not give any location → show Hyderabad weather
    If user gives lat & lon → show that location's weather
    """

    # Use default Hyderabad coordinates if no values provided
    if lat is None or lon is None:
        lat, lon = DEFAULT_LAT, DEFAULT_LON

    # Build API URL
    url = (
        f"https://api.openweathermap.org/data/2.5/weather?"
        f"lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    )

    # Fetch weather data from OpenWeatherMap
    weather_data = requests.get(url).json()

    return weather_data
