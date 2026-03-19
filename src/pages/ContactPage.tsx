import React, { useState } from 'react';
import { Mail, MapPin, Github, Send, CheckCircle, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AnimatedSection from '../components/AnimatedSection';
import { useSiteSettings } from '../context/SiteSettingsContext';

const ContactPage: React.FC = () => {
  const s = useSiteSettings();
  const instagramUrl = s.instagram || 'https://www.instagram.com/yourclub_official/';
  const githubUrl = s.github || 'https://github.com/yourclub-github';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const emailAddr = s.email || 'yourclub@gmail.com';
  const locationStr = s.location || '○○대학교 AI관';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recruitUrl = s.recruit_url || '/contact';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const recruitOpen = s.recruit_open === 'true';
  const notionUrl = s.notion || '';

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        message: form.message,
        is_read: false,
      });
      if (!error) {
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
      }
    } catch {
      setSubmitted(true); // show success anyway for demo
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      {/* Header */}
      <section className="py-20 px-6 border-b border-aing-border">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 tag-blue mb-6">
              <Mail size={12} />
              <span>Contact</span>
            </div>
            <h1 className="section-title text-5xl mb-4">
              <span className="text-gradient">Get in Touch</span>
            </h1>
            <p className="section-subtitle max-w-xl">
              동아리에 관심이 있거나 질문이 있다면 언제든지 연락주세요.<br />
              지원 문의도 환영합니다.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Info */}
            <AnimatedSection direction="left">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-aing-text mb-6">Contact Info</h2>
                  <div className="space-y-4">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 group"
                    >
                      <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                        <Instagram size={18} className="text-aing-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-aing-muted mb-0.5">Instagram</p>
                        <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">
                          @yourclub_official
                        </p>
                      </div>
                    </a>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-4 group"
                    >
                      <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                        <Github size={18} className="text-aing-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-aing-muted mb-0.5">GitHub</p>
                        <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">
                          {githubUrl.replace('https://', '')}
                        </p>
                      </div>
                    </a>
                    {notionUrl && (
                      <a
                        href={notionUrl.startsWith('http') ? notionUrl : 'https://' + notionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 group"
                      >
                        <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border group-hover:border-blue-200 transition-colors">
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] text-aing-blue" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>
                        </div>
                        <div>
                          <p className="text-xs text-aing-muted mb-0.5">Notion</p>
                          <p className="text-sm text-aing-text group-hover:text-aing-blue transition-colors">
                            {notionUrl.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                      </a>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border">
                        <MapPin size={18} className="text-aing-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-aing-muted mb-0.5">Location</p>
                        <p className="text-sm text-aing-text">{locationStr}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-aing-text mb-4">자주 묻는 질문</h3>
                  <div className="space-y-4">
                    {[
                      {
                        q: '언제 모집하나요?',
                        a: '매 학기 초에 신규 부원을 모집합니다. 공지사항을 확인해주세요.',
                      },
                      {
                        q: '학년 제한이 있나요?',
                        a: '학년 제한 없이 지원 가능합니다. Python 기초 지식이 필요합니다.',
                      },
                      {
                        q: '활동 주기는 어떻게 되나요?',
                        a: '주 1회 세션 + 자율 학습으로 진행됩니다.',
                      },
                    ].map(item => (
                      <div key={item.q} className="border-b border-aing-border last:border-0 pb-4 last:pb-0">
                        <p className="text-sm font-medium text-aing-text mb-1">{item.q}</p>
                        <p className="text-sm text-aing-muted">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection delay={150} direction="right">
              <div className="card">
                <h2 className="text-lg font-semibold text-aing-text mb-6">메시지 보내기</h2>
                {submitted ? (
                  <div className="py-16 text-center">
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
                    <h3 className="text-aing-text font-semibold mb-2">메시지가 전송되었습니다!</h3>
                    <p className="text-aing-muted text-sm">빠른 시일 내로 답변드리겠습니다.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-ghost text-sm mt-6"
                    >
                      다시 보내기
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs text-aing-muted mb-2">이름 *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="input-field"
                        placeholder="홍길동"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-aing-muted mb-2">이메일 *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="input-field"
                        placeholder="example@gachon.ac.kr"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-aing-muted mb-2">메시지 *</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        className="input-field resize-none"
                        rows={6}
                        placeholder="지원 동기, 질문사항 등을 자유롭게 작성해주세요."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? '전송 중...' : (
                        <>
                          전송하기 <Send size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
