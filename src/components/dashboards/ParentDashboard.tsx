import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Eye, BookOpen, CalendarCheck, FileText, Trophy } from 'lucide-react';

interface Child { user_id: string; name: string; avatar_url: string | null; student_code: string | null; papers: string[]; }

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: links } = await supabase.from('parent_links').select('student_id').eq('parent_id', user.id);
      const ids = (links ?? []).map(l => l.student_id);
      if (!ids.length) { setChildren([]); return; }
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id,name,avatar_url,student_code,papers')
        .in('user_id', ids);
      setChildren((profs ?? []) as Child[]);
      if (profs && profs[0]) setSelectedId(profs[0].user_id);
    })();
  }, [user]);

  const selected = children.find(c => c.user_id === selectedId);

  return (
    <div className="space-y-6">
      <section className="bg-edu-purple-50 dark:bg-edu-purple-900/20 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-800 dark:text-edu-purple-200">Welcome, {user?.name}</h2>
          <p className="text-muted-foreground flex items-center gap-2"><Eye size={14} /> View-only access to your child's academic progress.</p>
        </div>
        {children.length > 0 && (
          <Select value={selectedId ?? undefined} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[220px] bg-background"><SelectValue placeholder="Select child" /></SelectTrigger>
            <SelectContent>
              {children.map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </section>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No children linked yet. Add a child's student code from your profile.</p>
          </CardContent>
        </Card>
      ) : selected ? (
        <>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selected.avatar_url ?? undefined} />
                <AvatarFallback>{selected.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">Code: <code>{selected.student_code ?? '—'}</code></p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selected.papers?.map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center"><BookOpen size={16} className="mr-2 text-edu-purple-600" />Overall Grade</CardTitle>
                <CardDescription>Average across graded work</CardDescription>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold text-edu-purple-700">—</div><p className="text-xs text-muted-foreground">No graded items yet</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center"><CalendarCheck size={16} className="mr-2 text-edu-purple-600" />Attendance</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">—</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center"><FileText size={16} className="mr-2 text-edu-purple-600" />Assignments</CardTitle>
                <CardDescription>Submitted / Total</CardDescription>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">—</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center"><Trophy size={16} className="mr-2 text-edu-purple-600" />Quiz Activity</CardTitle>
                <CardDescription>Past week</CardDescription>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">—</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Read-only timeline of your child's academic events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">Activity will appear here as your child participates.</p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default ParentDashboard;
