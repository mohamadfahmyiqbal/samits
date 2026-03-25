import React from "react";
import ScheduleList from "./ScheduleList";
import ScheduleSummary from "./ScheduleSummary";
import { useSchedule } from "../context/ScheduleContext";
import { showError, showSuccess, alertConfirm } from "../../../comp/Notification";

const ScheduleSidebar = () => {
  const {
    selectedDate,
    selectedDateLogs,
    getCategoryBadgeColor,
    getStatusBadgeColor,
    getStatusLabel,
    form,
    deleteLog,
    filteredLogs
  } = useSchedule();

  const handleDelete = async (id) => {
    alertConfirm({
      title: "Hapus Jadwal",
      text: "Apakah Anda yakin ingin menghapus jadwal maintenance ini?",
      onConfirm: async () => {
        try {
          await deleteLog(id);
          showSuccess("Jadwal berhasil dihapus");
        } catch (err) {
          showError("Gagal menghapus jadwal: " + err.message);
        }
      }
    });
  };

  return (
    <div className="card border-0 shadow-sm mb-3 h-100">
      <div className="card-body p-0">
        <ScheduleList
          selectedDate={selectedDate}
          selectedDateLogs={selectedDateLogs}
          getCategoryBadgeColor={getCategoryBadgeColor}
          getStatusBadgeColor={getStatusBadgeColor}
          getStatusLabel={getStatusLabel}
          onEdit={form.handleEditForm}
          onDelete={handleDelete}
        />
        <hr className="my-0 mx-3" />
        <div className="p-3">
          <ScheduleSummary filteredLogs={filteredLogs} />
        </div>
      </div>
    </div>
  );
};

export default ScheduleSidebar;
