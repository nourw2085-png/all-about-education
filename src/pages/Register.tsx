
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [bankNumber, setBankNumber] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, role } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!role) {
      navigate('/');
    }
  }, [role, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!gender) {
      toast({
        title: "Error",
        description: "Please select your gender",
        variant: "destructive",
      });
      return;
    }
    
    if (role === 'assistant' && !bankNumber) {
      toast({
        title: "Error",
        description: "Bank account number is required for assistants",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (!role) {
        toast({
          title: "Error",
          description: "Please select a role first",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      await register(name, email, password, role, gender, bankNumber, studentCode);
      
      toast({
        title: "Success",
        description: "Registration successful",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getRoleDisplay = () => {
    switch (role) {
      case 'student': return 'Student';
      case 'assistant': return 'Assistant';
      case 'teacher': return 'Teacher';
      case 'parent': return 'Parent';
      default: return '';
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-edu-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft size={18} />
            </Button>
            <CardTitle className="text-2xl">Register as {getRoleDisplay()}</CardTitle>
          </div>
          <CardDescription>Create a new account to access the platform</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male-register" />
                  <Label htmlFor="male-register">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female-register" />
                  <Label htmlFor="female-register">Female</Label>
                </div>
              </RadioGroup>
            </div>
            
            {role === 'assistant' && (
              <div className="space-y-2">
                <Label htmlFor="bankNumber">Bank Account Number</Label>
                <Input 
                  id="bankNumber" 
                  placeholder="Enter your bank account number" 
                  value={bankNumber}
                  onChange={(e) => setBankNumber(e.target.value)}
                  required
                />
              </div>
            )}
            
            {role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="studentCode">Student Code (Optional)</Label>
                <Input 
                  id="studentCode" 
                  placeholder="Enter your student code if you have one" 
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">If left empty, a code will be generated for you</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              className="w-full bg-edu-purple-600 hover:bg-edu-purple-700"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                Log in
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
