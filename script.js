function getWeather() {
    const city = document.getElementById('city').value;
    const apiKey = 'REDACTED'; // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const weatherData = `
                    <h3>${data.name}, ${data.sys.country}</h3>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Weather: ${data.weather[0].description}</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                    <p>Wind Speed: ${data.wind.speed} m/s</p>
                `;
                document.getElementById('weather-info').innerHTML = weatherData;
            } else {
                document.getElementById('weather-info').innerHTML = `<p class="error">City not found!</p>`;
            }
        })
        .catch(error => {
            document.getElementById('weather-info').innerHTML = `<p class="error">Error fetching weather data!</p>`;
        });
}
