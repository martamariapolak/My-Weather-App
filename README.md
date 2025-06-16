# My-Weather-App
Project Overview
This Weather App allows users to check the current weather for any city. It uses the Open-Meteo Geocoding API to find location coordinates and then fetches temperature using the Open-Meteo Weather Forecast API.

App Features
Form to enter a city name
Display of temperature
Error message if city is not found
Supports multiple city searches
How to Navigate & Run the Code
Clone this repository:
git clone https://github.com/martamariapolak/My-Weather-App.git
Navigate to the project folder:
cd My-Weather-App.git
Open index.html in your browser to start the app.
Project Files
src/index.html: Structure of the web page
src/app.tsx:TypeScript main file
src/components/WeatherFeatcher.tsx: logic for fetching and displaying weather data
src/components/FiveDaysForecast.tsx: logic for fetching and displaying  5 days forward weather data
src/style.css: Styling
What I Learned
How to use APIs in TypeScript
Handling user input and asynchronous requests
Error handling and user feedback
