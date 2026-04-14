import { Form, Button, Spinner } from 'react-bootstrap';
import Notifikasi from '../../../components/shared/notification/Notification';

export default function LoginForm({ fields, errors, loading, notif, onChange, onSubmit }) {
  return (
    <div className='login-container'>
      <div
        className='login-background'
        style={{ backgroundImage: "url('/assets/images/background/Rectangle.png')" }}
      />
      <div className='login-form-wrapper'>
        <Notifikasi status={notif.status} message={notif.message} />
        <img src='/assets/images/logo/SAMIT.png' alt='Logo SAMIT' className='login-logo' />
        <h2 className='login-title'>WELCOME TO SAMIT</h2>
        <p className='login-subtitle'>Please login to continue</p>

        <Form className='login-form' onSubmit={onSubmit}>
          <Form.Group className='mb-3'>
            <Form.Control
              type='text'
              placeholder='Masukkan NIK'
              value={fields.nik}
              onChange={(e) => onChange('nik', e.target.value)}
              isInvalid={!!errors.nik}
            />
            <Form.Control.Feedback type='invalid'>{errors.nik}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className='mb-3'>
            <Form.Control
              type='password'
              placeholder='Masukkan Password'
              value={fields.password}
              onChange={(e) => onChange('password', e.target.value)}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type='invalid'>{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Button type='submit' className='w-100 login-btn' disabled={loading}>
            {loading ? <Spinner animation='border' size='sm' /> : 'LOGIN'}
          </Button>
        </Form>
      </div>
    </div>
  );
}
