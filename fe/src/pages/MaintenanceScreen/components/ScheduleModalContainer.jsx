import React from "react";
import ScheduleForm from "./ScheduleForm";
import { useSchedule } from "../context/ScheduleContext";
import { showError, showSuccess } from "../../../components/shared/notification/toast";

const ScheduleModalContainer = () => {
  const { form, karyawanData, createLog, updateLog } = useSchedule();

  return (
    <ScheduleForm
      show={form.showModal}
      isEditing={form.isEditing}
      onHide={form.handleCloseForm}
      formData={form.formData}
      filteredAssets={form.filteredAssets}
      mainTypeOptions={form.mainTypeOptions}
      categoryOptions={form.categoryOptions}
      subCategoryOptions={form.subCategoryOptions}
      itemsLoading={form.itemsLoading}
      karyawanData={karyawanData}
      isSubmitting={form.isSubmitting}
      onMainTypeChange={form.handleMainTypeChange}
      onCategoryChange={form.handleCategoryChange}
      onSubCategoryChange={form.handleSubCategoryChange}
      onAssetChange={form.handleAssetChange}
      onFormChange={form.handleFormChange}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(createLog, updateLog)
          .then(() => showSuccess(`Jadwal berhasil ${form.isEditing ? 'diperbarui' : 'ditambahkan'}`))
          .catch(err => showError("Gagal menyimpan jadwal: " + err.message));
      }}
    />
  );
};

export default ScheduleModalContainer;
