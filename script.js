// script.js
document.addEventListener('DOMContentLoaded', () => {
    const locationBtn = document.getElementById('location-btn');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', getWeather);
    locationBtn.addEventListener('click', getLocationWeather);
    
    document.getElementById('city').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeather();
    });
});

async function getLocationWeather() {
    clearDisplay();
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });

        const { latitude, longitude } = position.coords;
        await fetchWeatherData({ lat: latitude, lon: longitude });
    } catch (error) {
        handleGeolocationError(error);
    }
}

async function getWeather() {
    const city = document.getElementById('city').value.trim();
    clearDisplay();

    if (!city) {
        showError('Please enter a city name');
        return;
    }

    await fetchWeatherData({ city });
}

async function fetchWeatherData(params) {
    try {
        const response = await fetch(`/api/weather?${new URLSearchParams(params)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.cod === 200) {
            displayWeatherData(data);
        } else {
            throw new Error(data.message || 'Unknown error occurred');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message || 'Failed to fetch weather data');
    }
}

function displayWeatherData(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    document.getElementById('weather-info').innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <p><img src="${iconUrl}" alt="${data.weather[0].description}"> 
        ${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Feels like: ${data.main.feels_like}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

function handleGeolocationError(error) {
    console.error('Geolocation error:', error);
    let message = 'Failed to get location. Please try again.';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location access denied. Enable permissions in browser settings.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
    }
    
    showError(message);
}

function clearDisplay() {
    document.getElementById('weather-info').innerHTML = '';
    document.getElementById('not-found').style.display = 'none';
}

function showError(message) {
    document.getElementById('not-found').innerHTML = `<p>${message}</p>`;
    document.getElementById('not-found').style.display = 'block';
}