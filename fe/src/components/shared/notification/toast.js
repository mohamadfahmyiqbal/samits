import { toast } from 'react-toastify';

const createToast = (type, message, options = {}, defaultAutoClose) => {
  return toast[type](message, {
    autoClose: defaultAutoClose,
    ...options,
  });
};

export const showSuccess = (message, options = {}) =>
  createToast('success', message, options, 2500);
export const showError = (message, options = {}) =>
  createToast('error', message, options, 4000);
export const showWarning = (message, options = {}) =>
  createToast('warn', message, options, 3500);
export const showInfo = (message, options = {}) =>
  createToast('info', message, options, 3000);
