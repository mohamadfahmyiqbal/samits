import { logger } from "./logger.js";

export const debugLog = (...message) => {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEBUG_IMPORT === "true"
  ) {
    logger.debug(...message);
  }
};

export const normalizeLookupText = (value) =>
  String(value || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const safeTrim = (value) => String(value || "").trim();

export const normalizeSpaces = (value) =>
 String(value || "")
  .replace(/\u00A0/g, " ")
  .replace(/\s+/g, " ")
  .trim();