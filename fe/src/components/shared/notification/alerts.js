import Swal from 'sweetalert2';

export const alertSuccess = (message, title = 'Berhasil') =>
  Swal.fire({
    icon: 'success',
    title,
    text: message,
    timer: 2500,
    showConfirmButton: false,
  });

export const alertError = (message, title = 'Gagal') =>
  Swal.fire({
    icon: 'error',
    title,
    text: message,
  });

export const alertWarning = (message, title = 'Peringatan') =>
  Swal.fire({
    icon: 'warning',
    title,
    text: message,
  });

export const alertInfo = (message, title = 'Info') =>
  Swal.fire({
    icon: 'info',
    title,
    text: message,
  });

export const alertConfirm = (options = {}) => {
  const {
    title = 'Konfirmasi',
    text = 'Apakah Anda yakin ingin melanjutkan?',
    icon = 'warning',
    confirmText = 'Lanjutkan',
    cancelText = 'Batal',
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
