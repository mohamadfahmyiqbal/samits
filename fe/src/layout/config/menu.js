export const menuGroups = [
  { type: "link", label: "Dashboard", path: "dashboard" },
  {
    type: "dropdown",
    label: "Asset List",
    id: "asset-dropdown",
    items: [
      { label: "Asset Management", path: "asset management" },
    ],
  },
  {
    type: "dropdown",
    label: "Maintenance",
    id: "maintenance-dropdown",
    items: [
      {
        type: "dropdown",
        label: "Preventive Maintenance",
        id: "preventive-maintenance-dropdown",
        items: [
          { label: "Schedule", path: "schedule" },
          { label: "Work Order", path: "workorder" },
          { label: "PM Schedule", path: "pm-schedule" },
          { label: "PM Task / Checklist", path: "pm-task" },
          { label: "PM Calendar", path: "pm-calendar" },
          { label: "PM History", path: "pm-history" }
        ],
      },
    ],
  },
  { type: "link", label: "Stok Kontrol", path: "stok kontrol" },
  { type: "link", label: "Summary", path: "summary" },
];

