import { useEffect } from 'react';
import { toast } from 'react-toastify';

const defaultAutoCloseByStatus = (status) => {
  if (status >= 200 && status < 300) return 2500;
  if (status >= 300 && status < 400) return 3000;
  if (status >= 400 && status < 500) return 4000;
  if (status >= 500) return 5000;
  if (status > 0 && status < 200) return 2500;
  return 3000;
};

export default function Notifikasi({ status, message, options = {} }) {
  useEffect(() => {
    if (!status || !message) return;

    const toastOptions = {
      autoClose: defaultAutoCloseByStatus(status),
      ...options,
    };

    if (status >= 200 && status < 300) {
      toast.success(message, toastOptions);
    } else if (status >= 300 && status < 400) {
      toast.info(message, toastOptions);
    } else if (status >= 400 && status < 500) {
      toast.error(message, toastOptions);
    } else if (status >= 500) {
      toast.error(message, toastOptions);
    } else if (status > 0 && status < 200) {
      toast.warn(message, toastOptions);
    } else {
      toast(message, toastOptions);
    }
  }, [status, message, options]);

  return null;
}
