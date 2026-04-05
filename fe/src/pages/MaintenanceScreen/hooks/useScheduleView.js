import { useState, useCallback } from 'react';
import { format } from 'date-fns';

export const useScheduleView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('monthly'); // 'daily' | 'monthly' | 'yearly'

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() - 1);
      return date;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() + 1);
      return date;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }, []);

  const handleDayClick = useCallback((day) => {
    setSelectedDate(day);
    setCurrentDate(day);
    setViewMode('daily');
  }, []);

  const handleDayDoubleClick = useCallback((day) => {
    setSelectedDate(day);
    // Form hook akan handle modal open
  }, []);

  // View mode navigation
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handlePrevYear = useCallback(() => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setFullYear(date.getFullYear() - 1);
      return date;
    });
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setFullYear(date.getFullYear() + 1);
      return date;
    });
  }, []);

  const handlePrevDay = useCallback(() => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 1);
      return date;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 1);
      return date;
    });
  }, []);

  return {
    currentDate,
    selectedDate,
    viewMode,
    setSelectedDate,
    
    // Navigation
    handlePrevMonth,
    handleNextMonth,
    handleToday,
    handleDayClick,
    handleDayDoubleClick,
    
    // View mode nav
    handleViewModeChange,
    handlePrevYear,
    handleNextYear,
    handlePrevDay,
    handleNextDay
  };
};

