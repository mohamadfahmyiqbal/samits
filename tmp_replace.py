from pathlib import Path
path=Path('fe/src/pages/MaintenanceSchedule/components/GanttChart.jsx').read_text()
text=text.replace('            {slots.map((slot, index) =, '            {slotRows.map(({ slot, height }, index) =
Path('fe/src/pages/MaintenanceSchedule/components/GanttChart.jsx').write_text(text)
