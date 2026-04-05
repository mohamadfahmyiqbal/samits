// be/utils/errorHandler.js
// Standardized error handling middleware

export const errorHandler = (res, error) => {
  console.error("Controller Error:", error.message);
  console.error("Stack Trace:", error.stack);

  // Log full error for debugging
  if (error.original) {
    console.error("Original Error:", error.original.message);
    console.error("SQL:", error.original.sql);
  }

  // Don't expose stack trace in production
  const isProduction = process.env.NODE_ENV === "production";

  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(isProduction ? {} : { stack: error.stack }),
  });
};
