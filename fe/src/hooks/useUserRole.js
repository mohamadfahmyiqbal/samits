import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5002/api';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data?.data?.user) {
        const user = response.data.data.user;
        setUserData(user);

        // Role names from DB are uppercase: SUPERADMIN, ASSET_CONTROLLER, etc.
        if (user.roles && user.roles.length > 0) {
          setUserRole(user.roles[0].role_name || null);
        } else {
          setUserRole(null);
        }

        // Update localStorage untuk sinkronisasi
        localStorage.setItem('userData', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback ke localStorage jika API gagal
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData);
          if (parsed.roles && parsed.roles.length > 0) {
            setUserRole(parsed.roles[0].role_name || null);
          }
          setUserData(parsed);
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Pertama coba baca dari localStorage untuk cepat
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        // Role names from DB are uppercase: SUPERADMIN, ASSET_CONTROLLER, etc.
        if (parsed.roles && parsed.roles.length > 0) {
          setUserRole(parsed.roles[0].role_name || null);
        }
        setUserData(parsed);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }

    // Kemudian fetch dari API untuk sync
    fetchUserProfile();

    // Listen untuk storage changes (jika login di tab lain)
    const handleStorageChange = () => {
      fetchUserProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserProfile]);

  const hasRole = (allowedRoles) => {
    if (!userRole || !allowedRoles) return true; // Default tampilkan jika tidak ada filter
    return allowedRoles.includes(userRole);
  };

  const refreshRole = useCallback(() => {
    setIsLoading(true);
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { userRole, userData, hasRole, isLoading, refreshRole };
};

export default useUserRole;
