import pathlib 
path=pathlib.Path('fe/src/pages/MaintenanceSchedule/MaintenanceSchedule.jsx') 
lines=path.read_text().splitlines() 
for i in range(430, 470): 
    print(f'{i+1}: {lines[i]}') 
