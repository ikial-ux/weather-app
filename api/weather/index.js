import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!params.q && (!params.lat || !params.lon)) {
    return NextResponse.json({ error: 'Location (q, lat, lon) is required' }, { status: 400 });
  }

  const baseUrl = 'https://api.openweathermap.org/data/2.5';

  const locationParams = new URLSearchParams();
  locationParams.append('appid', API_KEY);
  locationParams.append('units', 'metric');
  if (params.q) locationParams.append('q', params.q);
  if (params.lat) locationParams.append('lat', params.lat);
  if (params.lon) locationParams.append('lon', params.lon);

  const parseOptions = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/'
  };

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${baseUrl}/weather?${locationParams.toString()}`),
      fetch(`${baseUrl}/forecast?${locationParams.toString()}&cnt=5`)
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    const res = NextResponse.json({ current: currentData, forecast: forecastData });
    res.cookies.set('__vercel_live_token', 'YOUR_TOKEN', parseOptions);

    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
