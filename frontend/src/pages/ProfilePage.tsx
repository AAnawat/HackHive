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
    getUser(authUser.id).then((u: any) => {
      if (cancelled) return;
      setUser(u);
      setUsername(u.username);
      setGmail(u.gmail);
      setPfp(u.pfp_path);
    }).catch(() => {});
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
        <div>Please login to view your profile.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <img src={pfp || '/Hive.png'} alt="pfp" className="h-16 w-16 rounded-full border border-neutral-800" />
          <div>
            <div className="text-lg font-semibold">{username}</div>
            <div className="text-sm text-neutral-400">{gmail}</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Gmail</label>
            <input type="email" value={gmail} onChange={(e) => setGmail(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Profile Image Path</label>
            <input value={pfp} onChange={(e) => setPfp(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password (optional)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {message && <div className="text-green-400 text-sm">{message}</div>}
          <button disabled={loading} className="px-4 py-2 rounded bg-yellow-500 text-black font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </AppLayout>
  );
}


