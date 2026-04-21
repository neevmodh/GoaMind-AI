import { useState, useEffect } from 'react';
import api from '../api/client';

export default function useWeather(location = 'Goa') {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    api.get(`/weather/${location}`)
      .then(res => setWeather(res.data.weather))
      .catch(console.error);
  }, [location]);

  return { weather };
}
