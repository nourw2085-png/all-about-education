import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AVAILABLE_PAPERS, Paper, UserRole, Gender } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const Onboarding = () => {
  const { user, role, authReady, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selRole, setSelRole] = useState<UserRole>(role ?? null);
  const [gender, setGender] = useState<Gender | ''>('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [bankNumber, setBankNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authReady && !loading && !isAuthenticated) navigate('/');
  }, [authReady, loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      if (!selRole && role) setSelRole(role);
      if (!gender && user.gender) setGender(user.gender);
      if (papers.length === 0 && user.papers?.length) setPapers(user.papers);
      if (!bankNumber && user.bankNumber) setBankNumber(user.bankNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const needsPapers = selRole === 'student' || selRole === 'assistant';
  const needsBank = selRole === 'assistant';

  const canSubmit = useMemo(() => {
    if (!selRole || !gender) return false;
    if (needsPapers && papers.length === 0) return false;
    if (needsBank && !bankNumber.trim()) return false;
    return true;
  }, [selRole, gender, papers, bankNumber, needsPapers, needsBank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selRole || !gender) return;
    try {
      setSaving(true);

      const { error: pErr } = await supabase
        .from('profiles')
        .update({
          gender,
          papers: needsPapers ? papers : [],
          bank_number: needsBank ? bankNumber : null,
        })
        .eq('user_id', user.id);
      if (pErr) throw pErr;

      // Ensure role row exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', selRole)
        .maybeSingle();

      if (!existingRole) {
        const { error: rErr } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: selRole });
        if (rErr) throw rErr;
      }

      toast({ title: 'Profile completed', description: 'Welcome aboard!' });
      // Hard reload to refresh auth context with new role/profile
      window.location.assign('/dashboard');
    } catch (err) {
      toast({
        title: 'Could not save',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!authReady || loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-edu-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>Tell us a bit more so we can set up your portal.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>I am a…</Label>
              <Select value={selRole ?? ''} onValueChange={(v) => setSelRole(v as UserRole)}>
                <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup value={gender} onValueChange={(v) => setGender(v as Gender)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="ob-male" />
                  <Label htmlFor="ob-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="ob-female" />
                  <Label htmlFor="ob-female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            {needsBank && (
              <div className="space-y-2">
                <Label htmlFor="bank">Bank Account Number</Label>
                <Input id="bank" value={bankNumber} onChange={(e) => setBankNumber(e.target.value)} placeholder="Enter your bank account number" />
              </div>
            )}

            {needsPapers && (
              <div className="space-y-2">
                <Label>Papers</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PAPERS.map((paper) => (
                    <div key={paper} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ob-paper-${paper}`}
                        checked={papers.includes(paper)}
                        onCheckedChange={(checked) =>
                          setPapers((prev) => (checked ? [...prev, paper] : prev.filter((p) => p !== paper)))
                        }
                      />
                      <Label htmlFor={`ob-paper-${paper}`} className="text-sm font-normal cursor-pointer">{paper}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-edu-purple-600 hover:bg-edu-purple-700" disabled={!canSubmit || saving}>
              {saving ? 'Saving…' : 'Continue'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Onboarding;
