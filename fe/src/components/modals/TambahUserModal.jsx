import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Spinner, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Select from 'react-select';
import userService from '../../services/UserService';

const initialFormState = {
  nik: '',
  nama: '',
  dept: '',
  roleId: '',
  password: '',
  confirmPassword: '',
};

export default function TambahUserModal({ show, onHide, onSuccess, user }) {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [selectedKaryawanOption, setSelectedKaryawanOption] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRoleOption, setSelectedRoleOption] = useState(null);

  const passwordMismatch =
    formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  const isEditMode = Boolean(user?.nik);

  const canSubmit =
    formData.nik &&
    formData.roleId &&
    !passwordMismatch &&
    (isEditMode ? true : Boolean(formData.password) && Boolean(formData.confirmPassword));

  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedKaryawanOption(null);
    setSelectedRoleOption(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKaryawanChange = (option) => {
    setSelectedKaryawanOption(option || null);
    if (!option) {
      setFormData((prev) => ({
        ...prev,
        nik: '',
        nama: '',
        dept: '',
      }));
      return;
    }

    const matched = option.data;
    setFormData((prev) => ({
      ...prev,
      nik: matched.nik,
      nama: matched.nama,
      dept: matched.dept,
    }));
  };

  const handleRoleChange = (option) => {
    setSelectedRoleOption(option || null);
    setFormData((prev) => ({
      ...prev,
      roleId: option ? String(option.value) : '',
    }));
  };

  useEffect(() => {
    let cancelled = false;
    const loadKaryawan = async () => {
      try {
        setLoadingKaryawan(true);
        const response = await userService.getAllKaryawan();
        if (!cancelled) {
          setKaryawanOptions(response?.data || []);
        }
      } catch (error) {
        toast.error('Tidak bisa memuat daftar karyawan.');
      } finally {
        if (!cancelled) {
          setLoadingKaryawan(false);
        }
      }
    };

    loadKaryawan();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await userService.getRoles();
        if (!cancelled) {
          setRoleOptions(response?.data || []);
        }
      } catch (error) {
        toast.error('Tidak bisa memuat daftar role.');
      } finally {
        if (!cancelled) {
          setLoadingRoles(false);
        }
      }
    };

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!show) {
      return;
    }

    if (!user) {
      resetForm();
      return;
    }

    const roleFromUser = user.roles?.[0];
    const matchedRole = roleOptions.find((role) => role.role_id === roleFromUser?.role_id);
    setSelectedRoleOption(
      matchedRole ? { value: matchedRole.role_id, label: matchedRole.role_name } : null
    );

    const karyawanMatch = karyawanOptions.find((k) => k.nik === user.nik);
    setSelectedKaryawanOption(
      karyawanMatch
        ? {
            value: karyawanMatch.nik,
            label: `${karyawanMatch.nik} - ${karyawanMatch.nama} (${karyawanMatch.dept})`,
            data: karyawanMatch,
          }
        : {
            value: user.nik,
            label: `${user.nik} - ${user.nama} (${user.position || ''})`,
            data: { nik: user.nik, nama: user.nama, dept: user.position || '' },
          }
    );

    setFormData({
      nik: user.nik,
      nama: user.nama,
      dept: user.position || '',
      roleId: matchedRole
        ? String(matchedRole.role_id)
        : roleFromUser
          ? String(roleFromUser.role_id)
          : '',
      password: '',
      confirmPassword: '',
    });
  }, [show, user, roleOptions, karyawanOptions]);

  const submitForm = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        const payload = {
          position: formData.dept.trim() || null,
          roleId: formData.roleId ? Number(formData.roleId) : null,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await userService.updateUser(user.nik, payload);
        toast.success('User berhasil diperbarui.');
      } else {
        await userService.registerUser({
          nik: formData.nik.trim(),
          nama: formData.nama.trim(),
          position: formData.dept.trim() || null,
          roleId: formData.roleId ? Number(formData.roleId) : null,
          password: formData.password,
        });
        toast.success('User berhasil didaftarkan.');
      }
      resetForm();
      onSuccess?.();
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Gagal mendaftarkan user.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onHide?.();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size='lg'
      centered
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      }}
    >
      <Form onSubmit={submitForm}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah User</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className='g-3'>
            <Col md={12}>
              <Form.Group controlId='formKaryawan'>
                <Form.Label className='fw-semibold'>
                  Pilih Karyawan <span className='text-danger'>*</span>
                </Form.Label>
                <Select
                  options={karyawanOptions.map((karyawan) => ({
                    value: karyawan.nik,
                    label: `${karyawan.nik} - ${karyawan.nama} (${karyawan.dept})`,
                    data: karyawan,
                  }))}
                  value={selectedKaryawanOption}
                  onChange={handleKaryawanChange}
                  isClearable
                  isLoading={loadingKaryawan}
                  placeholder={loadingKaryawan ? 'Memuat karyawan...' : 'Pilih karyawan'}
                  isDisabled={isEditMode}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId='formRole'>
                <Form.Label className='fw-semibold'>
                  Role <span className='text-danger'>*</span>
                </Form.Label>
                <Select
                  options={roleOptions.map((role) => ({
                    value: role.role_id,
                    label: role.role_name,
                  }))}
                  value={selectedRoleOption}
                  onChange={handleRoleChange}
                  isClearable
                  isLoading={loadingRoles}
                  placeholder={loadingRoles ? 'Memuat role...' : 'Pilih role'}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId='formNik'>
                <Form.Label className='fw-semibold'>
                  NIK <span className='text-danger'>*</span>
                </Form.Label>
                <Form.Control
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder='Masukkan NIK'
                  required
                  readOnly
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId='formNama'>
                <Form.Label className='fw-semibold'>
                  Nama <span className='text-danger'>*</span>
                </Form.Label>
                <Form.Control
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder='Masukkan nama lengkap'
                  required
                  readOnly
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId='formDept'>
                <Form.Label>Dept</Form.Label>
                <Form.Control
                  value={formData.dept}
                  onChange={handleChange}
                  placeholder='Dept akan terisi otomatis'
                  readOnly
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId='formPassword'>
                <Form.Label className='fw-semibold'>
                  Password {isEditMode ? '' : <span className='text-danger'>*</span>}
                </Form.Label>
                <Form.Control
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    isEditMode ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'
                  }
                  minLength={6}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId='formConfirmPassword'>
                <Form.Label className='fw-semibold'>
                  Konfirmasi Password <span className='text-danger'>*</span>
                </Form.Label>
                <Form.Control
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='Ketik ulang password'
                  minLength={6}
                  isInvalid={passwordMismatch}
                />
                {passwordMismatch && (
                  <Form.Control.Feedback type='invalid'>
                    Password dan konfirmasi tidak sama.
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Batal
          </Button>
          <Button variant='primary' type='submit' disabled={!canSubmit || loading}>
            {loading && <Spinner animation='border' size='sm' className='me-2' />}
            Simpan User
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

TambahUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  user: PropTypes.object,
};

TambahUserModal.defaultProps = {
  onSuccess: null,
  user: null,
};
