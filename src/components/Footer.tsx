import React from 'react';
import { Link } from 'react-router-dom';
import { Github, MapPin, Instagram, Mail } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Footer: React.FC = () => {
  const s = useSiteSettings();

  const instagram = s.instagram || 'https://www.instagram.com/yourclub_official/';
  const github = s.github || 'https://github.com/yourclub-github';
  const email = s.email || '';
  const location = s.location || '○○대학교 AI관';
  const footerText = s.footer_text || '© 2026 YourClub. Licensed under CC BY-NC-SA 4.0.';
  const description = s.description || '학부생 주도 ○○ 학술 동아리.\n클럽의 슬로건을 입력하세요.';

  return (
    <footer className="border-t border-aing-border bg-aing-bg-alt">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="YourClub" className="h-7 w-auto opacity-90" />
              <span className="text-xs font-mono text-aing-muted">@ Your Univ.</span>
            </div>
            <p className="text-aing-muted text-sm leading-relaxed whitespace-pre-line">
              {description}
            </p>
            <div className="flex items-center gap-2 text-aing-muted text-xs">
              <MapPin size={12} />
              <span>{location}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-aing-text">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'About', to: '/about' },
                { label: 'Activities', to: '/activities' },
                { label: 'Members', to: '/members' },
                { label: 'Board', to: '/board' },
                { label: 'Contact', to: '/contact' },
                { label: 'Join Us', to: '/contact' },
              ].map(item => (
                <Link key={item.to + item.label} to={item.to}
                  className="text-aing-muted hover:text-aing-text text-sm transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-aing-text">Contact</h4>
            <div className="space-y-3">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm transition-colors">
                  <Instagram size={14} />
                  {instagram.replace(/.*instagram\.com\//, '@').replace(/\/$/, '')}
                </a>
              )}
              {github && (
                <a href={github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm transition-colors">
                  <Github size={14} />
                  {github.replace(/.*github\.com\//, '')}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm transition-colors">
                  <Mail size={14} />
                  {email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-aing-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-aing-muted text-xs">{footerText}</p>
          <p className="text-aing-muted text-xs font-mono">Undergraduate-led AI Academic Society</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
