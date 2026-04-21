import { useState, useEffect } from 'react';
import api from '../api/client';

export default function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/locations')
      .then(res => setLocations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { locations, loading };
}
