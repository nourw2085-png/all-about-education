import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth, AVAILABLE_PAPERS, type Paper } from '@/contexts/AuthContext';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  getDailyExercises,
  hasAttemptedToday,
  submitAttempt,
  getWeeklyLeaderboard,
  getUserHandicap,
  getReigningChampion,
  finalizePreviousWeeks,
  weekKey,
  type Exercise,
  type DailyAttempt,
  DAILY_QUIZ_SIZE,
} from '@/lib/dailyQuiz';

const DailyQuizPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Determine selectable papers
  const userPapers: (Paper | 'General')[] = useMemo(() => {
    const list = (user?.papers && user.papers.length > 0)
      ? [...user.papers]
      : [...AVAILABLE_PAPERS];
    return list as (Paper | 'General')[];
  }, [user]);

  const [activePaper, setActivePaper] = useState<Paper | 'General'>(userPapers[0] || 'O Level Edexcel');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState<DailyAttempt | null>(null);
  const [tick, setTick] = useState(0); // to refresh leaderboard after submit

  // Finalize previous weeks once per mount
  useEffect(() => { finalizePreviousWeeks(); }, []);

  // Load today's exercises whenever paper changes
  useEffect(() => {
    const ex = getDailyExercises(activePaper);
    setExercises(ex);
    setAnswers(new Array(ex.length).fill(-1));
    setSubmitted(null);
    if (user && hasAttemptedToday(user.id, activePaper)) {
      // user already played today: no replay
      setSubmitted({
        userId: user.id, userName: user.name, paper: activePaper,
        date: new Date().toISOString().slice(0, 10), weekKey: weekKey(),
        correctCount: 0, totalCount: ex.length,
        rawPoints: 0, awardedPoints: 0, handicapPct: 0,
      });
    }
  }, [activePaper, user]);

  const handicap = user ? getUserHandicap(user.id, activePaper) : 0;
  const champion = getReigningChampion(activePaper);
  const leaderboard = useMemo(
    () => getWeeklyLeaderboard(activePaper),
    [activePaper, tick, submitted],
  );

  const allAnswered = answers.every((a) => a >= 0);
  const alreadyDone = !!submitted && submitted.totalCount > 0 && submitted.rawPoints === 0 && submitted.correctCount === 0
    ? hasAttemptedToday(user?.id || '', activePaper)
    : !!submitted;

  const onSubmit = () => {
    if (!user) return;
    const result = submitAttempt({
      userId: user.id, userName: user.name,
      paper: activePaper, exercises, answers,
    });
    setSubmitted(result);
    setTick((t) => t + 1);
    toast({
      title: 'Quiz submitted!',
      description: `You got ${result.correctCount}/${result.totalCount} correct and earned ${result.awardedPoints} points.`,
    });
  };

  const isStudent = user?.role === 'student';

  return (
    <DashboardLayout title="Daily Mini Quiz" activeNav="/daily-quiz">
      <div className="space-y-6">
        {/* Header */}
        <section className="bg-edu-purple-50 dark:bg-edu-purple-900/20 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-edu-purple-800 dark:text-edu-purple-200 flex items-center gap-2">
                <Sparkles size={22} /> Today's Challenge
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Solve {DAILY_QUIZ_SIZE} fresh exercises every day. Earn points, climb the weekly leaderboard, stay consistent.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {champion && (
                <Badge variant="outline" className="gap-1">
                  <Flame size={14} className="text-orange-500" />
                  Reigning streak: {champion.streak} {champion.streak === 1 ? 'week' : 'weeks'}
                </Badge>
              )}
              {handicap > 0 && (
                <Badge className="bg-orange-500 hover:bg-orange-600">
                  Your handicap: −{handicap}%
                </Badge>
              )}
            </div>
          </div>
        </section>

        <Tabs value={activePaper} onValueChange={(v) => setActivePaper(v as Paper)}>
          <TabsList className="flex flex-wrap h-auto">
            {userPapers.map((p) => (
              <TabsTrigger key={p} value={p}>{p}</TabsTrigger>
            ))}
          </TabsList>

          {userPapers.map((p) => (
            <TabsContent key={p} value={p} className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Quiz */}
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{p} — Daily Set</span>
                        <Badge variant="secondary">{exercises.length} questions</Badge>
                      </CardTitle>
                      <CardDescription>
                        {isStudent
                          ? alreadyDone
                            ? 'You have completed today\'s quiz. Come back tomorrow for a new set.'
                            : 'Pick the correct answer for each question, then submit.'
                          : 'Only students can submit quizzes. You can still preview and view the leaderboard.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {exercises.map((ex, i) => {
                        const showResult = !!submitted && submitted.rawPoints + submitted.correctCount > 0;
                        const userAnswer = answers[i];
                        const isCorrect = userAnswer === ex.correctIndex;
                        return (
                          <div key={ex.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-medium">
                                {i + 1}. {ex.question}
                              </p>
                              <Badge variant="outline">{ex.basePoints} pts</Badge>
                            </div>
                            <RadioGroup
                              value={userAnswer >= 0 ? String(userAnswer) : ''}
                              onValueChange={(v) => {
                                if (alreadyDone || !isStudent) return;
                                const next = [...answers];
                                next[i] = parseInt(v, 10);
                                setAnswers(next);
                              }}
                              className="space-y-1"
                            >
                              {ex.choices.map((c, ci) => {
                                const correct = ci === ex.correctIndex;
                                const picked = ci === userAnswer;
                                return (
                                  <div
                                    key={ci}
                                    className={`flex items-center space-x-2 rounded px-2 py-1 ${
                                      showResult && correct ? 'bg-green-50 dark:bg-green-900/20' :
                                      showResult && picked && !correct ? 'bg-red-50 dark:bg-red-900/20' : ''
                                    }`}
                                  >
                                    <RadioGroupItem value={String(ci)} id={`${ex.id}-${ci}`} disabled={alreadyDone || !isStudent} />
                                    <Label htmlFor={`${ex.id}-${ci}`} className="cursor-pointer flex-1">
                                      {c}
                                    </Label>
                                    {showResult && correct && <CheckCircle2 size={16} className="text-green-600" />}
                                    {showResult && picked && !correct && <XCircle size={16} className="text-red-600" />}
                                  </div>
                                );
                              })}
                            </RadioGroup>
                            {showResult && (
                              <p className={`text-xs mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {isCorrect ? `+${ex.basePoints} pts` : 'Incorrect'}
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {isStudent && !alreadyDone && (
                        <Button
                          className="w-full bg-edu-purple-600 hover:bg-edu-purple-700"
                          disabled={!allAnswered}
                          onClick={onSubmit}
                        >
                          Submit Quiz {!allAnswered && `(answer all ${exercises.length} first)`}
                        </Button>
                      )}

                      {submitted && submitted.rawPoints + submitted.correctCount > 0 && (
                        <Card className="bg-edu-purple-50 dark:bg-edu-purple-900/20 border-edu-purple-200">
                          <CardContent className="pt-4 space-y-2">
                            <p className="font-medium">
                              Result: {submitted.correctCount} / {submitted.totalCount} correct
                            </p>
                            <Progress value={(submitted.correctCount / submitted.totalCount) * 100} />
                            <div className="text-sm flex flex-wrap gap-x-4">
                              <span>Raw: <strong>{submitted.rawPoints}</strong></span>
                              {submitted.handicapPct > 0 && (
                                <span className="text-orange-600">Handicap: −{submitted.handicapPct}%</span>
                              )}
                              <span>Awarded: <strong className="text-edu-purple-700">{submitted.awardedPoints} pts</strong></span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Leaderboard */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" />
                        Weekly Leaderboard
                      </CardTitle>
                      <CardDescription>{p} • {weekKey()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {leaderboard.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No entries yet this week. Be the first!</p>
                      ) : (
                        <ol className="space-y-2">
                          {leaderboard.slice(0, 10).map((e, idx) => (
                            <li
                              key={e.userId}
                              className={`flex items-center justify-between p-2 rounded ${
                                idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                                idx === 1 ? 'bg-gray-50 dark:bg-gray-800/40' :
                                idx === 2 ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold w-6">{idx + 1}.</span>
                                <span className="truncate">
                                  {e.userName}{user && e.userId === user.id ? ' (you)' : ''}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-edu-purple-700">{e.totalPoints} pts</div>
                                <div className="text-xs text-muted-foreground">{e.daysActive}d active</div>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">How points work</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-2">
                      <p>• Each correct answer awards points (8–14 depending on difficulty).</p>
                      <p>• Points are tallied weekly per paper.</p>
                      <p>• Win the week and you'll earn a <strong>−25% handicap</strong> next week. Win again and it stacks (−50%, −75%…).</p>
                      <p>• Lose the top spot and your handicap resets to 0.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DailyQuizPage;
