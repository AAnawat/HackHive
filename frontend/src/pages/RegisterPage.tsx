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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-400' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'text-yellow-400' };
    return { strength, label: 'Strong', color: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Real-time validation
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = gmail && username && password && confirmPassword && 
                    password === confirmPassword && 
                    password.length >= 8 && 
                    validateEmail(gmail);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Client-side validation
    if (!validateEmail(gmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
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
      await registerUser(gmail.trim().toLowerCase(), username.trim(), password);
      setMessage('Registration successful! Redirecting to login...');
      
      // Clear form
      setGmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Account created successfully! Please log in.' }
        });
      }, 1500);
    } catch (e: any) {
      const errorMsg = e.message || 'Registration failed';
      
      // Handle specific error messages
      if (errorMsg.includes('already exists')) {
        setError('An account with this email already exists');
      } else if (errorMsg.includes('duplicate')) {
        setError('This email is already registered');
      } else {
        setError(errorMsg);
      }
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
              <span className="text-3xl">🚀</span>
            </div>
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
                autoComplete="email"
                className={`w-full px-4 py-2 rounded-lg bg-neutral-800 border transition-colors ${
                  gmail && !validateEmail(gmail) 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-neutral-700 focus:border-yellow-500'
                } focus:outline-none`}
              />
              {gmail && !validateEmail(gmail) && (
                <p className="text-xs text-red-400 mt-1">Please enter a valid email</p>
              )}
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
                minLength={3}
                placeholder="Choose a unique username"
                autoComplete="username"
                className={`w-full px-4 py-2 rounded-lg bg-neutral-800 border transition-colors ${
                  username && username.length < 3
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-neutral-700 focus:border-yellow-500'
                } focus:outline-none`}
              />
              {username && username.length < 3 && (
                <p className="text-xs text-red-400 mt-1">Username must be at least 3 characters</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Password *
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-2 pr-10 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-400">Password strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength.strength <= 2 ? 'bg-red-500' :
                        passwordStrength.strength <= 3 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Confirm Password *
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-2 pr-10 rounded-lg bg-neutral-800 border transition-colors ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-neutral-700 focus:border-yellow-500'
                  } focus:outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm flex items-start gap-2">
                <span>✅</span>
                <span>{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading || !canSubmit} 
              className="w-full px-4 py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
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

        {/* Password Requirements Info */}
        <div className="mt-4 bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <h3 className="text-sm font-semibold mb-2 text-neutral-300">Password Requirements:</h3>
          <ul className="text-xs text-neutral-400 space-y-1">
            <li className="flex items-center gap-2">
              <span className={password.length >= 8 ? 'text-green-400' : 'text-neutral-500'}>
                {password.length >= 8 ? '✓' : '○'}
              </span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-400' : 'text-neutral-500'}>
                {/[A-Z]/.test(password) && /[a-z]/.test(password) ? '✓' : '○'}
              </span>
              Mix of uppercase and lowercase letters
            </li>
            <li className="flex items-center gap-2">
              <span className={/\d/.test(password) ? 'text-green-400' : 'text-neutral-500'}>
                {/\d/.test(password) ? '✓' : '○'}
              </span>
              At least one number
            </li>
            <li className="flex items-center gap-2">
              <span className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-400' : 'text-neutral-500'}>
                {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'}
              </span>
              Special character recommended
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}