import { LogIn } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';

type LoginLocationState = {
  from?: string;
};

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LoginLocationState | null;
  const redirectPath = state?.from && state.from.startsWith('/app/') ? state.from : '/app/demo-tenant/sites';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      login({ email, password });
      setErrorMessage('');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in');
    }
  }

  return (
    <div className="login-shell">
      <section className="login-card">
        <div className="login-brand">
          <img src="/luxlight-logo.svg" className="login-logo" alt="LuxLight AI" />
          <div>
            <p className="eyebrow">LuxLight AI</p>
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">Access monitoring, control actions, and evidence workflows.</p>
          </div>
        </div>

        {errorMessage ? <p className="notice error">{errorMessage}</p> : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            Work Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ops.manager@luxlight.ai"
              required
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </label>
          <button className="btn-primary login-submit" type="submit">
            <LogIn size={16} />
            Sign In
          </button>
        </form>
      </section>
    </div>
  );
}
