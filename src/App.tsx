import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AboutOpsPage from './pages/AboutOpsPage';
import ExOpsPage from './pages/ExOpsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import HistoryPage from './pages/HistoryPage';
import MembersPage from './pages/MembersPage';
import MemberDetailPage from './pages/MemberDetailPage';
import MemberProfilePage from './pages/MemberProfilePage';
import TeamPage from './pages/TeamPage';
import TeamPostDetailPage from './pages/TeamPostDetailPage';
import BoardPage from './pages/BoardPage';
import NewPostPage from './pages/NewPostPage';
import PostDetailPage from './pages/PostDetailPage';
import ContactPage from './pages/ContactPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPosts from './pages/admin/AdminPosts';
import AdminPostEditor from './pages/admin/AdminPostEditor';
import AdminMembers from './pages/admin/AdminMembers';
import AdminMessages from './pages/admin/AdminMessages';
import AdminComments from './pages/admin/AdminComments';
import AdminActivities from './pages/admin/AdminActivities';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProjects from './pages/admin/AdminProjects';
import AdminTeamPosts from './pages/admin/AdminTeamPosts';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteSettingsProvider>
      <AuthProvider>
        <div className="min-h-screen bg-aing-black flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/ops" element={<AboutOpsPage />} />
              <Route path="/about/ex-ops" element={<ExOpsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/:id" element={<ActivityDetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/:id" element={<MemberDetailPage />} />
              <Route path="/members/:id/edit" element={<MemberProfilePage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/team/:id" element={<TeamPostDetailPage />} />
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/new" element={<NewPostPage />} />
              <Route path="/board/:id" element={<PostDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/posts" element={<AdminPosts />} />
              <Route path="/admin/posts/new" element={<AdminPostEditor />} />
              <Route path="/admin/posts/edit/:id" element={<AdminPostEditor />} />
              <Route path="/admin/members" element={<AdminMembers />} />
              <Route path="/admin/comments" element={<AdminComments />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/activities" element={<AdminActivities />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/team" element={<AdminTeamPosts />} />
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gradient mb-4">404</div>
                    <p className="text-aing-muted mb-6">페이지를 찾을 수 없습니다.</p>
                    <a href="/" className="btn-primary text-sm">홈으로</a>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
      </SiteSettingsProvider>
    </BrowserRouter>
  );
}

export default App;
