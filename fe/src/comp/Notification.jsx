import { useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

export default function Notifikasi({ status, message, options = {} }) {
  useEffect(() => {
    if (!status || !message) return;

    if (status >= 200 && status < 300) {
      toast.success(message, { autoClose: 2500, ...options });
    } else if (status >= 300 && status < 400) {
      toast.info(message, { autoClose: 3000, ...options });
    } else if (status >= 400 && status < 500) {
      toast.error(message, { autoClose: 4000, ...options });
    } else if (status >= 500) {
      toast.error(message, { autoClose: 5000, ...options });
    } else if (status > 0 && status < 200) {
      toast.warn(message, { autoClose: 2500, ...options });
    } else {
      toast(message, { autoClose: 3000, ...options });
    }
  }, [status, message, options]);

  return null;
}

// ===== Toast Functions (react-toastify) =====
export const showSuccess = (message, options = {}) => {
  toast.success(message, { autoClose: 2500, ...options });
};

export const showError = (message, options = {}) => {
  toast.error(message, { autoClose: 4000, ...options });
};

export const showWarning = (message, options = {}) => {
  toast.warn(message, { autoClose: 3500, ...options });
};

export const showInfo = (message, options = {}) => {
  toast.info(message, { autoClose: 3000, ...options });
};

// ===== Alert Functions (sweetalert2) =====
export const alertSuccess = (message, title = "Berhasil") => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    timer: 2500,
    showConfirmButton: false,
  });
};

export const alertError = (message, title = "Gagal") => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
  });
};

export const alertWarning = (message, title = "Peringatan") => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
  });
};

export const alertInfo = (message, title = "Info") => {
  return Swal.fire({
    icon: "info",
    title,
    text: message,
  });
};

export const alertConfirm = (options = {}) => {
  const {
    title = "Konfirmasi",
    text = "Apakah Anda yakin?",
    icon = "warning",
    confirmText = "Ya",
    cancelText = "Batal",
    onConfirm = () => {},
    onCancel = () => {},
  } = options;

  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      onCancel();
    }
  });
};
