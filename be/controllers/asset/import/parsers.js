import xlsx from "xlsx";

export const parseExcelDate = (value) => {
  if (!value) return null;

  if (typeof value === "number") {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (!parsed) return null;

    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseYear = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && value > 30000) {
    const excelDate = xlsx.SSF.parse_date_code(value);
    return excelDate?.y ? String(excelDate.y) : null;
  }

  const str = String(value).trim();

  if (/^\d{4}$/.test(str)) return str;

  const match4 = str.match(/\b(19|20)\d{2}\b/);
  if (match4) return match4[0];

  const date = new Date(str);
  return Number.isNaN(date.getTime())
    ? null
    : String(date.getFullYear());
};