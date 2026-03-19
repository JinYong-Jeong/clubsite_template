import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Navbar: React.FC = () => {
  const s = useSiteSettings();
  const recruitOpen = s.recruit_open === 'true';
  const recruitUrl = s.recruit_url || '/contact';

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [aboutMenuOpen, setAboutMenuOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const aboutMenuRef = useRef<HTMLDivElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setMemberId(null);
      return;
    }
    if (user.member_id) {
      supabase
        .from('members')
        .select('avatar_url, id')
        .eq('id', user.member_id)
        .single()
        .then(({ data }) => {
          if (data) {
            setAvatarUrl(data.avatar_url ?? null);
            setMemberId(data.id);
          }
        });
    } else if (user.name !== 'admin') {
      supabase
        .from('members')
        .select('avatar_url, id')
        .ilike('name', user.name)
        .single()
        .then(({ data }) => {
          if (data) {
            setAvatarUrl(data.avatar_url ?? null);
            setMemberId(data.id);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setAdminMenuOpen(false);
    setAboutMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
      if (aboutMenuRef.current && !aboutMenuRef.current.contains(e.target as Node)) {
        setAboutMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'About', to: '/about', hasDropdown: true },
    { label: 'Activities', to: '/activities' },
    { label: 'History', to: '/history' },
    { label: 'Members', to: '/members' },
    { label: 'Team', to: '/team' },
    { label: 'Community', to: '/board' },
    { label: 'Contact', to: '/contact' },
  ];

  const aboutSubItems = [
    { label: 'About', to: '/about' },
    { label: 'Ops Team', to: '/about/ops' },
    { label: 'Ex-Ops', to: '/about/ex-ops' },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Posts', to: '/admin/posts' },
    { label: 'Members', to: '/admin/members' },
    { label: 'Projects', to: '/admin/projects' },
    { label: 'Team', to: '/admin/team' },
    { label: 'Activities', to: '/admin/activities' },
    { label: 'Comments', to: '/admin/comments' },
    { label: 'Messages', to: '/admin/messages' },
    { label: 'Settings', to: '/admin/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const profileLink = memberId ? `/members/${memberId}` : (isAdmin ? '/admin' : '/');

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass border-b border-aing-border' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src="/logo.png" alt="A.ing" className="h-10 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            item.hasDropdown ? (
              <div key={item.to} className="relative" ref={aboutMenuRef}>
                <button
                  onClick={() => setAboutMenuOpen(!aboutMenuOpen)}
                  className={`nav-link flex items-center gap-1 ${location.pathname.startsWith('/about') ? 'text-aing-text' : ''}`}
                >
                  {item.label}
                  <ChevronDown size={12} className={`transition-transform ${aboutMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {aboutMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-36 glass border border-aing-border rounded-xl shadow-xl py-1 z-50">
                    {aboutSubItems.map(sub => (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        className="block px-4 py-2 text-xs text-aing-muted hover:text-aing-text hover:bg-white/5 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive(item.to) ? 'text-aing-text' : ''}`}
              >
                {item.label}
              </Link>
            )
          ))}
        </div>

        {/* Right side - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {recruitOpen && (
        <a
          href={recruitUrl.startsWith('http') ? recruitUrl : 'https://' + recruitUrl}
          target={recruitUrl.startsWith('http') ? '_blank' : '_self'}
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold animate-pulse hover:bg-red-600 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          모집중
        </a>
      )}
      {user ? (
            <>
              {isAdmin && (
                <div className="relative" ref={adminMenuRef}>
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className="nav-link text-aing-blue flex items-center gap-1 text-xs"
                  >
                    Admin
                    <ChevronDown size={12} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {adminMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 glass border border-aing-border rounded-xl shadow-xl py-1 z-50">
                      {adminMenuItems.map(item => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="block px-4 py-2 text-xs text-aing-muted hover:text-aing-text hover:bg-white/5 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Link to={profileLink} title={user.name}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-aing-border hover:border-aing-blue transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aing-blue/30 to-purple-400/30 border border-aing-border flex items-center justify-center hover:border-aing-blue transition-colors">
                    <span className="text-xs font-semibold text-aing-text">
                      {user.name[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
              <button
                onClick={logout}
                className="text-aing-muted hover:text-aing-text transition-colors"
                title="로그아웃"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link flex items-center gap-1 text-xs hover:text-aing-text">
                <LogIn size={14} />
                로그인
              </Link>
              <Link to="/contact" className="btn-ghost text-sm !px-4 !py-2">
                Join Us
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-aing-muted hover:text-aing-text transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-aing-border px-6 py-6 flex flex-col gap-4">
          {navItems.map(item => (
            item.hasDropdown ? (
              <div key={item.to}>
                <span className="text-base font-medium text-aing-muted mb-2 block">{item.label}</span>
                <div className="flex flex-col gap-2 pl-3 border-l border-aing-border">
                  {aboutSubItems.map(sub => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className={`text-sm transition-colors ${isActive(sub.to) ? 'text-aing-text' : 'text-aing-muted hover:text-aing-text'}`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`text-base font-medium transition-colors ${
                  isActive(item.to) ? 'text-aing-text' : 'text-aing-muted hover:text-aing-text'
                }`}
              >
                {item.label}
              </Link>
            )
          ))}
          {user ? (
            <div className="pt-2 border-t border-aing-border flex flex-col gap-3">
              {isAdmin && (
                <div className="flex flex-col gap-2">
                  {adminMenuItems.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="text-xs text-aing-blue hover:text-aing-text transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Link to={profileLink} className="flex items-center gap-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-aing-border" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aing-blue/30 to-purple-400/30 border border-aing-border flex items-center justify-center">
                      <span className="text-xs font-semibold text-aing-text">{user.name[0].toUpperCase()}</span>
                    </div>
                  )}
                  <span className="text-sm text-aing-text">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="ml-auto text-xs text-aing-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <LogOut size={12} />
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-aing-border flex flex-col gap-3">
              <Link to="/login" className="flex items-center gap-2 text-sm text-aing-muted hover:text-aing-text transition-colors">
                <LogIn size={14} />
                로그인
              </Link>
              <Link to="/contact" className="btn-primary text-sm inline-block text-center w-full">
                Join Us
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
