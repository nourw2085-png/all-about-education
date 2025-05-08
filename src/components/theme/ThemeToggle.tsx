
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ThemeToggleProps {
  variant?: 'button' | 'switch';
  showLabel?: boolean;
}

export function ThemeToggle({ 
  variant = 'button',
  showLabel = true 
}: ThemeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useAuth();

  if (variant === 'switch') {
    return (
      <div className="flex items-center space-x-2">
        {showLabel && <span className="text-sm mr-2">Dark Mode</span>}
        <Switch 
          checked={isDarkMode} 
          onCheckedChange={toggleDarkMode} 
          id="dark-mode" 
        />
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDarkMode}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
