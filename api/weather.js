import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  // Construye la URL para OpenWeatherMap
  const url = new URL(`https://api.openweathermap.org/data/2.5/${params.type === 'forecast' ? 'forecast' : 'weather'}`);
  
  // Añade parámetros
  url.searchParams.append('appid', API_KEY);
  url.searchParams.append('units', 'metric');
  if (params.q) url.searchParams.append('q', params.q);
  if (params.lat) url.searchParams.append('lat', params.lat);
  if (params.lon) url.searchParams.append('lon', params.lon);
  if (params.type === 'forecast') url.searchParams.append('cnt', '5');

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}