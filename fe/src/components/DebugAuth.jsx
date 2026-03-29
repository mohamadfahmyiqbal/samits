import React, { useState } from 'react';
import { Button, Card, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    let info = {
      token: token ? 'EXISTS' : 'MISSING',
      userData: userData ? 'EXISTS' : 'MISSING',
      userRole: 'NO ROLE',
      userName: 'NO USER',
      canAccessAssetManagement: false,
    };

    if (userData) {
      try {
        const user = JSON.parse(userData);
        info.userRole = user.roles?.[0]?.role_name || 'NO ROLE';
        info.userName = user.name || user.nik || 'NO NAME';
        info.canAccessAssetManagement = ['SUPERADMIN', 'ASSET_CONTROLLER'].includes(info.userRole);
        info.fullUserData = user;
      } catch (e) {
        info.userData = 'INVALID JSON';
      }
    }

    setDebugInfo(info);
  };

  const clearAuth = () => {
    localStorage.clear();
    setDebugInfo(null);
    navigate('https://localhost:3000/login');
  };

  const goToLogin = () => {
    navigate('https://localhost:3000/login');
  };

  return (
    <Container className='py-4'>
      <Card>
        <Card.Header>
          <h5>🔍 Debug Authentication</h5>
          <small className='text-muted'>Halaman untuk troubleshooting masalah login</small>
        </Card.Header>
        <Card.Body>
          <div className='mb-3'>
            <Button variant='primary' onClick={checkAuth} className='me-2'>
              📋 Cek Status Login
            </Button>
            <Button variant='warning' onClick={goToLogin} className='me-2'>
              🔐 Go to Login
            </Button>
            <Button variant='danger' onClick={clearAuth}>
              🗑️ Clear & Go to Login
            </Button>
          </div>

          {debugInfo && (
            <div>
              <Alert variant={debugInfo.token === 'EXISTS' ? 'success' : 'danger'}>
                <strong>🔑 Token:</strong> {debugInfo.token}
                {debugInfo.token === 'MISSING' && (
                  <div className='mt-2'>
                    <small>Token tidak ditemukan. Silakan login kembali.</small>
                  </div>
                )}
              </Alert>

              <Alert variant={debugInfo.userData === 'EXISTS' ? 'success' : 'danger'}>
                <strong>👤 User Data:</strong> {debugInfo.userData}
                {debugInfo.userData === 'MISSING' && (
                  <div className='mt-2'>
                    <small>Data user tidak ditemukan. Silakan login kembali.</small>
                  </div>
                )}
              </Alert>

              <Alert variant={debugInfo.canAccessAssetManagement ? 'success' : 'warning'}>
                <strong>🛡️ User Role:</strong> {debugInfo.userRole}
                <br />
                <strong>📦 Asset Management Access:</strong>{' '}
                {debugInfo.canAccessAssetManagement ? '✅ ALLOWED' : '❌ DENIED'}
                {!debugInfo.canAccessAssetManagement && (
                  <div className='mt-2'>
                    <small>
                      Role Anda tidak memiliki akses ke Asset Management. Diperlukan role:
                      SUPERADMIN atau ASSET_CONTROLLER
                    </small>
                  </div>
                )}
              </Alert>

              <Alert variant='info'>
                <strong>📝 User Name:</strong> {debugInfo.userName}
              </Alert>

              {debugInfo.fullUserData && (
                <details className='mt-3'>
                  <summary>📊 Full User Data (Click to expand)</summary>
                  <pre
                    className='mt-2 p-2 bg-light'
                    style={{ fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}
                  >
                    {JSON.stringify(debugInfo.fullUserData, null, 2)}
                  </pre>
                </details>
              )}

              <div className='mt-3'>
                <h6>🔧 Quick Actions:</h6>
                <div className='d-flex gap-2'>
                  {debugInfo.token === 'MISSING' && (
                    <Button variant='success' size='sm' onClick={goToLogin}>
                      Login Sekarang
                    </Button>
                  )}
                  {debugInfo.userRole === 'USER' && (
                    <div className='alert alert-info p-2 mb-0'>
                      <small>Hubungi admin untuk dapatkan akses Asset Management</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
