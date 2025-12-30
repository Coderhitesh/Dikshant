import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function useAuth(token) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://192.168.1.9:5001/api/auth/profile-details",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );
     
      setData(response.data);
    } catch (err) {
              console.log(err)

      if (err.name === "CanceledError") return;

      setData(null);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetch = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    user: data,
    loading,
    error,
    isAuthenticated: Boolean(data),
    refetch,
  };
}
