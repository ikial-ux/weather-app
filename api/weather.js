// api/weather.js
export default async (req, res) => {
    const { city, lat, lon } = req.query;
    
    try {
        const url = new URL('https://api.openweathermap.org/data/2.5/weather');
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
        
        if (data.cod !== 200) {
            return res.status(400).json(data);
        }
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            cod: 500,
            message: 'Internal server error' 
        });
    }
};