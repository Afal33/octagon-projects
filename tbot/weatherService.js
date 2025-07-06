const axios = require('axios');

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const getForecast = async (city = 'Irkutsk') => {
  const url = `${BASE_URL}?q=${city}&units=metric&lang=ru&appid=${API_KEY}`;
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error('Ошибка при запросе прогноза погоды:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    throw error; // пробрасываем ошибку дальше
  }
};
console.log('API KEY:', API_KEY);

module.exports = { getForecast };
