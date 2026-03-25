// be/utils/errorHandler.js
// Standardized error handling middleware

export const errorHandler = (res, error) => {
  console.error('Controller Error:', error.message);

  // Don't expose stack trace in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};
