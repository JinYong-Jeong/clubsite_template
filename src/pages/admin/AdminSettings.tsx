import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, RefreshCw, Globe, Users, Megaphone, Database, ShieldCheck, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Setting = { id: string; key: string; value: string; updated_at: string };

const SECTIONS = [
  {
    id: 'site',
    label: '사이트 기본 정보',
    icon: Globe,
    fields: [
      { key: 'description',         label: '동아리 소개 문구',       type: 'textarea', placeholder: '동아리를 소개하는 한 단락' },
      { key: 'footer_text',         label: '푸터 텍스트',             type: 'text',     placeholder: 'A.ing © 2026.' },
    ],
  },
  {
    id: 'contact',
    label: '연락처 & SNS',
    icon: Megaphone,
    fields: [
      { key: 'email',     label: '이메일',        type: 'text', placeholder: 'gachon.aing@gmail.com' },
      { key: 'github',    label: 'GitHub URL',    type: 'text', placeholder: 'https://github.com/aing-gachon' },
      { key: 'instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/aing_gc' },
      { key: 'notion',    label: 'Notion URL',    type: 'text', placeholder: 'https://notion.so/...' },
      { key: 'location',  label: '위치',           type: 'text', placeholder: '가천대학교 AI관' },
    ],
  },
  {
    id: 'interests',
    label: '관심분야 목록',
    icon: Database,
    fields: [
      { key: 'interests_list', label: '관심분야', type: 'tags', placeholder: 'CV,NLP,RL,Agent,Transformer,On-Device' },
    ],
  },
  {
    id: 'recruit',
    label: '모집 설정',
    icon: Users,
    fields: [
      { key: 'recruit_open', label: '모집 중 여부', type: 'toggle', placeholder: '' },
      { key: 'recruit_url',  label: '지원 링크 URL', type: 'text', placeholder: 'https://forms.gle/...' },
      { key: 'semester_current', label: '현재 학기', type: 'text', placeholder: '2026 Spring' },
      { key: 'max_members', label: '최대 정원', type: 'text', placeholder: '30' },
    ],
  },
];

const AdminSettings: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['site', 'contact', 'recruit']));

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchSettings();
  }, [isAdmin, navigate]);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_settings').select('*');
    const map: Record<string, string> = {};
    (data as Setting[] || []).forEach(s => { map[s.key] = s.value || ''; });
    setSettings(map);
    setLoading(false);
  };

  const saveSection = async (sectionId: string) => {
    const section = SECTIONS.find(s => s.id === sectionId);
    if (!section) return;
    setSaving(sectionId);
    const rows = section.fields.map(f => ({
      key: f.key,
      value: settings[f.key] || '',
      updated_at: new Date().toISOString(),
    }));
    await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    setSaving(null);
    setSaved(prev => [...prev, sectionId]);
    setTimeout(() => setSaved(prev => prev.filter(k => k !== sectionId)), 2000);
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-aing-text">사이트 설정</h1>
            <p className="text-aing-muted text-sm mt-1">사이트 정보, SNS, 모집 설정을 관리합니다.</p>
          </div>
          <button onClick={fetchSettings} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> 새로고침
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}</div>
        ) : (
          <div className="space-y-4">
            {SECTIONS.map(section => {
              const SIcon = section.icon;
              const isOpen = openSections.has(section.id);
              return (
                <div key={section.id} className="card p-0 overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-aing-bg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <SIcon size={16} className="text-aing-blue" />
                      <span className="text-sm font-semibold text-aing-text">{section.label}</span>
                    </div>
                    {isOpen ? <ChevronUp size={15} className="text-aing-muted" /> : <ChevronDown size={15} className="text-aing-muted" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4 border-t border-aing-border">
                      <div className="pt-4 space-y-4">
                        {section.fields.map(field => (
                          <div key={field.key}>
                            <label className="block text-xs text-aing-muted mb-1.5 font-mono">
                              {field.label} <span className="text-aing-border">({field.key})</span>
                            </label>
                            {field.type === 'tags' ? (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {(settings[field.key] || '').split(',').filter(Boolean).map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 tag text-xs">
                                      {tag.trim()}
                                      <button type="button" onClick={() => {
                                        const tags = (settings[field.key] || '').split(',').map(t=>t.trim()).filter(Boolean);
                                        tags.splice(idx, 1);
                                        setSettings(prev => ({ ...prev, [field.key]: tags.join(',') }));
                                      }} className="ml-1 text-red-400 hover:text-red-600 font-bold leading-none">×</button>
                                    </span>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  placeholder="추가할 관심분야 입력 후 Enter"
                                  className="input-field w-full text-sm"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = (e.target as HTMLInputElement).value.trim();
                                      if (val) {
                                        const tags = (settings[field.key] || '').split(',').map(t=>t.trim()).filter(Boolean);
                                        if (!tags.includes(val)) tags.push(val);
                                        setSettings(prev => ({ ...prev, [field.key]: tags.join(',') }));
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                            ) : field.type === 'toggle' ? (
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSettings(p => ({ ...p, [field.key]: p[field.key] === 'true' ? 'false' : 'true' }))}
                                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[field.key] === 'true' ? 'bg-aing-blue' : 'bg-aing-border'}`}
                                >
                                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[field.key] === 'true' ? 'left-6' : 'left-1'}`} />
                                </button>
                                <span className="text-sm text-aing-text">{settings[field.key] === 'true' ? '모집 중' : '모집 마감'}</span>
                              </div>
                            ) : field.type === 'textarea' ? (
                              <textarea
                                value={settings[field.key] || ''}
                                onChange={e => setSettings(p => ({ ...p, [field.key]: e.target.value }))}
                                className="input-field w-full resize-none"
                                rows={3}
                                placeholder={field.placeholder}
                              />
                            ) : (
                              <input
                                value={settings[field.key] || ''}
                                onChange={e => setSettings(p => ({ ...p, [field.key]: e.target.value }))}
                                className="input-field w-full"
                                placeholder={field.placeholder}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => saveSection(section.id)}
                          disabled={saving === section.id}
                          className={`btn-primary text-xs flex items-center gap-1.5 transition-all ${saved.includes(section.id) ? 'bg-green-600 border-green-500' : ''}`}
                        >
                          {saved.includes(section.id) ? <Check size={12} /> : <Save size={12} />}
                          {saving === section.id ? '저장 중...' : saved.includes(section.id) ? '저장됨 ✓' : '섹션 저장'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 관리자 빠른 링크 */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Database size={15} className="text-aing-blue" />
                <h3 className="text-sm font-semibold text-aing-text">관리 바로가기</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { to: '/admin/members', label: '멤버 관리' },
                  { to: '/admin/activities', label: '활동 관리' },
                  { to: '/admin/posts', label: '게시글 관리' },
                  { to: '/admin/projects', label: '프로젝트 관리' },
                  { to: '/admin/team', label: '팀 모집 관리' },
                  { to: '/admin/comments', label: '댓글 관리' },
                  { to: '/admin/messages', label: '문의 메시지' },
                ].map(item => (
                  <Link key={item.to} to={item.to} className="btn-ghost text-xs text-center py-2">{item.label}</Link>
                ))}
              </div>
            </div>

            {/* 보안 */}
            <div className="card border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={15} className="text-yellow-600" />
                <h3 className="text-sm font-semibold text-yellow-700">보안 안내</h3>
              </div>
              <p className="text-xs text-yellow-700 leading-relaxed">
                현재 비밀번호는 평문 저장입니다. 프로덕션 전 Supabase Auth 또는 bcrypt 해싱으로 전환을 권장합니다.
                admin 계정은 Supabase users 테이블에서 직접 관리하세요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
