import React, { useEffect, useState } from "react";
import { Button, Card, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import userService from "../services/UserService";
import TambahUserModal from "./TambahUser";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.listLocalUsers();
      setUsers(response?.data || []);
    } catch (error) {
      console.error("Error loading local users:", error);
      toast.error("Gagal memuat daftar user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleModalSuccess = () => {
    setEditingUser(null);
    setShowModal(false);
    loadUsers();
  };

  const closeModal = () => {
    setEditingUser(null);
    setShowModal(false);
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteClick = async (nik) => {
    if (!window.confirm(`Hapus user ${nik}?`)) return;
    try {
      await userService.deleteUser(nik);
      loadUsers();
    } catch (error) {
      toast.error("Gagal menghapus user.");
    }
  };

  return (
    <div className="page-shell px-3 px-md-5 py-4">
      <Card className="shadow-sm border-0">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">User Management</h5>
            <Button size="sm" onClick={handleCreateClick}>
              Tambah User
            </Button>
          </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>NIK</th>
                    <th>Nama</th>
                    <th>Dept</th>
                    <th>Roles</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                      {users.length === 0 ? (
                        <tr>
                    <td colSpan={5} className="text-center text-muted">
                            Belum ada user terdaftar.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.nik}>
                            <td>{user.nik}</td>
                            <td>{user.nama}</td>
                            <td>{user.position || "-"}</td>
                            <td>
                              {Array.isArray(user.roles) && user.roles.length > 0
                                ? user.roles.map((role) => role.role_name).join(", ")
                                : "-"}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEditClick(user)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(user.nik)}
                              >
                                Hapus
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <TambahUserModal
        show={showModal}
        onHide={closeModal}
        onSuccess={handleModalSuccess}
        user={editingUser}
      />
    </div>
  );
}
