// TODO: Replace this file with your own API client
// This demo uses Open-Meteo weather API (free, no API key needed)
// See: https://open-meteo.com/en/docs

// TODO: Change to your API's base URL
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";
const WEATHER_URL = "https://api.open-meteo.com/v1";

// --- Type Definitions ---
// TODO: Replace with your own response types

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // province/state
}

export interface CurrentWeather {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

export interface DayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
}

export interface Forecast {
  city: string;
  country: string;
  days: DayForecast[];
}

// --- Helper ---

async function fetchJSON<T>(url: string, timeoutMs = 5000): Promise<T> {
  const resp = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status} ${resp.statusText}`);
  }
  return resp.json() as Promise<T>;
}

// WMO Weather Code → description
// https://open-meteo.com/en/docs#weathervariables
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function weatherDescription(code: number): string {
  return WEATHER_CODES[code] ?? `Unknown (code ${code})`;
}

// --- API Functions ---
// TODO: Replace these functions with your own API calls

export async function searchCities(keyword: string): Promise<City[]> {
  interface GeoResponse {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country: string;
      admin1?: string;
    }>;
  }

  const url = `${GEOCODING_URL}/search?name=${encodeURIComponent(keyword)}&count=5&language=en`;
  const data = await fetchJSON<GeoResponse>(url);

  return (data.results ?? []).map((r) => ({
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export async function getWeather(city: string): Promise<CurrentWeather> {
  const cities = await searchCities(city);
  if (cities.length === 0) {
    throw new Error(`City not found: ${city}`);
  }
  const { name, latitude, longitude, country } = cities[0];

  interface WeatherResponse {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      weather_code: number;
    };
  }

  const url =
    `${WEATHER_URL}/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&timezone=auto`;
  const data = await fetchJSON<WeatherResponse>(url);

  return {
    city: name,
    country,
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    description: weatherDescription(data.current.weather_code),
  };
}

export async function getForecast(
  city: string,
  days: number = 3
): Promise<Forecast> {
  const cities = await searchCities(city);
  if (cities.length === 0) {
    throw new Error(`City not found: ${city}`);
  }
  const { name, latitude, longitude, country } = cities[0];

  interface ForecastResponse {
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      weather_code: number[];
    };
  }

  const url =
    `${WEATHER_URL}/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&timezone=auto&forecast_days=${days}`;
  const data = await fetchJSON<ForecastResponse>(url);

  return {
    city: name,
    country,
    days: data.daily.time.map((date, i) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[i],
      minTemp: data.daily.temperature_2m_min[i],
      description: weatherDescription(data.daily.weather_code[i]),
    })),
  };
}
