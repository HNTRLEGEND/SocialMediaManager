import axios from 'axios';

const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherResult {
  temp: number;
  feels_like: number;
  wind_speed: number;
  wind_deg: number;
}

export async function getCurrentWeather(lat: number, lon: number) {
  try {
    const apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key fehlt');
    }

    const response = await axios.get(OPEN_WEATHER_URL, {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric',
        lang: 'de',
      },
    });

    const data = response.data;
    return {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
    } as WeatherResult;
  } catch (error) {
    console.warn('Weather API Fehler', error);
    return null;
  }
}
