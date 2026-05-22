import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, AlertTriangle, Award, Activity, Clock } from 'lucide-react';

interface AssistantRow {
  assistant_id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  weekly_points: number;
  answers: number;
  assignments_graded: number;
  quizzes_graded: number;
}

interface PendingConv {
  id: string;
  student_id: string;
  assistant_id: string;
  last_message_at: string;
  student_name?: string;
  last_sender_id?: string;
  minutes_waiting?: number;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [assistantRows, setAssistantRows] = useState<AssistantRow[]>([]);
  const [pending, setPending] = useState<PendingConv[]>([]);
  const [activeStudents, setActiveStudents] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id,role');
      const students = (roles ?? []).filter(r => r.role === 'student').map(r => r.user_id);
      setStudentCount(students.length);

      const { data: scores } = await supabase
        .from('assistant_scores')
        .select('*')
        .order('weekly_points', { ascending: false });
      setAssistantRows((scores ?? []) as AssistantRow[]);

      // Pending conversations: last message from a student waiting > 0
      const { data: convs } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false }).limit(30);
      const convList = (convs ?? []) as PendingConv[];
      if (convList.length) {
        const ids = convList.map(c => c.id);
        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('conversation_id,sender_id,created_at')
          .in('conversation_id', ids)
          .order('created_at', { ascending: false });
        const seen = new Set<string>();
        const lastBy = new Map<string, { sender_id: string; created_at: string }>();
        (lastMsgs ?? []).forEach(m => {
          if (seen.has(m.conversation_id)) return;
          seen.add(m.conversation_id);
          lastBy.set(m.conversation_id, { sender_id: m.sender_id, created_at: m.created_at });
        });
        const pendingFiltered = convList.filter(c => {
          const lm = lastBy.get(c.id);
          return lm && lm.sender_id === c.student_id;
        }).map(c => {
          const lm = lastBy.get(c.id)!;
          return { ...c, last_sender_id: lm.sender_id, minutes_waiting: Math.round((Date.now() - new Date(lm.created_at).getTime()) / 60000) };
        });
        // Get student names
        const studentIds = pendingFiltered.map(p => p.student_id);
        if (studentIds.length) {
          const { data: profs } = await supabase.from('profiles').select('user_id,name').in('user_id', studentIds);
          const map = new Map((profs ?? []).map(p => [p.user_id, p.name]));
          pendingFiltered.forEach(p => p.student_name = map.get(p.student_id));
        }
        setPending(pendingFiltered.slice(0, 5));
      }

      // Active students = students who sent a message in last 7 days
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const { data: recentMsgs } = await supabase
        .from('messages')
        .select('sender_id')
        .gte('created_at', since);
      const recentSet = new Set((recentMsgs ?? []).map(m => m.sender_id));
      setActiveStudents(students.filter(s => recentSet.has(s)).length);
    })();
  }, [user]);

  const totalWeekly = assistantRows.reduce((s, a) => s + a.weekly_points, 0);

  return (
    <div className="space-y-6">
      <section className="bg-edu-purple-50 dark:bg-edu-purple-900/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-edu-purple-800 dark:text-edu-purple-200">Welcome, {user?.name}</h2>
        <p className="text-muted-foreground">Monitor students, assistants, and platform activity.</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-2"><Users size={14} />Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{studentCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-2"><Activity size={14} />Active (7d)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeStudents}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-2"><MessageSquare size={14} />Pending Q's</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{pending.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-2"><Award size={14} />Assistant Pts (7d)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalWeekly}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" />Pending Student Questions</CardTitle>
            <CardDescription>Conversations awaiting an assistant reply</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No pending questions 🎉</p>}
            {pending.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{p.student_name ?? 'Student'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} /> waiting {p.minutes_waiting}m</p>
                </div>
                <Badge variant={p.minutes_waiting! > 60 ? 'destructive' : 'secondary'}>
                  {p.minutes_waiting! > 60 ? 'Overdue' : 'Pending'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award size={18} className="text-edu-purple-600" />Assistant Performance</CardTitle>
            <CardDescription>Weekly leaderboard with point breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assistantRows.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No assistants yet.</p>}
            {assistantRows.slice(0, 6).map((a, i) => (
              <div key={a.assistant_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40">
                <span className="text-sm font-bold w-5">{i + 1}</span>
                <Avatar className="h-9 w-9"><AvatarImage src={a.avatar_url ?? undefined} /><AvatarFallback>{a.name?.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.answers} answers · {a.assignments_graded} graded · {a.quizzes_graded} quizzes</p>
                </div>
                <Badge>{a.weekly_points} pts</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/students')} variant="outline">View Students</Button>
          <Button onClick={() => navigate('/assistants')} variant="outline">View Assistants</Button>
          <Button onClick={() => navigate('/assignments')} variant="outline">Assignments</Button>
          <Button onClick={() => navigate('/chat')} variant="outline">Monitor Chats</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
