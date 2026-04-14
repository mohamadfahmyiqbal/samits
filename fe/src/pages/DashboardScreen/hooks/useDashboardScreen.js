import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { encryptPath } from '../../../routes/pathEncoding';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:5002/api';

export const useDashboardScreen = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [serverActivities, setServerActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [pieStatusData, setPieStatusData] = useState({ labels: [], datasets: [] });
  const [pieCategoryData, setPieCategoryData] = useState({ labels: [], datasets: [] });

  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const controller = new AbortController();

    const fetchMaintenanceAlerts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/maintenance-alerts`, {
          method: 'GET',
          credentials: 'include',
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          navigate('/login', { replace: true });
          return;
        }

        const json = await response.json();
        if (response.ok && json?.data) {
          setServerActivities(json.data);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('API error:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceAlerts();
    return () => controller.abort();
  }, [navigate]);

  useEffect(() => {
    const statusCounts = { Normal: 0, Abnormal: 0 };
    const categoryCounts = {};

    serverActivities.forEach((item) => {
      if (item.result === 'Abnormal') {
        statusCounts.Abnormal += 1;
      } else {
        statusCounts.Normal += 1;
      }

      const category = item.category || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    setPieStatusData({
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: ['#28a745', '#dc3545'],
        },
      ],
    });

    setPieCategoryData({
      labels: Object.keys(categoryCounts),
      datasets: [
        {
          data: Object.values(categoryCounts),
          backgroundColor: ['#007bff', '#ffc107', '#17a2b8', '#6f42c1'],
        },
      ],
    });
  }, [serverActivities]);

  const filteredAlerts = serverActivities.filter((item) => {
    if (filterStatus === 'normal') return item.result !== 'Abnormal';
    if (filterStatus === 'abnormal') return item.result === 'Abnormal';
    return true;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirst, indexOfLast);

  return {
    socket,
    isConnected,
    loading,
    filterStatus,
    setFilterStatus,
    pieStatusData,
    pieCategoryData,
    currentAlerts,
    indexOfFirst,
    currentPage,
    totalPages: Math.ceil(filteredAlerts.length / itemsPerPage),
    paginate: setCurrentPage,
    goToSummary: () => navigate(`/${encryptPath('summary')}`),
  };
};
