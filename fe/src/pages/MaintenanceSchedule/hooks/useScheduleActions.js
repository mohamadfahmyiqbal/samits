// fe\src\pages\MaintenanceSchedule\hooks\useScheduleActions.js
import { Modal, message } from 'antd';
import { useCallback } from 'react';
import {
 fetchSchedule,
 updateLog,
 deleteLog,
} from '../../../services/MaintenanceService';

export default function useScheduleActions({
 fetchSchedules,
 createScheduleFromWizard,
 modalInitialValues,
 setModalInitialValues,
 setScheduleModalVisible,
 setScheduleModalMode,
 setModalLoading,
 setSelectedMainType,
 setSelectedCategory,
 setItItems,
 fetchCategoriesByMainTypeLocal,
 fetchSubCategoriesByCategoryLocal,
 fetchITItems,
}) {
 const closeScheduleModal = useCallback(() => {
  setScheduleModalVisible(false);
  setModalInitialValues(null);
  setModalLoading(false);

 }, [
  setModalInitialValues,
  setScheduleModalVisible,
  setModalLoading,
 ]);

 const handleEdit = useCallback(
  async (schedule) => {
   setScheduleModalMode('edit');
   setModalLoading(true);

   try {
    const response = await fetchSchedule(
     schedule.id
    );

    if (
     response.success &&
     response.data
    ) {
     const data = response.data;

     setModalInitialValues(data);

     const mainTypeId =
      data.assetMainTypeId ??
      data.asset_main_type_id;

     const categoryId =
      data.categoryId ??
      data.category_id;

     const subCategoryId =
      data.subCategoryId ??
      data.sub_category_id;

     if (mainTypeId) {
      setSelectedMainType(
       mainTypeId
      );
      await fetchCategoriesByMainTypeLocal(
       mainTypeId
      );
     }

     if (categoryId) {
      setSelectedCategory(
       categoryId
      );
      await fetchSubCategoriesByCategoryLocal(
       categoryId
      );
     }

     const fallbackItems =
      (data.assets || []).map(
       (asset) => ({
        it_item_id:
         asset.itItemId,
        hostname:
         asset.hostname,
        asset_tag:
         asset.assetTag,
        item_name:
         asset.hostname ||
         asset.assetTag,
        status: 'active',
       })
      );

     if (fallbackItems.length) {
      setItItems(
       fallbackItems
      );
     }

     if (
      categoryId &&
      subCategoryId
     ) {
      await fetchITItems(
       categoryId,
       subCategoryId,
       mainTypeId,
       fallbackItems
      );
     }

     setScheduleModalVisible(
      true
     );
    } else {
     message.error(
      response.message ||
      'Gagal memuat data jadwal'
     );
    }
   } catch {
    message.error(
     'Gagal memuat data jadwal'
    );
   } finally {
    setModalLoading(false);
   }
  },
  [
   fetchCategoriesByMainTypeLocal,
   fetchITItems,
   fetchSubCategoriesByCategoryLocal,
   setItItems,
   setModalInitialValues,
   setModalLoading,
   setScheduleModalMode,
   setScheduleModalVisible,
   setSelectedCategory,
   setSelectedMainType,
  ]
 );

 const handleUpdateSchedule =
  useCallback(
   async (values) => {
    if (!modalInitialValues)
     return;

    setModalLoading(true);

    try {
     const payload = {
      scheduledDate:
       values.start_date?.format(
        'YYYY-MM-DD'
       ) ||
       modalInitialValues.scheduledDate,

      scheduledEndDate:
       values.end_date?.format(
        'YYYY-MM-DD'
       ) ||
       modalInitialValues.scheduledEndDate,

      scheduledTime:
       values.start_time?.format(
        'HH:mm'
       ),

      scheduledEndTime:
       values.end_time?.format(
        'HH:mm'
       ),

      status:
       values.status ||
       modalInitialValues.status,

      priority:
       values.priority ||
       modalInitialValues.priority,

      criticality:
       values.criticality ||
       modalInitialValues.criticality,

      notes:
       values.notes ??
       modalInitialValues.notes,

      description:
       values.notes ??
       modalInitialValues.notes,

      pic:
       values.team?.trim()
        ? values.team
        : modalInitialValues.team,

      asset_main_type_id:
       values.asset_main_type_id,

      category_id:
       values.category_id,

      sub_category_id:
       values.sub_category_id,

      selected_assets:
       values.selected_assets,
     };

     const response =
      await updateLog(
       modalInitialValues.id,
       payload
      );

     if (response.success) {
      message.success(
       'Jadwal berhasil diperbarui'
      );
      await fetchSchedules();
      closeScheduleModal();
     } else {
      message.error(
       response.message
      );
     }
    } finally {
     setModalLoading(false);
    }
   },
   [
    closeScheduleModal,
    fetchSchedules,
    modalInitialValues,
    setModalLoading,
   ]
  );

 const handleDelete =
  useCallback(
   (id) => {
    Modal.confirm({
     title:
      'Hapus Jadwal Maintenance',
     content:
      'Apakah Anda yakin ingin menghapus jadwal maintenance ini?',
     okText: 'Ya',
     cancelText: 'Tidak',
     onOk: async () => {
      const response =
       await deleteLog(id);

      if (response.success) {
       message.success(
        'Jadwal berhasil dihapus'
       );
       await fetchSchedules();
       closeScheduleModal();
      }
     },
    });
   },
   [
    closeScheduleModal,
    fetchSchedules,
   ]
  );

 const handleModalSubmit =
  useCallback(
   async (values, mode) => {
    if (mode === 'add') {
     const success =
      await createScheduleFromWizard(
       values
      );

     if (success) {
      closeScheduleModal();
     }

     return;
    }

    await handleUpdateSchedule(
     values
    );
   },
   [
    closeScheduleModal,
    createScheduleFromWizard,
    handleUpdateSchedule,
   ]
  );

 return {
  handleEdit,
  handleDelete,
  handleModalSubmit,
  closeScheduleModal,
 };
}