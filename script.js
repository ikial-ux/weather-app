import apiKey from './config/config.js';

document.addEventListener('DOMContentLoaded', () => {
    const locationBtn = document.getElementById('location-btn');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', getWeather);
    locationBtn.addEventListener('click', getLocationWeather);
    
    document.getElementById('city').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeather();
    });

    getLocationWeather();
});

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        }, (error) => {
            console.error('Geolocation error:', error);
            document.getElementById('not-found').innerHTML = `
                <p>Location access denied. Please search manually or enable location permissions.</p>
            `;
            document.getElementById('not-found').style.display = 'block';
        });
    } else {
        document.getElementById('not-found').innerHTML = `
            <p>Geolocation is not supported by your browser.</p>
        `;
        document.getElementById('not-found').style.display = 'block';
    }
}

function getWeather() {
    const city = document.getElementById('city').value.trim();
    if (city !== '') {
        fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    }
}

function getWeatherByCoords(lat, lon) {
    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
}


function fetchWeather(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const iconCode = data.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

                document.getElementById('weather-info').innerHTML = `
                    <h3>${data.name}, ${data.sys.country}</h3>
                    <p><img src="${iconUrl}" alt="${data.weather[0].description}"> ${data.weather[0].description}</p>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                    <p>Wind Speed: ${data.wind.speed} m/s</p>
                `;
                document.getElementById('not-found').style.display = 'none';
            } else {
                document.getElementById('weather-info').innerHTML = '';
                document.getElementById('not-found').style.display = 'block';
            }
        })
        .catch(() => {
            document.getElementById('weather-info').innerHTML = '';
            document.getElementById('not-found').style.display = 'block';
        });
}