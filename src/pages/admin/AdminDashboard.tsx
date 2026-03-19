import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, Mail, PlusCircle, CheckCircle,
  XCircle, Eye, LogOut, TrendingUp, BarChart2, BookOpen, Code2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import AnimatedSection from '../../components/AnimatedSection';

const AdminDashboard: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ members: 0, posts: 0, comments: 0, messages: 0, activities: 0, teamPosts: 0 });
  const [pendingComments, setPendingComments] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/admin/login'); return; }
    const fetchData = async () => {
      try {
        const [m, p, c, msg, pc, um] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact', head: true }),
          supabase.from('posts').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*', { count: 'exact', head: true }),
          supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*').eq('is_approved', false).order('created_at', { ascending: false }).limit(5),
          supabase.from('contact_messages').select('*').eq('is_read', false).order('created_at', { ascending: false }).limit(5),
        ]);
        const act = await supabase.from('activities').select('*', { count: 'exact', head: true });
        const tp = await supabase.from('team_posts').select('*', { count: 'exact', head: true });
        setStats({
          members: m.count || 0,
          posts: p.count || 0,
          comments: c.count || 0,
          messages: msg.count || 0,
          activities: act.count || 0,
          teamPosts: tp.count || 0,
        });
        setPendingComments(pc.data || []);
        setUnreadMessages(um.data || []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [isAdmin, navigate]);

  const approveComment = async (id: string) => {
    await supabase.from('comments').update({ is_approved: true }).eq('id', id);
    setPendingComments(prev => prev.filter(c => c.id !== id));
  };

  const deleteComment = async (id: string) => {
    await supabase.from('comments').delete().eq('id', id);
    setPendingComments(prev => prev.filter(c => c.id !== id));
  };

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    setUnreadMessages(prev => prev.filter(m => m.id !== id));
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-aing-bg pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-2xl font-semibold text-aing-text">Admin Dashboard</h1>
              <p className="text-aing-muted text-sm mt-1">YourClub 관리자 패널</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </AnimatedSection>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
          {[
            { label: 'Members', value: stats.members, icon: Users, color: 'text-aing-blue', to: '/admin/members' },
            { label: 'Posts', value: stats.posts, icon: MessageSquare, color: 'text-purple-500', to: '/admin/posts' },
            { label: 'Comments', value: stats.comments, icon: BarChart2, color: 'text-green-500', to: '/admin/comments' },
            { label: 'Messages', value: stats.messages, icon: Mail, color: 'text-orange-500', to: '/admin/messages' },
            { label: 'Activities', value: stats.activities, icon: BookOpen, color: 'text-teal-500', to: '/admin/activities' },
            { label: 'Team Posts', value: stats.teamPosts, icon: Users, color: 'text-pink-500', to: '/admin/team' },
          ].map((s, i) => (
            <AnimatedSection key={s.label} delay={i * 80}>
              <Link to={s.to} className="card group hover:border-blue-200 block">
                <div className="flex items-start justify-between">
                  <s.icon size={18} className={`${s.color} mb-3`} />
                  <TrendingUp size={12} className="text-aing-muted" />
                </div>
                <div className="text-2xl font-semibold text-aing-text mb-1">
                  {loading ? '—' : s.value}
                </div>
                <div className="text-xs text-aing-muted">{s.label}</div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        {/* Quick Actions */}
        <AnimatedSection delay={200}>
          <div className="card mb-8">
            <h3 className="text-sm font-semibold text-aing-text mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/posts/new" className="btn-primary flex items-center gap-2 text-sm">
                <PlusCircle size={14} />
                새 게시글
              </Link>
              <Link to="/admin/members" className="btn-ghost flex items-center gap-2 text-sm">
                <Users size={14} />
                부원 관리
              </Link>
              <Link to="/admin/projects" className="btn-ghost flex items-center gap-2 text-sm">
                <Code2 size={14} />
                프로젝트 관리
              </Link>
              <Link to="/admin/activities" className="btn-ghost flex items-center gap-2 text-sm">
                <BookOpen size={14} />
                활동 관리
              </Link>
              <Link to="/admin/team" className="btn-ghost flex items-center gap-2 text-sm">
                <Users size={14} />
                팀원 모집 관리
              </Link>
              <Link to="/admin/messages" className="btn-ghost flex items-center gap-2 text-sm">
                <Mail size={14} />
                문의 확인
              </Link>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Comments */}
          <AnimatedSection delay={300}>
            <div className="card h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-aing-text flex items-center gap-2">
                  <MessageSquare size={14} className="text-aing-blue" />
                  승인 대기 댓글 ({pendingComments.length})
                </h3>
                <Link to="/admin/comments" className="text-xs text-aing-muted hover:text-aing-text">
                  전체 보기
                </Link>
              </div>
              {pendingComments.length === 0 ? (
                <p className="text-aing-muted text-sm text-center py-8">대기 중인 댓글이 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {pendingComments.map(c => (
                    <div key={c.id} className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-aing-text">{c.author_name}</span>
                        <div className="flex gap-2">
                          <button onClick={() => approveComment(c.id)} className="text-green-500 hover:text-green-400 transition-colors">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => deleteComment(c.id)} className="text-red-500 hover:text-red-400 transition-colors">
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-aing-muted line-clamp-2">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Unread Messages */}
          <AnimatedSection delay={350}>
            <div className="card h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-aing-text flex items-center gap-2">
                  <Mail size={14} className="text-orange-500" />
                  미확인 문의 ({unreadMessages.length})
                </h3>
                <Link to="/admin/messages" className="text-xs text-aing-muted hover:text-aing-text">
                  전체 보기
                </Link>
              </div>
              {unreadMessages.length === 0 ? (
                <p className="text-aing-muted text-sm text-center py-8">미확인 문의가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {unreadMessages.map(m => (
                    <div key={m.id} className="p-3 rounded-xl bg-aing-bg-alt border border-aing-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-aing-text">{m.name}</span>
                        <button
                          onClick={() => markRead(m.id)}
                          className="text-xs text-aing-muted hover:text-aing-text transition-colors flex items-center gap-1"
                        >
                          <Eye size={12} />
                          확인
                        </button>
                      </div>
                      <p className="text-xs text-aing-blue mb-1">{m.email}</p>
                      <p className="text-xs text-aing-muted line-clamp-2">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
