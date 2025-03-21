import apiKey from './config/config.js';

document.addEventListener('DOMContentLoaded', () => {
    const locationBtn = document.getElementById('location-btn');
    const searchBtn = document.getElementById('search-btn');
    
    // Event listeners
    searchBtn.addEventListener('click', getWeather);
    locationBtn.addEventListener('click', getLocationWeather);
    
    // Enter key handler
    document.getElementById('city').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeather();
    });
});

// Improved location weather function
function getLocationWeather() {
    // Clear previous results and errors
    document.getElementById('weather-info').innerHTML = '';
    document.getElementById('not-found').style.display = 'none';

    if (navigator.geolocation) {
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: 10000,  // 10-second timeout
            maximumAge: 60000  // Cache for 1 minute
        };

        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            error => {
                let errorMessage = 'Failed to get location. Please try again.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Enable permissions in browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                }
                
                document.getElementById('not-found').innerHTML = `
                    <p>${errorMessage}</p>
                `;
                document.getElementById('not-found').style.display = 'block';
            },
            geoOptions
        );
    } else {
        document.getElementById('not-found').innerHTML = `
            <p>Geolocation is not supported by your browser.</p>
        `;
        document.getElementById('not-found').style.display = 'block';
    }
}

// Enhanced weather fetching with error handling
function getWeather() {
    const city = document.getElementById('city').value.trim();
    if (city === '') {
        document.getElementById('not-found').innerHTML = `
            <p>Please enter a city name.</p>
        `;
        document.getElementById('not-found').style.display = 'block';
        return;
    }
    
    // Clear previous results
    document.getElementById('weather-info').innerHTML = '';
    document.getElementById('not-found').style.display = 'none';

    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
}

function getWeatherByCoords(lat, lon) {
    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
}

// Improved fetch function with error handling
function fetchWeather(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.cod === 200) {
                displayWeatherData(data);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            document.getElementById('weather-info').innerHTML = '';
            document.getElementById('not-found').innerHTML = `
                <p>${error.message || 'Failed to fetch weather data'}</p>
            `;
            document.getElementById('not-found').style.display = 'block';
        });
}

// Separate display function
function displayWeatherData(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    document.getElementById('weather-info').innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <p><img src="${iconUrl}" alt="${data.weather[0].description}"> 
        ${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Feels like: ${data.main.feels_like}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    document.getElementById('not-found').style.display = 'none';
}