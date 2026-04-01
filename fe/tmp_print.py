import pathlib 
lines=pathlib.Path('src/pages/MaintenanceSchedule/components/modals/ScheduleModal.jsx').read_text().splitlines() 
for i in range(320,350): 
    print(f'{i+1}: {lines[i]}') 
