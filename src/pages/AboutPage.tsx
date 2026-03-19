import React from 'react';
import { Brain, Code, Target, Layers, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';

const juniorWeeks = [
  { week: '1-2주', title: '논문 선정', desc: '기초 딥러닝 논문 선정 및 수식 분석' },
  { week: '3-4주', title: '코드 매핑', desc: '수식을 코드로 직접 구현하며 파이프라인 체화' },
  { week: '5-6주', title: '실험', desc: '다양한 데이터셋으로 실험 및 결과 분석' },
  { week: '7-8주', title: '발표', desc: '구현 결과 발표 및 팀 피드백' },
];

const seniorWeeks = [
  { week: '1주', title: '주제 선정', desc: 'SOTA 모델 기반 주제 선정 및 코드 파악' },
  { week: '2-3주', title: '커스터마이징', desc: '내 데이터/환경에 맞게 코드 수정' },
  { week: '4-5주', title: '최적화', desc: '모델 구조 개선 및 하이퍼파라미터 튜닝' },
  { week: '6-7주', title: '정리', desc: '결과 정리, 로그 작성, 웹 데모 제작' },
  { week: '8주', title: '발표', desc: '최종 결과물 발표 및 피드백' },
];

const domains = [
  { name: 'Computer Vision', tag: 'CV', desc: '이미지 인식, 객체 탐지, 생성 모델 등', color: 'text-blue-500 border-blue-200 bg-blue-50' },
  { name: 'Natural Language Processing', tag: 'NLP', desc: '언어 모델, 텍스트 분류, 번역 등', color: 'text-purple-500 border-purple-200 bg-purple-50' },
  { name: 'Reinforcement Learning', tag: 'RL', desc: '에이전트 학습, 보상 설계, 환경 구축', color: 'text-green-500 border-green-200 bg-green-50' },
  { name: 'HCI & Multi-Agent', tag: 'HCI', desc: '사람-AI 상호작용, 멀티에이전트 시스템', color: 'text-orange-500 border-orange-200 bg-orange-50' },
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            {/* Sub-navigation */}
            <div className="flex items-center gap-2 mb-6 text-xs text-aing-muted flex-wrap">
              <Link to="/about" className="hover:text-aing-text transition-colors text-aing-text font-medium">About</Link>
              <ChevronRight size={12} />
              <Link to="/about/ops" className="hover:text-aing-text transition-colors">Ops Team</Link>
              <ChevronRight size={12} />
              <Link to="/about/ex-ops" className="hover:text-aing-text transition-colors">Ex-Ops</Link>
            </div>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <span>About</span>
            </div>
            <h1 className="section-title text-5xl md:text-6xl mb-6">
              이론과 구현의<br />
              <span className="text-gradient">교차점</span>
            </h1>
            <p className="section-subtitle max-w-2xl leading-relaxed text-lg">
              YourClub은 ○○대학교 학부생들이 주도하는 인공지능 학술 동아리입니다.
              단순히 코드를 실행하는 것을 넘어, 수식을 이해하고 직접 구현하는 과정을 통해
              진짜 실력을 쌓는 것을 목표로 합니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Theory First',
                desc: '논문의 수식과 개념을 먼저 이해합니다. 블랙박스 없이, 원리부터.',
                color: 'text-aing-blue',
              },
              {
                icon: Code,
                title: 'Build It',
                desc: '이해한 것을 직접 코드로 구현합니다. 구현이 곧 진짜 이해의 증명.',
                color: 'text-purple-500',
              },
              {
                icon: Target,
                title: 'Level Up',
                desc: '기초부터 SOTA까지. 각자의 속도로, 함께 성장합니다.',
                color: 'text-green-500',
              },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 150}>
                <div className="card h-full">
                  <item.icon size={24} className={`${item.color} mb-4`} />
                  <h3 className="text-lg font-semibold text-aing-text mb-3">{item.title}</h3>
                  <p className="text-aing-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks Detail */}
      <section className="py-24 px-6 border-t border-aing-border">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="mb-16">
              <h2 className="section-title mb-4">Study Tracks</h2>
              <p className="section-subtitle">단계별 심화 학습 프로그램</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Junior */}
            <AnimatedSection delay={0}>
              <div className="card border-blue-200 bg-aing-blue-light h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white border border-blue-200">
                    <Brain size={18} className="text-aing-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-aing-text">Junior Track</h3>
                    <span className="text-xs text-aing-blue font-mono">Foundation</span>
                  </div>
                </div>
                <p className="text-aing-muted text-sm mb-6 leading-relaxed">
                  기초 논문의 수식을 코드로 매핑하며 딥러닝 파이프라인을 체화합니다.
                  이론과 구현 사이의 간극을 좁히는 것이 핵심입니다.
                </p>
                <div className="space-y-3">
                  {juniorWeeks.map((w) => (
                    <div key={w.week} className="flex gap-4 text-sm">
                      <span className="text-aing-blue font-mono text-xs w-14 shrink-0 pt-0.5">{w.week}</span>
                      <div>
                        <span className="text-aing-text font-medium">{w.title}</span>
                        <span className="text-aing-muted ml-2">{w.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Senior */}
            <AnimatedSection delay={150}>
              <div className="card border-purple-200 bg-purple-50 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white border border-purple-200">
                    <Code size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-aing-text">Senior Track</h3>
                    <span className="text-xs text-purple-500 font-mono">Applied Research</span>
                  </div>
                </div>
                <p className="text-aing-muted text-sm mb-6 leading-relaxed">
                  특정 도메인의 SOTA 모델을 기반으로 커스텀 모델을 설계합니다.
                  실전 역량 강화와 포트폴리오 구축을 목표로 합니다.
                </p>
                <div className="space-y-3">
                  {seniorWeeks.map((w) => (
                    <div key={w.week} className="flex gap-4 text-sm">
                      <span className="text-purple-500 font-mono text-xs w-14 shrink-0 pt-0.5">{w.week}</span>
                      <div>
                        <span className="text-aing-text font-medium">{w.title}</span>
                        <span className="text-aing-muted ml-2">{w.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Research Domains */}
      <section className="py-24 px-6 border-t border-aing-border">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="mb-16">
              <h2 className="section-title mb-4">Research Interests</h2>
              <p className="section-subtitle">우리가 탐구하는 AI 분야들</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-4">
            {domains.map((d, i) => (
              <AnimatedSection key={d.tag} delay={i * 100}>
                <div className={`card border rounded-2xl flex items-start gap-4 ${d.color}`}>
                  <div className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold shrink-0 ${d.color}`}>
                    {d.tag}
                  </div>
                  <div>
                    <h3 className="text-aing-text font-medium mb-1">{d.name}</h3>
                    <p className="text-aing-muted text-sm">{d.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-24 px-6 border-t border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="card border-blue-200">
              <div className="flex items-center gap-3 mb-8">
                <Layers size={20} className="text-aing-blue" />
                <h2 className="text-xl font-semibold text-aing-text">지원 자격</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-aing-text mb-4">필수 조건</h4>
                  <ul className="space-y-2 text-sm text-aing-muted">
                    {[
                      'Python 코드를 읽고 수정할 수 있는 능력',
                      '로컬 Jupyter/Python 환경 설정 가능',
                      '팀 프로젝트에 적극적으로 참여할 의지',
                      '기본적인 딥러닝 지식 (모델, 손실함수 등)',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-aing-blue mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-aing-text mb-4">우대 사항</h4>
                  <ul className="space-y-2 text-sm text-aing-muted">
                    {[
                      '선택 도메인(CV/NLP/RL)에 대한 기본 이해',
                      '논문 읽기 가능 여부',
                      '기본적인 Git/GitHub 사용 경험',
                      '주니어 트랙 수료 또는 유사 프로젝트 경험',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-aing-border flex items-center justify-between">
                <p className="text-aing-muted text-sm">지원하고 싶다면?</p>
                <Link to="/contact" className="btn-primary flex items-center gap-2 text-sm">
                  지원하기 <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
