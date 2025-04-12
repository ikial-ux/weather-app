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
                    timeout: 30000,
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

// Cambiar las llamadas fetch para usar encodeURIComponent
async function fetchWeatherData(params) {
    showLoader();

    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/weather?${query}`);
        if (!response.ok) throw new Error('API response error');

        const { current, forecast } = await response.json();

        console.log('Current Data:', current);
        console.log('Forecast Data:', forecast);

        displayWeatherData(current);
        displayForecast(forecast);

    } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message || 'Failed to fetch weather data');
    } finally {
        hideLoader();
    }
}



function displayWeatherData(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;


    //setWeatherTheme(data.weather[0].main);

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

function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    const todayDate = new Date().getDate();

    const dailyForecast = {};

    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();

        // Skip today
        if (day === todayDate) return;

        const key = date.toDateString();
        if (!dailyForecast[key]) {
            dailyForecast[key] = item;
        }
    });

    Object.values(dailyForecast).slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-card';
        dayElement.innerHTML = `
            <div class="forecast-day">
                ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" 
                 alt="${day.weather[0].description}">
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div class="forecast-description">${day.weather[0].main}</div>
        `;
        forecastContainer.appendChild(dayElement);
    });
}


function handleGeolocationError(error) {
    console.error('Geolocation error:', error);
    let message = 'Failed to get location. Please try again.';

    switch (error.code) {
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
    document.getElementById('forecast-container').innerHTML = '';
    document.getElementById('not-found').style.display = 'none';
    document.getElementById('weather-background').style.display = 'none';
    setWeatherTheme('Clear');
}

function showError(message) {
    document.getElementById('not-found').innerHTML = `<p>${message}</p>`;
    document.getElementById('not-found').style.display = 'block';
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function setWeatherTheme(condition) {
    const themes = {
        Clear: {
            gradient: 'var(--sunny-gradient)',
            image: 'url("images/sunny.png")'
        },
        Clouds: {
            gradient: 'var(--cloudy-gradient)',
            image: 'url("images/cloudy.png")'
        },
        Rain: {
            gradient: 'var(--rainy-gradient)',
            image: 'url("images/rainy.png")'
        },
        Thunderstorm: {
            gradient: 'linear-gradient(135deg, #2c3e50, #3498db)',
            image: 'url("images/stormy.png")'
        },
        Snow: {
            gradient: 'linear-gradient(135deg, #e6f4f1, #b9d7ea)',
            image: 'url("images/snowy.png")'
        },
        Drizzle: {
            gradient: 'linear-gradient(135deg, #6dd5ed, #2193b0)',
            image: 'url("images/rainy.png")'
        }

    };

    const theme = themes[condition] || themes.Clear;
    document.body.style.background = theme.gradient;

    const backgroundElement = document.getElementById('weather-background');
    backgroundElement.style.backgroundImage = theme.image;
    backgroundElement.style.display = 'block';

    const bgElement = document.getElementById('weather-background');
    bgElement.style.opacity = condition === 'Clear' ? '0.4' : '0.6';
}