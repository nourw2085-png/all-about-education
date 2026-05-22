
import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BookOpen,
  CalendarCheck,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import AvatarUpload from '@/components/profile/AvatarUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
      active 
        ? 'bg-edu-purple-100 text-edu-purple-700 dark:bg-edu-purple-900 dark:text-edu-purple-200' 
        : 'hover:bg-edu-purple-50 text-gray-700 hover:text-edu-purple-700 dark:hover:bg-edu-purple-900/50 dark:text-gray-300 dark:hover:text-edu-purple-200'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  activeNav: string;
}

const DashboardLayout = ({ children, title, activeNav }: DashboardLayoutProps) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileNavOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getNavItems = () => {
    const baseItems = [
      { 
        icon: <LayoutDashboard size={20} />, 
        label: 'Dashboard',
        path: '/dashboard',
      }
    ];
    
    let roleSpecificItems = [];
    
    switch (role) {
      case 'student':
        roleSpecificItems = [
          { icon: <MessageSquare size={20} />, label: 'Questions', path: '/questions' },
          { icon: <FileText size={20} />, label: 'Assignments', path: '/assignments' },
          { icon: <Trophy size={20} />, label: 'Daily Quiz', path: '/daily-quiz' },
          { icon: <BookOpen size={20} />, label: 'Materials', path: '/materials' },
          { icon: <CalendarCheck size={20} />, label: 'Attendance', path: '/attendance' },
        ];
        break;
      case 'assistant':
        roleSpecificItems = [
          { icon: <MessageSquare size={20} />, label: 'Questions', path: '/questions' },
          { icon: <FileText size={20} />, label: 'Assignments', path: '/assignments' },
          { icon: <BookOpen size={20} />, label: 'Materials', path: '/materials' },
          { icon: <CalendarCheck size={20} />, label: 'Attendance', path: '/attendance' },
        ];
        break;
      case 'teacher':
        roleSpecificItems = [
          { icon: <User size={20} />, label: 'Students', path: '/students' },
          { icon: <User size={20} />, label: 'Assistants', path: '/assistants' },
          { icon: <FileText size={20} />, label: 'Assignments', path: '/assignments' },
          { icon: <BookOpen size={20} />, label: 'Materials', path: '/materials' },
          { icon: <CalendarCheck size={20} />, label: 'Attendance', path: '/attendance' },
        ];
        break;
      case 'parent':
        roleSpecificItems = [
          { icon: <User size={20} />, label: 'My Child', path: '/my-child' },
          { icon: <MessageSquare size={20} />, label: 'Contact Assistant', path: '/contact-assistant' },
        ];
        break;
    }
    
    return [...baseItems, ...roleSpecificItems];
  };
  
  const navItems = getNavItems();
  
  const renderNav = () => (
    <div className="space-y-1 py-2">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          active={activeNav === item.path}
          onClick={() => handleNavigation(item.path)}
        />
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col h-full">
                <div className="px-2 py-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-edu-purple-700 dark:text-edu-purple-300">Tutor Quest Connect</h2>
                  <ThemeToggle />
                </div>
                <Separator />
                {renderNav()}
                <div className="mt-auto pt-4 px-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                  >
                    <LogOut size={20} className="mr-3" /> Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold ml-2 lg:ml-0">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {user && (
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:inline-block dark:text-gray-300">
                    {user.name}
                  </span>
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-edu-purple-200 text-edu-purple-700 dark:bg-edu-purple-800 dark:text-edu-purple-200">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Update your profile picture and preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <AvatarUpload />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setIsProfileOpen(false)}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar - desktop only */}
        <aside className="hidden lg:block w-56 bg-gray-50 border-r border-gray-200 p-4 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex flex-col h-full">
            <div className="space-y-1">
              {renderNav()}
            </div>
            <div className="mt-auto pt-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut size={20} className="mr-3" /> Logout
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
