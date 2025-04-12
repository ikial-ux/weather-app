document.addEventListener('DOMContentLoaded', () => {
    const locationBtn = document.getElementById('location-btn');
    const searchBtn = document.getElementById('search-btn');

    searchBtn.addEventListener('click', getWeather);
    locationBtn.addEventListener('click', getLocationWeather);

    document.getElementById('city').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeather();
    });
});

const API_KEY = "43f9134aeeca5ec6360bff537581c4f6";

async function getLocationWeather() {
    clearDisplay();

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 60000
            });
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

    await fetchWeatherData({ q: city });
}

async function fetchWeatherData(params) {
    showLoader();

    try {
        const query = new URLSearchParams({
            ...params,
            appid: API_KEY,
            units: 'metric'
        }).toString();

        const [currentRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}`)
        ]);

        if (!currentRes.ok || !forecastRes.ok) throw new Error("API response error");

        const current = await currentRes.json();
        const forecast = await forecastRes.json();

        console.log('Current Data:', current);
        console.log('Forecast Data:', forecast);

        displayWeatherData(current);
        displayForecast(forecast);

        document.querySelector('.weather-container').classList.add('expanded');

    } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message || 'Failed to fetch weather data');
    } finally {
        hideLoader();
    }
}


function displayWeatherData(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    setWeatherTheme(data.weather[0].main);

    document.getElementById('weather-info').innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <p><img src="${iconUrl}" alt="${data.weather[0].description}"> 
        ${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Feels like: ${data.main.feels_like}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    document.getElementById('weather-info').style.display = 'block';
}


function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    const todayISO = new Date().toISOString().split('T')[0];
    const uniqueDays = new Set();
    const filteredForecast = [];

    for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const isoDate = date.toISOString().split('T')[0];

        if (isoDate === todayISO) continue;
        if (!uniqueDays.has(isoDate)) {
            uniqueDays.add(isoDate);
            filteredForecast.push(item);
        }

        if (filteredForecast.length === 5) break;
    }

    filteredForecast.forEach(day => {
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

    forecastContainer.style.display = 'flex';
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
    document.getElementById('weather-info').style.display = 'none';
    document.getElementById('forecast-container').style.display = 'none';
    document.querySelector('.weather-container').classList.remove('expanded');
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
            gradient: 'var(--snowy-gradient)',
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
    backgroundElement.style.width = '100%';
    backgroundElement.style.height = '140%';
    backgroundElement.style.opacity = condition === 'Clear' ? '0.4' : '0.6';

    const rainOverlay = document.querySelector('.rain-overlay');
    if (condition === 'Rain') {
        createRainDrops(150);
        rainOverlay.style.display = 'block';
    } else {
        rainOverlay.style.display = 'none';
    }

    if (condition === 'Snow') {
        addSnowAnimation();
    } else {
        removeSnowAnimation();
    }
}

function createRainDrops(numDrops = 100) {
    const rainOverlay = document.querySelector('.rain-overlay');
    rainOverlay.innerHTML = "";

    for (let i = 0; i < numDrops; i++) {
        const drop = document.createElement('div');
        drop.classList.add('raindrop');

        drop.style.left = Math.random() * 100 + '%';
        const duration = Math.random() * 0.5 + 0.5;
        drop.style.animationDuration = duration + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';

        rainOverlay.appendChild(drop);
    }
}

function addSnowAnimation() {
    if (document.querySelector('.snowflakes')) return;

    const snowContainer = document.createElement('div');
    snowContainer.classList.add('snowflakes');

    for (let i = 0; i < 20; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.textContent = '❄';

        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (5 + Math.random() * 10) + 's';
        snowflake.style.animationDelay = Math.random() * 10 + 's';
        snowflake.style.fontSize = (10 + Math.random() * 20) + 'px';

        snowContainer.appendChild(snowflake);
    }

    document.body.appendChild(snowContainer);
}

function removeSnowAnimation() {
    const snowContainer = document.querySelector('.snowflakes');
    if (snowContainer) {
        snowContainer.parentNode.removeChild(snowContainer);
    }
}
