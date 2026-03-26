import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../../utils/UserService';
import { encryptPath } from '../../../router/encryptPath';
import { useSocket } from '../../../context/SocketContext';

export const useLoginScreen = () => {
  const [fields, setFields] = useState({ nik: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ status: 0, message: '' });
  const navigate = useNavigate();
  const { connectSocket } = useSocket();

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!fields.nik.trim()) newErrors.nik = 'NIK wajib diisi';
    if (!fields.password.trim()) newErrors.password = 'Password wajib diisi';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setNotif({ status: 0, message: '' });

    try {
      const res = await userService.login(fields);
      if (res && res.status === 200) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userData', JSON.stringify(res.data.user));
        connectSocket(res.data.token);
        navigate(`/${encryptPath('dashboard')}`);
      } else {
       
        const errorMessage =
          res?.data?.message || res?.message || 'Gagal login. Cek NIK dan Password.';
        setNotif({ status: res?.status || 400, message: errorMessage });
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Terjadi kesalahan sistem atau koneksi.';
      setNotif({ status: error?.response?.status || 500, message });
    } finally {
      setLoading(false);
    }
  };

  return {
    fields,
    errors,
    loading,
    notif,
    handleChange,
    handleSubmit
  };
};
