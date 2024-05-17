import axios from 'axios';

const OPENWEATHERMAP_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

const weatherConditions = new Map();
    weatherConditions.set(804, { description: "overcast clouds: 85-100%", icon: "/svg/cloudy.svg", filled: "/svg-filled/filled-cloudy.svg" });
    weatherConditions.set(803, { description: "broken clouds: 51-84%", icon: "/svg/partly-cloudy-day.svg", filled: "/svg-filled/filled-partly-cloudy-day.svg" });
    weatherConditions.set(802, { description: "scattered clouds: 25-50%", icon: "/svg/cloud-up.svg", filled: "/svg-filled/filled-cloud-up.svg" });
    weatherConditions.set(801, { description: "few clouds: 11-25%", icon: "/svg/cloud-up.svg", filled: "/svg-filled/filled-cloud-up.svg" });
    weatherConditions.set(800, { description: "clear sky", icon: "/svg/clear-day.svg", filled: "/svg-filled/filled-clear-day.svg" });
    weatherConditions.set(781, { description: "tornado", icon: "/svg/tornado.svg", filled: "/svg-filled/filled-tornado.svg" });
    weatherConditions.set(771, { description: "squalls", icon: "/svg/wind-alert.svg", filled: "/svg-filled/filled-wind-alert.svg" });
    weatherConditions.set(762, { description: "volcanic ash", icon: "/svg/dust-wind.svg", filled: "/svg-filled/filled-dust-wind.svg" });
    weatherConditions.set(761, { description: "dust", icon: "/svg/dust.svg", filled: "/svg-filled/filled-dust.svg" });
    weatherConditions.set(751, { description: "sand", icon: "/svg/pollen.svg", filled: "/svg-filled/filled-pollen.svg" });
    weatherConditions.set(741, { description: "fog", icon: "/svg/fog.svg", filled: "/svg-filled/filled-fog.svg" });
    weatherConditions.set(731, { description: "sand/dust whirls", icon: "/svg/hurricane.svg", filled: "/svg-filled/filled-hurricane.svg" });
    weatherConditions.set(721, { description: "haze", icon: "/svg/haze.svg", filled: "/svg-filled/filled-haze.svg" });
    weatherConditions.set(711, { description: "smoke", icon: "/svg/smoke.svg", filled: "/svg-filled/filled-smoke.svg" });
    weatherConditions.set(701, { description: "mist", icon: "/svg/mist.svg", filled: "/svg-filled/filled-mist.svg" });
    weatherConditions.set(622, { description: "heavy shower snow", icon: "/svg/extreme-day-snow.svg", filled: "/svg-filled/filled-extreme-day-snow.svg" });
    weatherConditions.set(621, { description: "shower snow", icon: "/svg/snow.svg", filled: "/svg-filled/filled-snow.svg" });
    weatherConditions.set(620, { description: "light shower snow", icon: "/svg/snow.svg", filled: "/svg-filled/filled-snow.svg" });
    weatherConditions.set(616, { description: "rain and snow", icon: "/svg/snowflake.svg", filled: "/svg-filled/filled-snowflake.svg" });
    weatherConditions.set(615, { description: "light rain and snow", icon: "/svg/extreme-sleet.svg", filled: "/svg-filled/filled-extreme-sleet.svg" });
    weatherConditions.set(613, { description: "shower sleet", icon: "/svg/sleet.svg", filled: "/svg-filled/filled-sleet.svg" });
    weatherConditions.set(612, { description: "light shower sleet", icon: "/svg/sleet.svg", filled: "/svg-filled/filled-sleet.svg" });
    weatherConditions.set(611, { description: "sleet", icon: "/svg/sleet.svg", filled: "/svgfilled-sleet.svg" });
    weatherConditions.set(602, { description: "heavy snow", icon: "/svg/snowflake.svg", filled: "/svg-filled/filled-snowflake.svg" });
    weatherConditions.set(601, { description: "snow", icon: "/svg/snow.svg", filled: "/svg-filled/filled-snow.svg" });
    weatherConditions.set(600, { description: "light snow", icon: "/svg/snow.svg", filled: "/svg-filled/filled-snow.svg" });
    weatherConditions.set(531, { description: "ragged shower rain", icon: "/svg/raindrops.svg", filled: "/svg-filled/filled-raindrops.svg" });
    weatherConditions.set(522, { description: "heavy intensity shower rain", icon: "/svg/extreme-rain.svg", filled: "/svg-filled/filled-extreme-rain.svg" });
    weatherConditions.set(521, { description: "shower rain", icon: "/svg/rain.svg", filled: "/svg-filled/filled-rain.svg" });
    weatherConditions.set(520, { description: "light intensity shower rain", icon: "/svg/drizzle.svg", filled: "/svg-filled/filled-drizzle.svg" });
    weatherConditions.set(511, { description: "freezing rain", icon: "/svg/overcast-hail.svg", filled: "/svg-filled/filled-overcast-hail.svg" });
    weatherConditions.set(504, { description: "extreme rain", icon: "/svg/extreme-rain.svg", filled: "/svg-filled/filled-extreme-rain.svg" });
    weatherConditions.set(503, { description: "very heavy rain", icon: "/svg/extreme-rain.svg", filled: "/svg-filled/filled-extreme-rain.svg" });
    weatherConditions.set(502, { description: "heavy intensity rain", icon: "/svg/extreme-rain.svg", filled: "/svg-filled/filled-extreme-rain.svg" });
    weatherConditions.set(501, { description: "moderate rain", icon: "/svg/rain.svg", filled: "/svg-filled/filled-rain.svg" });
    weatherConditions.set(500, { description: "light rain", icon: "/svg/drizzle.svg", filled: "/svg-filled/filled-drizzle.svg" });
    weatherConditions.set(321, { description: "shower drizzle", icon: "/svg/drizzle.svg", filled: "/svg-filled/filled-drizzle.svg" });
    weatherConditions.set(314, { description: "heavy shower rain and drizzle", icon: "/svg/extreme-rain.svg", filled: "/svg-filled/filled-extreme-rain.svg" });
    weatherConditions.set(313, { description: "shower rain and drizzle", icon: "/svg/extreme-rain.svg", filled: "/svg-filled/filled-extreme-rain.svg" });
    weatherConditions.set(312, { description: "heavy intensity drizzle rain", icon: "/svg/extreme-day-drizzle.svg", filled: "/svg-filled/filled-extreme-day-drizzle.svg" });
    weatherConditions.set(311, { description: "drizzle rain", icon: "/svg/drizzle.svg", filled: "/svg-filled/filled-drizzle.svg" });
    weatherConditions.set(310, { description: "light intensity drizzle rain", icon: "/svg/extreme-day-drizzle.svg", filled: "/svg-filled/filled-extreme-day-drizzle.svg" });
    weatherConditions.set(302, { description: "heavy intensity drizzle", icon: "/svg/extreme-day-drizzle.svg", filled: "/svg-filled/filled-extreme-day-drizzle.svg" });
    weatherConditions.set(301, { description: "drizzle", icon: "/svg/drizzle.svg", filled: "/svg-filled/filled-drizzle.svg" });
    weatherConditions.set(300, { description: "light intensity drizzle", icon: "/svg/drizzle.svg", filled: "/svg-filled/filled-drizzle.svg" });
    weatherConditions.set(232, { description: "thunderstorm with heavy drizzle", icon: "/svg/thunderstorms-extreme-rain.svg", filled: "/svg-filled/filled-thunderstorms-extreme-rain.svg" });
    weatherConditions.set(231, { description: "thunderstorm with drizzle", icon: "/svg/thunderstorms-rain.svg", filled: "/svg-filled/filled-thunderstorms-rain.svg" });
    weatherConditions.set(230, { description: "thunderstorm with light drizzle", icon: "/svg/thunderstorms-rain.svg", filled: "/svg-filled/filled-thunderstorms-rain.svg" });
    weatherConditions.set(221, { description: "ragged thunderstorm", icon: "/svg/thunderstorms.svg", filled: "/svg-filled/filled-thunderstorms.svg" });
    weatherConditions.set(212, { description: "heavy thunderstorm", icon: "/svg/thunderstorms-extreme.svg", filled: "/svg-filled/filled-thunderstorms-extreme.svg" });
    weatherConditions.set(211, { description: "thunderstorm", icon: "/svg/thunderstorms.svg", filled: "/svg-filled/filled-thunderstorms.svg" });
    weatherConditions.set(210, { description: "light thunderstorm", icon: "/svg/thunderstorms.svg", filled: "/svg-filled/filled-thunderstorms.svg" });
    weatherConditions.set(202, { description: "thunderstorm with heavy rain", icon: "/svg/thunderstorms-night-extreme-rain.svg", filled: "/svg-filled/filled-thunderstorms-night-extreme-rain.svg" });
    weatherConditions.set(201, { description: "thunderstorm with rain", icon: "/svg/thunderstorms-rain.svg", filled: "/svg-filled/filled-thunderstorms-rain.svg" });
    weatherConditions.set(200, { description: "thunderstorm with light rain", icon: "/svg/thunderstorms-rain.svg", filled: "/svg-filled/filled-thunderstorms-rain.svg" });


export async function getWeatherIcon(latitude: number, longitude: number, fillType: 'icon' | 'filled'): Promise<{icon: string | null, description: string | null}> {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}`);
        const weatherCode = response.data.weather[0].id;
        const weatherCondition = weatherConditions.get(weatherCode);

        if (weatherCondition) {
            return {
                icon: weatherCondition[fillType],
                description: weatherCondition.description
            };
        } else {
            // console.log(`Weather code ${weatherCode} not found in weatherConditions map.`);
            return {
                icon: null,
                description: null
            };
        }
    } catch (error) {
        console.error(`Failed to get weather data: ${error}`);
        return {
            icon: null,
            description: null
        };
    }
}

export async function getWeatherForecast(latitude: number, longitude: number, fillType: 'icon' | 'filled'): Promise<Array<{icon: string | null, description: string | null, temp: number | null, date: number | null}>> {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
        const forecastList = response.data.list;

        const currentHour = new Date().getHours();

        // Include the first forecast and filter the rest of the list to only include forecasts where the hour is within 1 hour of the current hour
        const dailyForecasts = [forecastList[0], ...forecastList.slice(1).filter((forecast: any) => {
            const forecastHour = new Date(forecast.dt * 1000).getHours();

            return Math.abs(forecastHour - currentHour) <= 1;
        })];

        return dailyForecasts.map((forecast: any) => {
            const weatherCode = forecast.weather[0].id;
            const weatherCondition = weatherConditions.get(weatherCode);
            const temp = forecast.main.temp;
            const dt = forecast.dt;

            if (weatherCondition) {
                return {
                    icon: weatherCondition[fillType],
                    description: weatherCondition.description,
                    temp: temp,
                    date: dt
                };
            } else {
                console.log(`Weather code ${weatherCode} not found in weatherConditions map.`);
                return {
                    icon: null,
                    description: null,
                    temp: null,
                    date: null
                };
            }
        });
    } catch (error) {
        console.error(`Failed to get weather forecast: ${error}`);
        return [];
    }
}