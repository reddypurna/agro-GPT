import { useEffect, useMemo, useState } from 'react';
import { FaCloudSun, FaExclamationTriangle } from 'react-icons/fa';
import './Chat.css';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

const WeatherWidget = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const coords = useMemo(() => {
    if (!location) return null;
    return {
      lat: Number(location.latitude.toFixed(4)),
      lon: Number(location.longitude.toFixed(4))
    };
  }, [location]);

  useEffect(() => {
    if (!coords) return;

    const controller = new AbortController();
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({
          latitude: coords.lat,
          longitude: coords.lon,
          current_weather: 'true',
          timezone: 'auto'
        });

        const response = await fetch(`${WEATHER_API}?${params.toString()}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error('Unable to fetch weather');
        }
        const data = await response.json();
        setWeather(data.current_weather);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Live weather unavailable right now.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    return () => controller.abort();
  }, [coords]);

  const description = useMemo(() => {
    if (!weather?.weathercode) return '';
    const code = weather.weathercode;
    if ([0].includes(code)) return 'Clear sky';
    if ([1, 2, 3].includes(code)) return 'Partly cloudy';
    if ([45, 48].includes(code)) return 'Foggy';
    if ([51, 53, 55].includes(code)) return 'Drizzle';
    if ([61, 63, 65, 66, 67].includes(code)) return 'Rain showers';
    if ([71, 73, 75, 77].includes(code)) return 'Snowfall';
    if ([80, 81, 82].includes(code)) return 'Rain showers';
    if ([95, 96, 99].includes(code)) return 'Thunderstorms';
    return 'Mixed conditions';
  }, [weather]);

  return (
    <div className="weather-card">
      <div className="weather-header">
        <FaCloudSun />
        <span>Live Weather</span>
      </div>
      {!location && (
        <div className="weather-placeholder">
          <FaExclamationTriangle />
          Allow location access to see real-time weather for your farm.
        </div>
      )}
      {location && loading && <div className="weather-meta">Fetching current weather...</div>}
      {location && !loading && error && <div className="weather-error">{error}</div>}
      {location && !loading && !error && weather && (
        <div className="weather-body">
          <div className="weather-temp">
            {Math.round(weather.temperature)}
            <span>°C</span>
          </div>
          <div className="weather-details">
            <p>{description}</p>
            <p>Wind: {Math.round(weather.windspeed)} km/h</p>
            <p>
              Lat {coords.lat}, Lon {coords.lon}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;






