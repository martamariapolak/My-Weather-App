import React, { useState } from 'react';

const WeatherFetcher: React.FC = () => {
  // State variables to keep track of user input and API results
  const [city, setCity] = useState('');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to get coordinates from city name using Open-Meteo Geocoding API
  async function getCoordinates(cityName: string): Promise<{ latitude: number; longitude: number }> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }
    const data = await response.json();
    // Additional check if cityName is found in the results (case-insensitive)
    if (
      !data.results ||
      data.results.length === 0 ||
      !data.results[0].name ||
      data.results[0].name.toLowerCase() !== cityName.trim().toLowerCase()
    ) {
      throw new Error('Nie znaleziono miasta. Sprawdź poprawność wpisanej nazwy.');
    }
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
    };
  }

  // Function to get temperature from coordinates using Open-Meteo Weather API
  async function getTemperature(latitude: number, longitude: number): Promise<number> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    if (!data.current_weather) {
      throw new Error('Weather data not found for this location');
    }
    return data.current_weather.temperature;
  }

  // Handler for the form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevents page refresh
    setError(null); // Clear previous errors
    setTemperature(null); // Clear previous temperature
    setLoading(true); // Show loading state

    // Check for empty city input
    if (!city.trim()) {
      setError('Wpisz nazwę miasta.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Get coordinates for the city
      const coords = await getCoordinates(city);
      // Step 2: Use coordinates to get temperature
      const temp = await getTemperature(coords.latitude, coords.longitude);
      setTemperature(temp); // Update state with fetched temperature
    } catch (err: any) {
      setError(err.message || 'Coś poszło nie tak');
    } finally {
      setLoading(false); // Hide loading state
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "1.5rem", background: "#f9f9f9", borderRadius: "8px" }}>
      <h2>Weather Checker (Open-Meteo)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Wpisz nazwę miasta"
          style={{ padding: "0.5rem", width: "70%", marginRight: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem" }}>Pobierz pogodę</button>
      </form>
      {loading && <p>Ładowanie...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {temperature !== null && !loading && !error && (
        <p>
          Aktualna temperatura w <b>{city}</b>: <b>{temperature}°C</b>
        </p>
      )}
    </div>
  );
};

export default WeatherFetcher;