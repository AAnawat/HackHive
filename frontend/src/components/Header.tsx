import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-lg blur-md group-hover:blur-lg transition-all"></div>
              <img 
                src="/Hive.png" 
                alt="HackHive" 
                className="relative h-10 w-10 transform group-hover:scale-110 transition-transform" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 text-transparent bg-clip-text">
                HackHive
              </span>
              <span className="text-[10px] text-neutral-500 -mt-1">CTF Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink 
              to="/problems" 
              className={({ isActive }) => 
                `px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive 
                    ? 'bg-yellow-500/10 text-yellow-400 shadow-lg shadow-yellow-500/20' 
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                }`
              }
            >
              <span className="flex items-center gap-2">
                <span>🍯</span>
                <span>Challenges</span>
              </span>
            </NavLink>

          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800/50 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
                          {user.pfp_path ? (
                            <img src={user.pfp_path} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm">👤</span>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-950"></div>
                    </div>
                    <span className="hidden md:block font-medium text-sm">{user.username}</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50">
                      <div className="p-3 border-b border-neutral-800 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-0.5">
                            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
                              {user.pfp_path ? (
                                <img src={user.pfp_path} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span>👤</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{user.username}</p>
                            <p className="text-xs text-neutral-400 truncate">{user.gmail}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-neutral-800 transition-colors"
                        >
                          <span className="text-lg">👤</span>
                          <span className="text-sm">My Profile</span>
                        </Link>
                        
                        <div className="border-t border-neutral-800 my-2"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <span className="text-lg">🚪</span>
                          <span className="text-sm font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg font-medium text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg font-semibold text-sm bg-yellow-500 text-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-800 py-4 space-y-2">
            <NavLink
              to="/problems"
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'text-neutral-300 hover:bg-neutral-800/50'
                }`
              }
            >
              <span>🍯</span>
              <span className="font-medium">Challenges</span>
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}


