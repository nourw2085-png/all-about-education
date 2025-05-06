
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/contexts/AuthContext';
import { User, Users, BookOpen, ParentIcon } from 'lucide-react';

const RoleCard: React.FC<{
  title: string;
  description: string;
  role: UserRole;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <Card className="w-full max-w-sm transition-all hover:shadow-lg hover:border-edu-purple-500">
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 p-3 bg-edu-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardFooter className="flex justify-center">
      <Button 
        className="w-full bg-edu-purple-600 hover:bg-edu-purple-700" 
        onClick={onClick}
      >
        Continue as {title}
      </Button>
    </CardFooter>
  </Card>
);

const Index = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();
  
  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-edu-purple-50 p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-edu-purple-800">Tutor Quest Connect</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A platform connecting students, assistants, teachers, and parents for enhanced learning experiences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mx-auto">
          <RoleCard
            title="Student"
            description="Submit assignments, ask questions, and track your progress"
            role="student"
            icon={<User size={32} className="text-edu-purple-600" />}
            onClick={() => handleRoleSelect('student')}
          />
          
          <RoleCard
            title="Assistant"
            description="Help students, answer questions, and earn points"
            role="assistant"
            icon={<Users size={32} className="text-edu-purple-600" />}
            onClick={() => handleRoleSelect('assistant')}
          />
          
          <RoleCard
            title="Teacher"
            description="Supervise assistants, create assignments, and monitor progress"
            role="teacher"
            icon={<BookOpen size={32} className="text-edu-purple-600" />}
            onClick={() => handleRoleSelect('teacher')}
          />
          
          <RoleCard
            title="Parent"
            description="View your child's progress, attendance, and assignments"
            role="parent"
            icon={<ParentIcon size={32} className="text-edu-purple-600" />}
            onClick={() => handleRoleSelect('parent')}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
