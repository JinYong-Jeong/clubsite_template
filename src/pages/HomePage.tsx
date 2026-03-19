import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Code, Users, Zap, ChevronDown } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { useSiteSettings } from '../context/SiteSettingsContext';

const stats = [
  { label: 'Active Members', value: '40+' },
  { label: 'Projects', value: '12+' },
  { label: 'Semesters', value: '5+' },
  { label: 'Papers Studied', value: '100+' },
];

const tracks = [
  {
    id: 'junior',
    label: 'Junior Track',
    tag: 'Foundation',
    desc: '기초 논문의 수식을 코드로 매핑하며 딥러닝 파이프라인을 직접 체화합니다. 이론과 구현의 간극을 좁히는 과정.',
    icon: Brain,
    color: 'text-aing-blue',
    border: 'border-blue-200',
    bg: 'bg-aing-blue-light',
  },
  {
    id: 'senior',
    label: 'Senior Track',
    tag: 'Applied',
    desc: '특정 도메인의 SOTA 모델을 기반으로 커스텀 모델을 설계하고 실전 역량을 강화합니다. 포트폴리오 구축 중심.',
    icon: Code,
    color: 'text-purple-500',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
  },
];

const interests = ['Computer Vision', 'NLP', 'Reinforcement Learning', 'HCI', 'Multi-Agent Systems'];

const HomePage: React.FC = () => {
  const s = useSiteSettings();
  const heroTitle = s.home_hero_title || 'Theory to Code.';
  const heroSubtitle = s.home_hero_subtitle || '';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tagline = s.tagline || 'Theory to Code. Code to Insight.';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recruitOpen = s.recruit_open === 'true';
  const recruitUrl = s.recruit_url || '/contact';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const instagramUrl = s.instagram || 'https://www.instagram.com/aing_gc/';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const githubUrl = s.github || 'https://github.com/aing-gachon';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-aing-bg">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Grid bg */}
        <div
          className="absolute inset-0 bg-grid-pattern bg-grid opacity-100"
          style={{
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          }}
        />
        
        {/* Mouse glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59,130,246,0.05), transparent 40%)`,
          }}
        />

        {/* Blue glow center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
                    {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="A.ing"
              className="h-24 md:h-32 w-auto drop-shadow-lg"
            />
          </div>

          {/* Tagline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-tight">
            <span className="text-gradient">{heroTitle}</span>
            <br />
            <span className="text-aing-muted">Code to Insight.</span>
          </h1>
          {heroSubtitle && <p className="text-aing-muted text-lg mt-2">{heroSubtitle}</p>}

          <p className="text-aing-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            인공지능의 이론적 토대를 견고히 다지고,<br className="hidden md:block" />
            직접 구현하며 지식을 체화하는 학부생 주도 AI 학술 동아리.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={recruitUrl} className="btn-primary flex items-center gap-2 text-sm">
              Join A.ing
              <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn-ghost text-sm">
              Learn More
            </Link>
          </div>

          {/* Interests */}
          <div className="mt-16 flex flex-wrap justify-center gap-2">
            {interests.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#stats"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-aing-muted hover:text-aing-text transition-colors animate-bounce"
        >
          <ChevronDown size={20} />
        </a>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 border-t border-aing-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-semibold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-aing-muted text-sm">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">Study Tracks</h2>
              <p className="section-subtitle max-w-xl mx-auto">
                각자의 수준과 목표에 맞는 트랙에서 깊이 있는 학습을 진행합니다.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {tracks.map((track, i) => (
              <AnimatedSection key={track.id} delay={i * 150}>
                <div className={`card group cursor-pointer ${track.bg} border ${track.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${track.bg} border ${track.border}`}>
                      <track.icon size={20} className={track.color} />
                    </div>
                    <span className="tag-blue text-xs">
                      {track.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-aing-text mb-3">{track.label}</h3>
                  <p className="text-aing-muted text-sm leading-relaxed">{track.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-aing-muted group-hover:text-aing-blue transition-colors">
                    <Link to="/activities" className="flex items-center gap-1">
                      자세히 보기 <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6 border-t border-aing-border">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">Tech Stack</h2>
              <p className="section-subtitle">우리가 사용하는 기술들</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Python', desc: 'Primary Language' },
              { name: 'PyTorch', desc: 'Deep Learning' },
              { name: 'Jupyter', desc: 'Experimentation' },
              { name: 'GitHub', desc: 'Collaboration' },
            ].map((tech, i) => (
              <AnimatedSection key={tech.name} delay={i * 100}>
                <div className="card text-center group">
                  <div className="text-2xl font-mono font-bold text-gradient mb-2">
                    {tech.name}
                  </div>
                  <div className="text-aing-muted text-xs">{tech.desc}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="card relative overflow-hidden border-blue-200 bg-gradient-to-br from-aing-blue-light to-white text-center py-16">
              <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <Users className="text-aing-blue" size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-aing-text mb-4">
                  함께 성장할 멤버를 찾습니다
                </h2>
                <p className="text-aing-muted mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  AI에 진심인 사람이라면 누구든 환영합니다.<br />
                  이론과 구현, 두 가지를 함께 추구하세요.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/contact" className="btn-primary flex items-center gap-2 text-sm">
                    지원하기 <Zap size={14} />
                  </Link>
                  <Link to="/members" className="btn-ghost text-sm">
                    현재 멤버 보기
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
