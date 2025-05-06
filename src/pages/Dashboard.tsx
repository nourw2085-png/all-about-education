
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AssistantDashboard from '@/components/dashboards/AssistantDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import ParentDashboard from '@/components/dashboards/ParentDashboard';

const Dashboard = () => {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
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
