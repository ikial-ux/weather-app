function getWeather() {
    const city = document.getElementById('city').value;
    const apiKey = 'REDACTED';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    document.getElementById('not-found').style.display = 'none';

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
                document.getElementById('not-found').style.display = 'block';
                document.getElementById('weather-info').innerHTML = '';
            }
        })
        .catch(error => {
            document.getElementById('not-found').style.display = 'block';
            document.getElementById('weather-info').innerHTML = ''; 
        });
}
