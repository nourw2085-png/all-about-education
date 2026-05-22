import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Award, CheckCircle, Trophy, Sparkles } from 'lucide-react';
import BankInfoForm from '../assistant/BankInfoForm';

interface PointEvent { id: string; kind: string; points: number; created_at: string; note: string | null; }

const KIND_LABEL: Record<string, string> = {
  question_answered: 'Answered student question',
  assignment_graded: 'Graded assignment',
  quiz_graded: 'Graded quiz',
  quality_bonus: 'Quality bonus from teacher',
};

const KIND_ICON: Record<string, React.ReactNode> = {
  question_answered: <MessageSquare size={14} />,
  assignment_graded: <CheckCircle size={14} />,
  quiz_graded: <Trophy size={14} />,
  quality_bonus: <Sparkles size={14} />,
};

const AssistantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<PointEvent[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('point_events')
        .select('*')
        .eq('assistant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setEvents((data ?? []) as PointEvent[]);
    })();
  }, [user]);

  const totals = events.reduce((acc, e) => {
    acc.total += e.points;
    const wkAgo = Date.now() - 7 * 24 * 3600 * 1000;
    if (new Date(e.created_at).getTime() > wkAgo) acc.weekly += e.points;
    acc.byKind[e.kind] = (acc.byKind[e.kind] ?? 0) + e.points;
    return acc;
  }, { total: 0, weekly: 0, byKind: {} as Record<string, number> });

  return (
    <div className="space-y-6">
      <section className="bg-edu-purple-50 dark:bg-edu-purple-900/20 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-800 dark:text-edu-purple-200">Welcome, {user?.name}</h2>
          <p className="text-muted-foreground">Earn points by answering questions and grading work.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="text-lg px-3 py-1 bg-edu-purple-600">{totals.total} pts total</Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">+{totals.weekly} this week</Badge>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.keys(KIND_LABEL).map(k => (
          <Card key={k}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">{KIND_ICON[k]} {KIND_LABEL[k]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.byKind[k] ?? 0}</div>
              <p className="text-xs text-muted-foreground">points earned</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award size={18} className="text-edu-purple-600" />Recent Point Activity</CardTitle>
          <CardDescription>Every action you've been rewarded for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">No points yet. Start by answering a student question.</p>
              <Button onClick={() => navigate('/chat')}>Open Chat</Button>
            </div>
          )}
          {events.map(e => (
            <div key={e.id} className="flex items-center justify-between p-3 rounded border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-edu-purple-100 dark:bg-edu-purple-900/30 text-edu-purple-700 dark:text-edu-purple-200">
                  {KIND_ICON[e.kind]}
                </div>
                <div>
                  <p className="font-medium text-sm">{KIND_LABEL[e.kind] ?? e.kind}</p>
                  <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                </div>
              </div>
              <Badge className="bg-green-600">+{e.points}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-bold mb-3">Payment Information</h2>
        <BankInfoForm />
      </section>
    </div>
  );
};

export default AssistantDashboard;
