/**
 * Weather-related type definitions
 * Shared across weather tools and components
 */

export interface WeatherData {
  location: string;
  temperatureF: number;
  condition: string;
  humidityPercent: number;
  windMph: number;
}

export interface WeatherApiResponse {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}
