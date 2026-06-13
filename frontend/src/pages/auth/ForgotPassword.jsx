import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiMail, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {sent ? (
            <div className="text-center">
              <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">We sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login" className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <FiMail className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
                <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                <Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
