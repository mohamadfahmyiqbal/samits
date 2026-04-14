import React, { useEffect, useState } from 'react';
import { Button, Card, Spinner, Table, Form, InputGroup, Badge, Stack } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Plus, Search, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import userService from '../../services/UserService';
import TambahUserModal from './components/TambahUserModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingNik, setDeletingNik] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.listLocalUsers();
      const data = response?.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading local users:', error);
      const message =
        error?.response?.data?.message || error?.message || 'Gagal memuat daftar user.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.nik?.toLowerCase().includes(query) ||
        user.nama?.toLowerCase().includes(query) ||
        user.position?.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

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
    setDeletingNik(nik);
    try {
      await userService.deleteUser(nik);
      loadUsers();
      toast.success(`User ${nik} berhasil dihapus.`);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Gagal menghapus user.';
      toast.error(message);
    } finally {
      setDeletingNik(null);
    }
  };

  return (
    <div className='page-shell px-3 px-md-5 py-4'>
      <Card className='shadow-sm border-0'>
        <Card.Header className='d-flex flex-wrap justify-content-between align-items-center gap-2'>
          <h5 className='mb-0'>User Management</h5>
          <Stack direction='horizontal' gap={2}>
            <InputGroup size='sm' style={{ width: '250px' }}>
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                placeholder='Cari NIK, nama, dept...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Button variant='outline-secondary' size='sm' onClick={loadUsers} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </Button>
            <Button size='sm' onClick={handleCreateClick}>
              <Plus size={16} className='me-1' />
              Tambah User
            </Button>
          </Stack>
        </Card.Header>
        <Card.Body className='p-0'>
          {loading ? (
            <div className='text-center py-5'>
              <Spinner animation='border' variant='primary' />
              <p className='text-muted mt-2 mb-0'>Memuat data...</p>
            </div>
          ) : (
            <div className='table-responsive'>
              <Table striped hover className='mb-0 align-middle'>
                <thead className='table-light'>
                  <tr>
                    <th className='px-3'>NIK</th>
                    <th>Nama</th>
                    <th>Dept</th>
                    <th>Roles</th>
                    <th className='text-center' style={{ width: '120px' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className='text-center text-muted py-4'>
                        {searchQuery
                          ? 'Tidak ada user yang cocok dengan pencarian.'
                          : 'Belum ada user terdaftar.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.nik}>
                        <td className='px-3 font-monospace'>{user.nik}</td>
                        <td className='fw-medium'>{user.nama}</td>
                        <td>
                          <Badge bg='secondary' className='fw-normal'>
                            {user.position || '-'}
                          </Badge>
                        </td>
                        <td>
                          {Array.isArray(user.roles) && user.roles.length > 0 ? (
                            <Stack direction='horizontal' gap={1} className='flex-wrap'>
                              {user.roles.map((role) => (
                                <Badge key={role.role_id} bg='primary' className='fw-normal'>
                                  {role.role_name}
                                </Badge>
                              ))}
                            </Stack>
                          ) : (
                            <span className='text-muted'>-</span>
                          )}
                        </td>
                        <td className='text-center'>
                          <Stack direction='horizontal' gap={1} className='justify-content-center'>
                            <Button
                              variant='outline-primary'
                              size='sm'
                              onClick={() => handleEditClick(user)}
                              title='Edit user'
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant='outline-danger'
                              size='sm'
                              onClick={() => handleDeleteClick(user.nik)}
                              disabled={deletingNik === user.nik}
                              title='Hapus user'
                            >
                              {deletingNik === user.nik ? (
                                <Spinner animation='border' size='sm' />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </Button>
                          </Stack>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
          <div className='px-3 py-2 border-top text-muted small'>
            Total: {filteredUsers.length} user{filteredUsers.length !== 1 && 's'}
            {searchQuery && ` (dari ${users.length} total)`}
          </div>
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
