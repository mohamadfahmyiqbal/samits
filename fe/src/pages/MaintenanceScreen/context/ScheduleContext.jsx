import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { MaintenanceContext } from "../../../context/MaintenanceContext";
import { useScheduleData } from "../hooks/useScheduleData";
import { useScheduleView } from "../hooks/useScheduleView";
import { useScheduleForm } from "../hooks/useScheduleForm";

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  const { 
    createLog, 
    updateLog, 
    deleteLog
  } = useContext(MaintenanceContext) || {};

  const data = useScheduleData();
  const view = useScheduleView();
  
  const { 
    allAssets = [], 
    mainTypeOptions = [], 
    getLogsForDate,
    filteredLogs = [],
    getCategoryBadgeColor,
    getStatusBadgeColor,
    getStatusLabel,
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    logsByDate = {},
    karyawanData = []
  } = data;

  const form = useScheduleForm(
    allAssets,
    mainTypeOptions,
    getLogsForDate
  );

  const {
    currentDate,
    selectedDate,
    viewMode,
    handleViewModeChange
  } = view;

  const selectedDateLogs = useMemo(() => 
    selectedDate ? getLogsForDate(selectedDate) : []
  , [selectedDate, getLogsForDate]);

  const categoryOptions = useMemo(() => 
    ['All', ...Array.from(new Set(filteredLogs.map(l => l.category).filter(Boolean)))]
  , [filteredLogs]);

  const onDayDoubleClick = useCallback((day) => {
    view.handleDayDoubleClick(day);
    form.handleOpenForm(day);
  }, [view, form]);

  const value = {
    // Data
    data,
    filteredLogs,
    logsByDate,
    selectedDateLogs,
    karyawanData,
    
    // View State & Actions
    view,
    currentDate,
    selectedDate,
    viewMode,
    handleViewModeChange,
    
    // Filter State & Actions
    filterCategory,
    setFilterCategory,
    searchQuery,
    setSearchQuery,
    categoryOptions,
    
    // Form State & Actions
    form,
    onDayDoubleClick,
    
    // Service Actions
    createLog,
    updateLog,
    deleteLog,
    
    // Helpers
    getCategoryBadgeColor,
    getStatusBadgeColor,
    getStatusLabel,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
