import { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Container, Dropdown, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaPowerOff, FaTimes, FaUserCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

import userService from '../../utils/UserService';
import { showError, showSuccess } from '../../comp/Notification';
import { encryptPath } from '../../router/encryptPath';
import Loading from '../../comp/Loading';

const noop = () => {};

export default function Header({ side, handleUser = noop, handleSidebar }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const hideSidebar = useCallback(() => {
    if (side) {
      handleSidebar(false);
    }
  }, [side, handleSidebar]);

  const toggleSidebar = useCallback(() => {
    handleSidebar(!side);
  }, [side, handleSidebar]);

  const goTo = useCallback(
    (path) => {
      hideSidebar();
      const encryptedPath = encryptPath(path);
      if (encryptedPath) navigate(`/${encryptedPath}`);
    },
    [navigate, hideSidebar]
  );

  const logout = useCallback(async () => {
    try {
      const res = await userService.logout();
      showSuccess(res?.message || 'Logout berhasil');
    } catch (error) {
      showError(`Gagal Logout: ${error.message || error}`);
    } finally {
      userService.clearSession?.();
      navigate(`/${encryptPath('login')}`);
    }
  }, [navigate]);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isMountedRef.current) {
      setLoading(true);
    }

    try {
      const res = await userService.findUserByToken?.(controller.signal);

      if (res?.data) {
        setUser(res.data);
        handleUser(res.data);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showError(`Gagal mengambil data user: ${error.message || error}`);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [handleUser]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchUserData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUserData]);

  const userName = user?.nama || user?.name || (loading ? 'Memuat...' : 'Guest');
  const userDept = user?.dept || user?.position || (loading ? 'Mengambil data...' : 'Belum login');

  return (
    <header className='topbar'>
      <Navbar expand='lg' className='top-navbar px-3 py-2'>
        <Container fluid className='d-flex align-items-center justify-content-between'>
          <Navbar.Brand
            className='cursor-pointer d-flex align-items-center topbar-brand'
            onClick={() => goTo('dashboard')}
            aria-label='Buka dashboard'
          >
            <img src='/assets/images/logo/samits.png' alt='Logo' className='logo-img' />
            <span className='logo-text'>SAMIT</span>
          </Navbar.Brand>

          <div className='d-flex align-items-center gap-2 gap-md-3'>
            <Dropdown align='end'>
              <Dropdown.Toggle
                variant='link'
                className='topbar-icon-btn'
                aria-label='Buka notifikasi'
              >
                <FaBell color='white' size={20} />
              </Dropdown.Toggle>
              <Dropdown.Menu className='mailbox animated bounceInDown topbar-menu'>
                <Dropdown.Item className='drop-title'>Notifications</Dropdown.Item>
                <div className='message-center topbar-empty-state'>
                  <div className='topbar-empty-title'>Belum ada notifikasi</div>
                  <small>Update terbaru akan tampil di sini.</small>
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
                  <span className='topbar-user-name'>{loading ? 'Memuat...' : userName}</span>
                  <small className='topbar-user-dept'>
                    {loading ? 'Profil pengguna' : userDept}
                  </small>
                </div>
                <FaUserCircle color='white' size={20} />
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

      {loading && <Loading />}
    </header>
  );
}

Header.propTypes = {
  side: PropTypes.bool.isRequired,
  handleUser: PropTypes.func,
  handleSidebar: PropTypes.func.isRequired,
};
