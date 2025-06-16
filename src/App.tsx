import React from 'react';
import './styles/App.css';
import WeatherFetcher from './components/WeatherFetcher';
import FiveDayForecast from './components/FiveDaysForecast';


function App() {
  return (
    
    <div className="App">      
    <WeatherFetcher />
    <FiveDayForecast />
    </div>

  );
}

export default App;