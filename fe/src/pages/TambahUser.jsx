import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import userService from "../services/UserService";

const initialFormState = {
  nik: "",
  nama: "",
  dept: "",
  roleId: "",
  password: "",
  confirmPassword: "",
};

export default function TambahUser() {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [selectedNik, setSelectedNik] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const canSubmit =
    selectedNik &&
    formData.roleId &&
    formData.password &&
    formData.password === formData.confirmPassword;

  const passwordMismatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKaryawanChange = (event) => {
    const nik = event.target.value;
    setSelectedNik(nik);

    if (!nik) {
      setFormData((prev) => ({
        ...prev,
        nik: "",
        nama: "",
        dept: "",
      }));
      return;
    }

    const matched = karyawanOptions.find((k) => k.nik === nik);
    setFormData((prev) => ({
      ...prev,
      nik: matched?.nik || "",
      nama: matched?.nama || "",
      dept: matched?.dept || "",
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
        toast.error("Tidak bisa memuat daftar karyawan.");
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
        toast.error("Tidak bisa memuat daftar role.");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (passwordMismatch) {
      toast.error("Password dan konfirmasi harus sama.");
      return;
    }

    try {
      setLoading(true);
      await userService.registerUser({
        nik: formData.nik.trim(),
        nama: formData.nama.trim(),
        position: formData.dept.trim() || null,
        roleId: formData.roleId ? Number(formData.roleId) : null,
        password: formData.password,
      });
      toast.success("User berhasil didaftarkan.");
      setFormData(initialFormState);
      setSelectedNik("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal mendaftarkan user.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell px-3 px-md-5 py-4">
      <Row>
        <Col lg={8} xl={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-3">Tambah User</Card.Title>
              <Card.Text className="text-muted mb-4">
                Gunakan form ini untuk mendaftarkan karyawan baru. Field yang
                bertanda * wajib diisi.
              </Card.Text>

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Group controlId="formKaryawan">
                      <Form.Label className="fw-semibold">
                        Pilih Karyawan <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={selectedNik}
                        onChange={handleKaryawanChange}
                        required
                        disabled={loadingKaryawan}
                      >
                        <option value="">
                          {loadingKaryawan
                            ? "Memuat karyawan..."
                            : "Pilih karyawan"}
                        </option>
                        {karyawanOptions.map((karyawan) => (
                          <option key={karyawan.nik} value={karyawan.nik}>
                            {karyawan.nik} - {karyawan.nama} ({karyawan.dept})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group controlId="formRole">
                      <Form.Label className="fw-semibold">
                        Role <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                        required
                        disabled={loadingRoles}
                      >
                        <option value="">
                          {loadingRoles ? "Memuat role..." : "Pilih role"}
                        </option>
                        {roleOptions.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formNik">
                      <Form.Label className="fw-semibold">
                        NIK <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        name="nik"
                        value={formData.nik}
                        onChange={handleChange}
                        placeholder="Masukkan NIK"
                        required
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formNama">
                      <Form.Label className="fw-semibold">
                        Nama <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        required
                        readOnly
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="formDept">
                      <Form.Label>Dept</Form.Label>
                      <Form.Control
                        name="dept"
                        value={formData.dept}
                        onChange={handleChange}
                        placeholder="Dept akan terisi otomatis"
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formPassword">
                      <Form.Label className="fw-semibold">
                        Password <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="formConfirmPassword">
                      <Form.Label className="fw-semibold">
                        Konfirmasi Password <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Ketik ulang password"
                        required
                        minLength={6}
                        isInvalid={passwordMismatch}
                      />
                      {passwordMismatch && (
                        <Form.Control.Feedback type="invalid">
                          Password dan konfirmasi tidak sama.
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4 d-flex align-items-center">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!canSubmit || loading}
                  >
                    {loading && (
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                    )}
                    Simpan User
                  </Button>
                  <small className="text-muted ms-3">
                    Semua field wajib diisi jika ditandai *.
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
