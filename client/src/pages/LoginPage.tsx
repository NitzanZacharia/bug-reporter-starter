import { useNavigate } from 'react-router-dom';
import { useState} from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!email || !password) {
      setError('Missing email or password');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/check-status?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        setError('Failed to check status');
        return;
      }
      const userStatus = await response.json();
      if (userStatus.status === 'blacklisted') {
        setError(userStatus.reason || 'You are not allowed to log in.');
        return
      } 
      localStorage.setItem('userStatus', userStatus.status);
      localStorage.setItem('userEmail', email);
      if (userStatus.status === 'admin') {
        navigate('/reports');
      } else {
        navigate('/report');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'checking status...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
