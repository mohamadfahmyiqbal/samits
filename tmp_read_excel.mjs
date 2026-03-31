import xlsx from 'xlsx';
const workbook = xlsx.readFile('01. Lembar Pengecekan Hardware 2026.xlsx');
const sheet = workbook.Sheets['PC'];
const rows = xlsx.utils.sheet_to_json(sheet, {header:1, defval:''});
const rowIndex = 7;
console.log('row', rowIndex+1, rows[rowIndex]);
