// fe\src\layout\components\Header.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Container, Dropdown, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaPowerOff, FaTimes, FaUserCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

import userService from '../../utils/UserService';
import { showError, showSuccess } from '../../components/shared/notification/toast';
import { encryptPath } from '../../routes/pathEncoding';
import Swal from 'sweetalert2';

const noop = () => { };

export default function Header({ side, handleUser = noop, handleSidebar }) {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const navigate = useNavigate();
 const abortControllerRef = useRef(null);

 const hideSidebar = useCallback(() => {
  if (side) {
   handleSidebar(false);
  }
 }, [side, handleSidebar]);

 const toggleSidebar = useCallback(() => {
  handleSidebar((prev) => !prev);
 }, [handleSidebar]);

 const goTo = useCallback(
  (path) => {
   hideSidebar();
   const encryptedPath = encryptPath(path);
   if (encryptedPath) navigate(`/${encryptedPath}`);
  },
  [navigate, hideSidebar]
 );

 const goDashboard = useCallback(() => {
  goTo('dashboard');
 }, [goTo]);

 const logout = useCallback(async () => {
  const result = await Swal.fire({
   title: 'Logout?',
   text: 'Apakah Anda yakin ingin logout?',
   icon: 'warning',
   showCancelButton: true,
   confirmButtonText: 'Ya, Logout',
   cancelButtonText: 'Batal',
   reverseButtons: true,
   focusCancel: true,
   showLoaderOnConfirm: true,
   allowOutsideClick: () =>
    !Swal.isLoading(),
   preConfirm: async () => {
    try {
     return await userService.logout();
    } catch (error) {
     Swal.showValidationMessage(
      error.message ||
      'Logout gagal'
     );
     throw error;
    }
   },
  });

  if (!result.isConfirmed) return;

  showSuccess('Logout berhasil');
  userService.clearSession?.();
  navigate(
   `/${encryptPath('login')}`
  );
 }, [navigate]);

 const fetchUserData = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) {
   setLoading(false);
   return;
  }

  const cachedUser = localStorage.getItem('userData');

  if (cachedUser) {
   try {
    const parsedUser = JSON.parse(cachedUser);
    setUser(parsedUser);
    handleUser(parsedUser);
    setLoading(false);
   } catch (_error) {
    localStorage.removeItem('userData');
   }
  }

  if (abortControllerRef.current) {
   abortControllerRef.current.abort();
  }

  const controller = new AbortController();
  abortControllerRef.current = controller;

  setLoading(true);

  try {
   const res = await userService.findUserByToken?.(controller.signal);

   if (res?.data) {
    setUser(res.data);
    handleUser(res.data);
    localStorage.setItem(
     'userData',
     JSON.stringify(res.data)
    );
   }
  } catch (error) {
   if (error.name === 'AbortError') return;

   const status =
    error?.response?.status ||
    error?.status;

   if (status === 401 || status === 403) {
    userService.clearSession?.();
    navigate(
     `/${encryptPath('login')}`
    );
    return;
   }

   showError(
    `Gagal mengambil data user: ${error.message || error
    }`
   );
  } finally {
   setLoading(false);
  }
 }, [handleUser, navigate]);

 useEffect(() => {
  fetchUserData();

  return () => {
   if (abortControllerRef.current) {
    abortControllerRef.current.abort();
   }
  };
 }, [fetchUserData]);

 const userName = user?.nama || user?.name || (loading ? 'Memuat...' : 'Guest');
 const userDept = user?.dept || user?.position || (loading ? 'Mengambil data...' : null);

 return (
  <header className='topbar'>
   <Navbar expand='lg' className='top-navbar px-3 py-2'>
    <Container fluid className='d-flex align-items-center justify-content-between'>
     <Navbar.Brand
      className='cursor-pointer d-flex align-items-center topbar-brand'
      onClick={goDashboard}
      aria-label='Buka dashboard'
     >
      <img src='/assets/images/logo/samits.png' alt='Logo' className='logo-img' />
      <span className='logo-text'>ITA&M</span>
     </Navbar.Brand>

     <div className='d-flex align-items-center gap-2 gap-md-3'>
      <Dropdown align='end'>
       <Dropdown.Toggle
        variant='link'
        className='topbar-icon-btn'
        aria-label='Buka notifikasi'
       >
        <div className='position-relative'>
         <FaBell color='white' size={20} />
         <span className='topbar-badge'>3</span>
        </div>
       </Dropdown.Toggle>
       <Dropdown.Menu className='mailbox animated bounceInDown topbar-menu'>
        <Dropdown.Item className='drop-title'>Notifications</Dropdown.Item>
        <div className='message-center topbar-empty-state text-center py-3 px-2'>
         <FaBell
          size={18}
          className='mb-2 opacity-75'
         />

         <div className='topbar-empty-title'>
          Belum ada notifikasi
         </div>

         <small className='text-muted'>
          Update terbaru akan tampil di sini
         </small>
        </div>
       </Dropdown.Menu>
      </Dropdown>

      <Dropdown align='end'>
       <Dropdown.Toggle
        variant='link'
        className='topbar-user-btn'
        aria-label='Buka menu pengguna'
       >
        <div className='topbar-user-meta d-none d-md-flex'>
         <span className='topbar-user-name'>
          {loading ? (
           <span className='topbar-skeleton topbar-skeleton-name' />
          ) : (
           userName
          )}
         </span>
         <small className='topbar-user-dept'>
          {loading ? (
           <span className='topbar-skeleton topbar-skeleton-dept' />
          ) : (
           userDept
          )}
         </small>
        </div>
        <div className='topbar-avatar'>
         {userName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
       </Dropdown.Toggle>
       <Dropdown.Menu className='animated flipInY topbar-menu'>
        <div className='dw-user-box d-flex align-items-center p-3'>
         <div className='u-text'>
          <h6>{userName}</h6>
          <p className='text-muted mb-0'>{userDept}</p>
         </div>
        </div>
        <Dropdown.Divider />
        <Dropdown.Item onClick={logout}>
         <FaPowerOff className='me-2' /> Logout
        </Dropdown.Item>
       </Dropdown.Menu>
      </Dropdown>

      <Button
       variant='link'
       className='nav-link nav-toggler topbar-icon-btn'
       onClick={toggleSidebar}
       aria-label={side ? 'Tutup sidebar' : 'Buka sidebar'}
      >
       {side ? <FaTimes /> : <FaBars />}
      </Button>
     </div>
    </Container>
   </Navbar>
  </header>
 );
}

Header.propTypes = {
 side: PropTypes.bool.isRequired,
 handleUser: PropTypes.func,
 handleSidebar: PropTypes.func.isRequired,
};
