import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(`${API_BASE}/users/profile`, {
        withCredentials: true,
      });

      if (response.data?.data?.user) {
        const user = response.data.data.user;
        setUserData(user);

        if (user.roles && user.roles.length > 0) {
          setUserRole(user.roles[0].role_name || null);
        }

        localStorage.setItem('userData', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Gagal memuat data user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');

    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData);
        setUserData(user);
        setUserRole(user?.roles?.[0]?.role_name || null);
        setIsLoading(false);
      } catch (_error) {
        fetchUserProfile();
      }
      return;
    }

    fetchUserProfile();
  }, [fetchUserProfile]);

  const hasRole = useCallback((allowedRoles) => {
    if (!userRole || !allowedRoles) return true;
    return allowedRoles.includes(userRole);
  }, [userRole]);

  const refreshRole = useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { userRole, userData, hasRole, isLoading, refreshRole };
};

export default useUserRole;
