// api/weather.js
export default async (req, res) => {
    const { city, lat, lon, type = 'weather' } = req.query;
    
    try {
        const endpoint = type === 'forecast' ? 'forecast' : 'weather';
        const url = new URL(`https://api.openweathermap.org/data/2.5/${endpoint}`);
        
        url.searchParams.set('appid', process.env.API_KEY);
        url.searchParams.set('units', 'metric');

        if (city) {
            url.searchParams.set('q', city);
        } else {
            url.searchParams.set('lat', lat);
            url.searchParams.set('lon', lon);
        }

        const response = await fetch(url);
        const data = await response.json();
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            cod: 500,
            message: 'Internal server error' 
        });
    }
};