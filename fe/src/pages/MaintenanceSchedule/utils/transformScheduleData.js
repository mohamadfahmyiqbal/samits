// fe\src\pages\MaintenanceSchedule\utils\transformScheduleData.js
const normalizeStatus = (status) => {
  switch (status) {
    case 'done':
      return 'completed';
    case 'abnormal':
      return 'cancelled';
    default:
      return status || 'planned';
  }
};

export const transformScheduleData = (
  backendData = []
) => {
  const today = new Date()
    .toISOString()
    .split('T')[0];

  return backendData.map((item) => {
    const scheduledDate =
      item.scheduledDate ||
      item.date ||
      item.start_date;

    const scheduledEndDate =
      item.scheduledEndDate ||
      item.end_date ||
      scheduledDate;

    const scheduledStartTime =
      item.scheduledStartTime ||
      item.start_time ||
      '09:00';

    const scheduledEndTime =
      item.scheduledEndTime ||
      item.end_time ||
      '11:00';

    return {
      id: item.id,
      schedule_code: `MS-${item.id}`,
      category:
        item.category ||
        'Preventive Maintenance',
      subcategory:
        item.type ||
        'General Check',
      equipment:
        item.assetName ||
        item.hostname ||
        'Unknown Equipment',
      location:
        item.location ||
        'To be determined',
      team:
        item.pic ||
        'To be assigned',
      date: scheduledDate,
      start_time:
        scheduledStartTime,
      end_time:
        scheduledEndTime,
      scheduledDate,
      scheduledEndDate,
      scheduledStartTime,
      scheduledEndTime,
      start_date:
        item.start_date,
      end_date:
        item.end_date,
      status:
        normalizeStatus(
          item.status
        ),
      priority:
        item.priority ||
        'medium',
      criticality:
        item.criticality ||
        'medium',
      required_skills:
        item.requiredSkills ||
        [],
      estimated_duration:
        item.estimatedDuration ||
        2,
      created_by:
        item.createdBy,
      created_date:
        item.createdAt?.split(
          'T'
        )[0] || today,
      notes:
        item.description ||
        item.notes ||
        'No notes',
      originalData: item,
    };
  });
};