import { useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '../layouts/AppLayout';
import { registerUser } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [gmail, setGmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await registerUser(gmail, username, password);
      setMessage('Registration successful! Redirecting to login');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
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
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-neutral-400 text-sm">Join HackHive and start your CTF journey</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Email Address *
              </label>
              <input 
                type="email" 
                value={gmail} 
                onChange={(e) => setGmail(e.target.value)} 
                required 
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Username *
              </label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Choose a unique username"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Password *
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Confirm Password *
              </label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Re-enter your password"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading} 
              className="w-full px-4 py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating Account' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


