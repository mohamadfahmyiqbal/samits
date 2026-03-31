import pathlib 
lines=pathlib.Path('be/services/maintenance.service.js').read_text().splitlines() 
for i,line in enumerate(lines,1): 
    if 250 <= i <= 320: 
        print(i, line) 
