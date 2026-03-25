import LoginForm from './components/LoginForm';
import { useLoginScreen } from './hooks/useLoginScreen';

export default function LoginScreen() {
  const { fields, errors, loading, notif, handleChange, handleSubmit } = useLoginScreen();

  return (
    <LoginForm
      fields={fields}
      errors={errors}
      loading={loading}
      notif={notif}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
