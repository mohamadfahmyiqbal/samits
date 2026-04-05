import React from "react";
import { useSchedule } from "../context/ScheduleContext";
import ScheduleCalendar from "./ScheduleCalendar";
import ScheduleYearly from "./ScheduleYearly";
import ScheduleDaily from "./ScheduleDaily";

const ScheduleMainContent = () => {
  const {
    view,
    viewMode,
    currentDate,
    selectedDate,
    logsByDate,
    onDayDoubleClick,
    getCategoryBadgeColor,
    form
  } = useSchedule();

  const commonProps = {
    currentDate,
    selectedDate,
    logsByDate,
    onToday: view.handleToday,
    onDayClick: view.handleDayClick,
    onDayDoubleClick,
    getCategoryBadgeColor
  };

  const renderView = () => {
    switch (viewMode) {
      case "yearly":
        return (
          <ScheduleYearly
            {...commonProps}
            onPrevYear={view.handlePrevYear}
            onNextYear={view.handleNextYear}
          />
        );
      case "daily":
        return (
          <ScheduleDaily
            {...commonProps}
            onPrevDay={view.handlePrevDay}
            onNextDay={view.handleNextDay}
            onEdit={form.handleEditForm}
          />
        );
      case "monthly":
      default:
        return (
          <ScheduleCalendar
            {...commonProps}
            onPrevMonth={view.handlePrevMonth}
            onNextMonth={view.handleNextMonth}
          />
        );
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden">
      {renderView()}
    </div>
  );
};

export default ScheduleMainContent;
