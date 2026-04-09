import { parseExcelDate, parseYear } from "./parsers.js";

const mainTypeMap = {
  PC: 2,
  CCTV: 2,
  CLIENT: 2,
  UTAMA: 1,
};
console.log(row[2]);

export const mapExcelRowToAsset = (row, sheetName) => ({
  noAsset: String(row[1] || "").trim(),
  noPO: String(row[15] || "").trim(),
  type: String(row[2] || "").trim(),
  division: String(row[3] || "").trim(),
  department: String(row[4] || "").trim(),
  userName: String(row[5] || "").trim(),
  nik: String(row[6] || "").trim(),
  tahunBeli: parseYear(row[7]),
  depreciationDate: parseExcelDate(row[8]),
  disposalPlanDate: parseExcelDate(row[8]),
  hostname: String(row[9] || "").trim(),
  ipMain: String(row[10] || "").trim(),
  ipBackup: String(row[11] || "").trim(),
  status: String(row[12] || "Active").trim(),
  supplier: String(row[13] || "").trim(),
  picSupplier: String(row[15] || "").trim(),
  kontakSupplier: String(row[16] || "").trim(),
  remarks: String(row[17] || "").trim(),
  sheetName,
  asset_main_type_id:
    mainTypeMap[sheetName.toUpperCase()] || 2,
});