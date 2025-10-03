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
  const [pfp, setPfp] = useState('');
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleImageUrlChange(url: string) {
    setPfp(url);
    setImageError(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await registerUser(gmail, username, password, pfp || undefined);
      setMessage('Registration successful! Redirecting to login...');
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
            {/* Profile Image Preview */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 overflow-hidden mb-3 flex items-center justify-center">
                {pfp && !imageError ? (
                  <img 
                    src={pfp} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <p className="text-xs text-neutral-500">Profile Picture Preview</p>
            </div>

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
                minLength={6}
                placeholder="Minimum 6 characters"
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

            {/* Profile Image URL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                Profile Image URL <span className="text-neutral-500">(Optional)</span>
              </label>
              <input 
                type="url"
                value={pfp} 
                onChange={(e) => handleImageUrlChange(e.target.value)} 
                placeholder="https://example.com/your-image.jpg"
                className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-neutral-500 mt-1.5 flex items-start gap-1">
                <span>💡</span>
                <span>Paste a direct image URL (jpg, png, gif). Leave empty for default avatar.</span>
              </p>
              {imageError && (
                <p className="text-xs text-red-400 mt-1.5">
                  ⚠️ Failed to load image. Please check the URL.
                </p>
              )}
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
              {loading ? 'Creating Account...' : 'Create Account'}
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

        {/* Tips */}
        <div className="mt-6 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-300 mb-2">Tips for Profile Images:</h3>
          <ul className="text-xs text-neutral-400 space-y-1">
            <li>• Use a direct image URL (ending in .jpg, .png, .gif, etc.)</li>
            <li>• Try services like: imgur.com, postimg.cc, or imgbb.com</li>
            <li>• Make sure the image is publicly accessible</li>
            <li>• Recommended size: 200x200px or larger (square format)</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}


