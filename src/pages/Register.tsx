
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AVAILABLE_PAPERS, Paper } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [bankNumber, setBankNumber] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentCodes, setStudentCodes] = useState<string[]>([]);
  const [currentStudentCode, setCurrentStudentCode] = useState('');
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { register, signInWithGoogle, role } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!role) {
      navigate('/');
    }
  }, [role, navigate]);

  const addStudentCode = () => {
    if (currentStudentCode && !studentCodes.includes(currentStudentCode)) {
      setStudentCodes([...studentCodes, currentStudentCode]);
      setCurrentStudentCode('');
    } else if (currentStudentCode === '') {
      toast({
        title: "Error",
        description: "Please enter a student code",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Student code already added",
        variant: "destructive",
      });
    }
  };

  const removeStudentCode = (codeToRemove: string) => {
    setStudentCodes(studentCodes.filter(code => code !== codeToRemove));
  };

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
    
    if (role === 'parent' && studentCodes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one student code",
        variant: "destructive",
      });
      return;
    }

    if ((role === 'student' || role === 'assistant') && selectedPapers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one paper",
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
      
      await register(name, email, password, role, gender, bankNumber, studentCode, studentCodes, selectedPapers);
      
      toast({
        title: "Check your email",
        description: "We sent a verification link to your email. Click it to activate your account.",
      });
      
      navigate('/login');
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
            
            {(role === 'student' || role === 'assistant') && (
              <div className="space-y-2">
                <Label>Papers</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PAPERS.map((paper) => (
                    <div key={paper} className="flex items-center space-x-2">
                      <Checkbox
                        id={`paper-${paper}`}
                        checked={selectedPapers.includes(paper)}
                        onCheckedChange={(checked) => {
                          setSelectedPapers(prev =>
                            checked
                              ? [...prev, paper]
                              : prev.filter(p => p !== paper)
                          );
                        }}
                      />
                      <Label htmlFor={`paper-${paper}`} className="text-sm font-normal cursor-pointer">
                        {paper}
                      </Label>
                    </div>
                  ))}
                </div>
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
            
            {role === 'parent' && (
              <div className="space-y-2">
                <Label htmlFor="studentCodes">Student Codes</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="studentCodes" 
                    placeholder="Enter your child's student code" 
                    value={currentStudentCode}
                    onChange={(e) => setCurrentStudentCode(e.target.value)}
                  />
                  <Button type="button" onClick={addStudentCode} size="icon">
                    <Plus size={18} />
                  </Button>
                </div>
                {studentCodes.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium">Added students:</p>
                    <div className="flex flex-wrap gap-2">
                      {studentCodes.map((code, index) => (
                        <div key={index} className="bg-slate-100 px-3 py-1 rounded-full flex items-center text-sm">
                          {code}
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 ml-1"
                            onClick={() => removeStudentCode(code)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Add the student codes of your children</p>
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
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={async () => {
                try { await signInWithGoogle(); }
                catch (err) {
                  toast({ title: 'Google sign-in failed', description: err instanceof Error ? err.message : 'Try again', variant: 'destructive' });
                }
              }}
            >
              Continue with Google
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
