// utils/errorHandler.js
import { toast } from 'react-toastify';

// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

// Get error type based on error response
export const getErrorType = (error) => {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;
  
  if (status === 401) return ERROR_TYPES.AUTHENTICATION;
  if (status === 403) return ERROR_TYPES.AUTHORIZATION;
  if (status >= 400 && status < 500) return ERROR_TYPES.VALIDATION;
  if (status >= 500) return ERROR_TYPES.SERVER;
  
  return ERROR_TYPES.UNKNOWN;
};

// Get user-friendly error message
export const getErrorMessage = (error, fallbackMessage = 'Terjadi kesalahan yang tidak diketahui') => {
  const errorType = getErrorType(error);
  
  // Network errors
  if (errorType === ERROR_TYPES.NETWORK) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }
  
  // Authentication errors
  if (errorType === ERROR_TYPES.AUTHENTICATION) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  
  // Authorization errors
  if (errorType === ERROR_TYPES.AUTHORIZATION) {
    return 'Anda tidak memiliki izin untuk mengakses halaman ini.';
  }
  
  // Validation errors
  if (errorType === ERROR_TYPES.VALIDATION) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      // Handle array of validation errors
      if (Array.isArray(data.errors)) {
        return data.errors.join(', ');
      }
      // Handle object of validation errors
      if (typeof data.errors === 'object') {
        return Object.values(data.errors).join(', ');
      }
    }
    return 'Data yang Anda masukkan tidak valid.';
  }
  
  // Server errors
  if (errorType === ERROR_TYPES.SERVER) {
    return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
  }
  
  // Use backend message if available
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Use error message if available
  if (error.message) {
    return error.message;
  }
  
  return fallbackMessage;
};

// Main error handler function
export const handleError = (error, options = {}) => {
  const {
    fallbackMessage = 'Terjadi kesalahan yang tidak diketahui',
    showToast = true,
    toastType = 'error',
    logToConsole = process.env.NODE_ENV === 'development',
    customAction = null
  } = options;

  const errorMessage = getErrorMessage(error, fallbackMessage);
  const errorType = getErrorType(error);

  // Log to console in development
  if (logToConsole) {
    console.group('🚨 Error Handler');
    console.error('Error:', error);
    console.error('Type:', errorType);
    console.error('Message:', errorMessage);
    console.groupEnd();
  }

  // Show toast notification
  if (showToast) {
    toast[toastType](errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  // Execute custom action (e.g., redirect on auth error)
  if (customAction) {
    customAction(error, errorType, errorMessage);
  }

  // Default action for authentication errors
  if (errorType === ERROR_TYPES.AUTHENTICATION && !customAction) {
    // Clear local storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  }

  return {
    message: errorMessage,
    type: errorType,
    originalError: error
  };
};

// Async wrapper for API calls with error handling
export const withErrorHandling = async (apiCall, options = {}) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    const errorInfo = handleError(error, options);
    return { success: false, error: errorInfo };
  }
};

// React hook for error handling
export const useErrorHandler = () => {
  const error = (error, options = {}) => {
    return handleError(error, options);
  };

  const asyncError = async (apiCall, options = {}) => {
    return withErrorHandling(apiCall, options);
  };

  return { error, asyncError };
};
