
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AssistantDashboard from '@/components/dashboards/AssistantDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';

const Dashboard = () => {
  const { user, isAuthenticated, role, loading, authReady } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!authReady || loading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Redirect to onboarding if profile is incomplete
    if (user) {
      const needsRole = !role;
      const needsPapers = (role === 'student' || role === 'assistant') && (!user.papers || user.papers.length === 0);
      const needsBank = role === 'assistant' && !user.bankNumber;
      if (needsRole || needsPapers || needsBank) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [authReady, isAuthenticated, loading, navigate, user, role]);
  
  if (loading || !authReady) {
    return null;
  }

  if (!user || !role) {
    return null;
  }
  
  const renderDashboardByRole = () => {
    switch (role) {
      case 'student':
        return <StudentDashboard />;
      case 'assistant':
        return <AssistantDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'parent':
        return <ParentDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };
  
  const getDashboardTitle = () => {
    switch (role) {
      case 'student':
        return 'Student Dashboard';
      case 'assistant':
        return 'Assistant Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      case 'parent':
        return 'Parent Dashboard';
      default:
        return 'Dashboard';
    }
  };
  
  return (
    <DashboardLayout 
      title={getDashboardTitle()}
      activeNav="/dashboard"
    >
      {renderDashboardByRole()}
    </DashboardLayout>
  );
};

export default Dashboard;
