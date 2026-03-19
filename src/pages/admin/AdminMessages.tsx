import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const AdminMessages: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    fetchMessages();
  }, [isAdmin, navigate]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const deleteMsg = async (id: string) => {
    await supabase.from('contact_messages').delete().eq('id', id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const filtered = (filter === 'unread' ? messages.filter(m => !m.is_read) : messages)
    .filter(m => !search || (m as any).message?.toLowerCase().includes(search.toLowerCase()) || (m as any).name?.toLowerCase().includes(search.toLowerCase()) || (m as any).email?.toLowerCase().includes(search.toLowerCase()));


  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/admin" className="flex items-center gap-2 text-aing-muted hover:text-aing-text text-sm mb-8 transition-colors">
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-aing-text">문의 관리</h1>
          <div className="relative mb-4">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-aing-muted"/>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="내용, 이름 검색..." className="input-field pl-8 py-1.5 text-xs w-64"/>
          </div>
          <div className="flex gap-2">
            {(['unread', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f ? 'bg-aing-dark text-white' : 'border border-aing-border text-aing-muted hover:text-aing-text'
                }`}>
                {f === 'unread' ? '미확인' : '전체'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <Mail size={32} className="text-aing-muted mx-auto mb-4 opacity-30" />
            <p className="text-aing-muted text-sm">문의가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(msg => (
              <div key={msg.id} className={`card ${!msg.is_read ? 'border-blue-200' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-aing-text text-sm">{msg.name}</span>
                      {!msg.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-aing-blue" />
                      )}
                      <span className="text-xs text-aing-muted ml-auto">
                        {new Date(msg.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <a href={`mailto:${msg.email}`} className="text-xs text-aing-blue hover:underline mb-2 block">
                      {msg.email}
                    </a>
                    <p className="text-sm text-aing-muted leading-relaxed">{msg.message}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!msg.is_read && (
                      <button onClick={() => markRead(msg.id)}
                        className="p-1.5 rounded-lg border border-green-200 text-green-500 hover:bg-green-50 transition-colors">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button onClick={() => deleteMsg(msg.id)}
                      className="p-1.5 rounded-lg border border-aing-border text-aing-muted hover:text-red-500 hover:border-red-200 transition-colors">
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
