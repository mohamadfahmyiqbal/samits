import pathlib
data=pathlib.Path('be/logs/combined.log').read_text().splitlines()
print('---LOG START---')
