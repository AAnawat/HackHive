import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { getUser, updateUser } from '../api/client';
import type { User } from '../types';

export default function ProfilePage() {
  const { user: authUser, token } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [username, setUsername] = useState(authUser?.username || '');
  const [gmail, setGmail] = useState(authUser?.gmail || '');
  const [pfp, setPfp] = useState(authUser?.pfp_path || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    getUser(authUser.id)
      .then((u: any) => {
        if (cancelled) return;
        setUser(u);
        setUsername(u.username);
        setGmail(u.gmail);
        setPfp(u.pfp_path);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authUser?.id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !user) {
      setError('Not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload: any = {};
      if (username && username !== user.username) payload.username = username;
      if (gmail && gmail !== user.gmail) payload.gmail = gmail;
      if (pfp && pfp !== user.pfp_path) payload.pfp_path = pfp;
      if (password) payload.password = password;
      if (Object.keys(payload).length === 0) {
        setMessage('No changes');
      } else {
        await updateUser(user.id, payload, token);
        setMessage('Profile updated');
      }
    } catch (e: any) {
      setError(e.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  if (!authUser) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] grid place-items-center text-neutral-300">
          Please login to view your profile.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur px-5 sm:px-6 py-6 sm:py-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={pfp || '/Hive.png'}
                alt="Profile"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-neutral-800 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500 text-black text-xs font-semibold border border-neutral-900">
                ID
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-semibold truncate">{username || 'Unnamed'}</div>
              <div className="text-sm text-neutral-400 truncate">{gmail || '-'}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-800 my-6" />

          {/* Alerts */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/50 text-red-300 px-4 py-2 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-lg border border-green-900/60 bg-green-950/50 text-green-300 px-4 py-2 text-sm">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            <section>
              <h3 className="text-sm font-semibold text-neutral-300 mb-3">Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5 text-neutral-400">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="yourname"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5 text-neutral-400">Gmail</label>
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="you@gmail.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1.5 text-neutral-400">Profile Image Path</label>
                  <input
                    value={pfp}
                    onChange={(e) => setPfp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="/images/me.png"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-neutral-300 mb-3">Security</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs mb-1.5 text-neutral-400">New Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </section>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-medium hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
