// hooks/useMaintenanceTeam.js
import {
  useState,
  useCallback,
} from 'react';
import userService from '../../../services/UserService';

export default function useMaintenanceTeam() {
  const [maintenanceTeam,
    setMaintenanceTeam] =
    useState([]);
  const [teamLoading,
    setTeamLoading] =
    useState(false);

  const fetchMaintenanceTeam =
    useCallback(async () => {
      setTeamLoading(true);

      try {
        const response =
          await userService.fetchMaintenanceUsers();

        setMaintenanceTeam(
          response?.data || []
        );
      } finally {
        setTeamLoading(false);
      }
    }, []);

  return {
    maintenanceTeam,
    teamLoading,
    fetchMaintenanceTeam,
  };
}