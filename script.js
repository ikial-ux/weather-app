import apiKey from './config/config.js'; 

function getWeather() {
    const city = document.getElementById('city').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const iconCode = data.weather[0].icon;
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

                const weatherData = `
                    <h3>${data.name}, ${data.sys.country}</h3>
                    <p><img src="${iconUrl}" alt="${data.weather[0].description}"> ${data.weather[0].description}</p>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                    <p>Wind Speed: ${data.wind.speed} m/s</p>
                `;
                document.getElementById('weather-info').innerHTML = weatherData;
                document.getElementById('not-found').style.display = 'none';
            } else {
                document.getElementById('weather-info').innerHTML = '';
                document.getElementById('not-found').style.display = 'block'; 
            }
        })
        .catch(error => {
            document.getElementById('weather-info').innerHTML = '';
            document.getElementById('not-found').style.display = 'block'; 
        });
}
document.getElementById('search-btn').addEventListener('click', getWeather);