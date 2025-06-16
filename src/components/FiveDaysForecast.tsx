import React, { useState } from 'react';

type ForecastDay = {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
};

const weatherDescriptions: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const FiveDayForecast: React.FC = () => {
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch coordinates for a city
  async function fetchCoordinates(cityName: string) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('City not found. Please check the spelling.');
    }
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
    };
  }

  // Fetch 5-day forecast
  async function fetchForecast(lat: number, lon: number): Promise<ForecastDay[]> {
    // The Open-Meteo API returns up to 7 days by default
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather forecast');
    }
    const data = await response.json();
    if (!data.daily || !data.daily.time || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min || !data.daily.weathercode) {
      throw new Error('Incomplete weather data received');
    }

    // Prepare an array for the first 5 days
    const days: ForecastDay[] = [];
    for (let i = 0; i < 5; i++) {
      days.push({
        date: data.daily.time[i],
        temperatureMax: data.daily.temperature_2m_max[i],
        temperatureMin: data.daily.temperature_2m_min[i],
        weatherCode: data.daily.weathercode[i],
      });
    }
    return days;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setForecast(null);

    if (!city.trim()) {
      setError('Please enter a city name.');
      return;
    }
    setLoading(true);
    try {
      const coords = await fetchCoordinates(city);
      const forecastData = await fetchForecast(coords.latitude, coords.longitude);
      setForecast(forecastData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: 450,
      margin: '2rem auto',
      padding: '2rem',
      background: '#f7fafc',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center' }}>5-Day Weather Forecast</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={e => setCity(e.target.value)}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            flex: 1,
            marginRight: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button type="submit" style={{
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          borderRadius: '4px',
          border: 'none',
          background: '#0077ff',
          color: '#fff',
          cursor: 'pointer'
        }}>Get Forecast</button>
      </form>
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {forecast && (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e8f0fe' }}>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #dde' }}>Date</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #dde' }}>Min (°C)</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #dde' }}>Max (°C)</th>
              <th style={{ padding: '0.5rem', borderBottom: '1px solid #dde' }}>Weather</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((day, idx) => (
              <tr key={idx}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{day.date}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', color: '#0077ff' }}>{day.temperatureMin}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', color: '#d32f2f' }}>{day.temperatureMax}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  {weatherDescriptions[day.weatherCode] ?? 'Unknown'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FiveDayForecast;