import { useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(gmail, password);
      
      // Check if there's a redirect path stored
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-neutral-400 text-sm">Login to continue your CTF journey</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Email Address
              </label>
              <input 
                type="email" 
                value={gmail} 
                onChange={(e) => setGmail(e.target.value)} 
                required 
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Password
                </label>
                <button 
                  type="button"
                  className="text-xs text-yellow-400 hover:text-yellow-300"
                  onClick={() => alert('Password reset not implemented yet')}
                >
                  Forgot password?
                </button>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading} 
              className="w-full px-4 py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login to HackHive'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">
              Create one here
            </Link>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-3 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-neutral-400">CTF Challenges</div>
          </div>
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-3 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xs text-neutral-400">Leaderboard</div>
          </div>
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-3 text-center">
            <div className="text-2xl mb-1">💻</div>
            <div className="text-xs text-neutral-400">Terminal</div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1">
            🔒 Your connection is secure and encrypted
          </span>
        </div>
      </div>
    </AppLayout>
  );
}


