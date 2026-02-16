import { memo } from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Users, BookOpen, Heart } from 'lucide-react';

const RoleCard = memo<{
  title: string;
  description: string;
  role: UserRole;
  icon: React.ReactNode;
  onClick: () => void;
}>(({ title, description, icon, onClick }) => (
  <Card className="w-full max-w-sm transition-transform duration-150 hover:scale-[1.02] hover:shadow-lg hover:border-primary will-change-transform">
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardFooter className="flex justify-center">
      <Button className="w-full" onClick={onClick}>
        Continue as {title}
      </Button>
    </CardFooter>
  </Card>
));

RoleCard.displayName = 'RoleCard';

const roles = [
  { title: 'Student', description: 'Submit assignments, ask questions, and track your progress', role: 'student' as UserRole, icon: User },
  { title: 'Assistant', description: 'Help students, answer questions, and earn points', role: 'assistant' as UserRole, icon: Users },
  { title: 'Teacher', description: 'Supervise assistants, create assignments, and monitor progress', role: 'teacher' as UserRole, icon: BookOpen },
  { title: 'Parent', description: "View your child's progress, attendance, and assignments", role: 'parent' as UserRole, icon: Heart },
] as const;

const Index = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();
  
  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Welcome</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A platform connecting students, assistants, teachers, and parents for enhanced learning experiences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mx-auto">
          {roles.map(({ title, description, role, icon: Icon }) => (
            <RoleCard
              key={role}
              title={title}
              description={description}
              role={role}
              icon={<Icon size={32} className="text-primary" />}
              onClick={() => handleRoleSelect(role)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
