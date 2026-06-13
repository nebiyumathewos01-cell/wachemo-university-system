import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Check your connection.';
      setError(msg);
      toast.error(msg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, system-ui, sans-serif' },
    box: { background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    logo: { textAlign: 'center', marginBottom: '28px' },
    logoBox: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#1e3a8a', borderRadius: '16px', color: '#fff', fontWeight: '800', fontSize: '20px', marginBottom: '12px' },
    h1: { margin: '0 0 4px', fontSize: '22px', fontWeight: '700', color: '#111827' },
    sub: { margin: 0, fontSize: '13px', color: '#6b7280' },
    label: { display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff' },
    row: { marginBottom: '16px' },
    btn: { width: '100%', padding: '12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
    btnDisabled: { width: '100%', padding: '12px', background: '#93c5fd', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'not-allowed', marginTop: '8px' },
    errorBox: { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' },
    link: { color: '#1d4ed8', textDecoration: 'none', fontWeight: '500' },
    footer: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' },
    demo: { background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 16px', textAlign: 'center', marginTop: '16px', color: '#e0e7ff', fontSize: '12px', maxWidth: '420px', width: '100%' },
    forgot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  };

  return (
    <div style={s.page}>
      <div style={s.box}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoBox}>WU</div>
          <h1 style={s.h1}>Welcome Back</h1>
          <p style={s.sub}>Wachemo University · Non-Cafeteria System</p>
        </div>

        {/* Error */}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={s.row}>
            <label style={s.label}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              style={s.input}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={s.row}>
            <div style={s.forgot}>
              <label style={{ ...s.label, margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ ...s.link, fontSize: '12px' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative', marginTop: '6px' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
                style={{ ...s.input, paddingRight: '44px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px', lineHeight: 1 }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={loading ? s.btnDisabled : s.btn}>
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Register here</Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div style={s.demo}>
        🔐 Admin login: <strong>admin@wachemo.edu.et</strong> / <strong>Admin@123456</strong>
      </div>
    </div>
  );
};

export default Login;
