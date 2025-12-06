import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockStudent, mockAssignments, mockAttendanceRecords, mockQuizzes } from '@/data/mockData';
import { 
  User, FileText, CalendarCheck, BookOpen, Award, 
  ChevronRight, TrendingUp, Clock
} from 'lucide-react';

const MyChild = () => {
  const navigate = useNavigate();

  // Calculate stats
  const assignmentStats = {
    total: mockAssignments.length,
    completed: mockAssignments.filter(a => a.status !== 'pending').length,
    graded: mockAssignments.filter(a => a.status === 'graded').length
  };

  const quizStats = {
    total: mockQuizzes.length,
    completed: mockQuizzes.filter(q => q.status !== 'pending').length,
    graded: mockQuizzes.filter(q => q.status === 'graded').length
  };

  const attendanceStats = {
    total: mockAttendanceRecords.length,
    present: mockAttendanceRecords.filter(a => a.status === 'present').length,
    absent: mockAttendanceRecords.filter(a => a.status === 'absent').length,
    late: mockAttendanceRecords.filter(a => a.status === 'late').length
  };

  const attendanceRate = Math.round((attendanceStats.present / attendanceStats.total) * 100);

  // Calculate average grade
  const gradedItems = [
    ...mockAssignments.filter(a => a.grade),
    ...mockQuizzes.filter(q => q.grade)
  ];
  const averageGrade = gradedItems.length > 0
    ? Math.round(gradedItems.reduce((sum, item) => sum + (item.grade || 0), 0) / gradedItems.length)
    : 0;

  return (
    <DashboardLayout title="My Child" activeNav="/my-child">
      <div className="space-y-6">
        {/* Child Profile Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="bg-primary/10 p-6 rounded-full">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold">{mockStudent.name}</h2>
                <p className="text-muted-foreground">{mockStudent.grade}</p>
                <p className="text-sm text-muted-foreground">{mockStudent.email}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="text-center bg-background p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary">{averageGrade}%</div>
                  <div className="text-sm text-muted-foreground">Average Grade</div>
                </div>
                <div className="text-center bg-background p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600">{attendanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Attendance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignmentStats.completed}/{assignmentStats.total}</div>
              <Progress value={(assignmentStats.completed / assignmentStats.total) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{assignmentStats.graded} graded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizStats.completed}/{quizStats.total}</div>
              <Progress value={(quizStats.completed / quizStats.total) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{quizStats.graded} graded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                Present Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {attendanceStats.absent} absent, {attendanceStats.late} late
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Overall Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                averageGrade >= 90 ? 'text-green-600' :
                averageGrade >= 80 ? 'text-blue-600' :
                averageGrade >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {averageGrade}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on {gradedItems.length} items</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="assignments">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4 mt-4">
            {mockAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        assignment.status === 'graded' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {assignment.status}
                      </Badge>
                      {assignment.grade && (
                        <div className="mt-2 text-lg font-bold text-primary">{assignment.grade}/100</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate('/assignments')}>
              View All Assignments <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4 mt-4">
            {mockQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>{quiz.totalQuestions} questions</span>
                        <span>•</span>
                        <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        quiz.status === 'graded' ? 'bg-green-100 text-green-800' :
                        quiz.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {quiz.status}
                      </Badge>
                      {quiz.grade && (
                        <div className="mt-2 text-lg font-bold text-primary">{quiz.grade}%</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="attendance" className="mt-4">
            <Card>
              <CardContent className="p-0 divide-y">
                {mockAttendanceRecords.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        record.status === 'present' ? 'bg-green-500' :
                        record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span>{new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <Badge className={
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/attendance')}>
              View Full History <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyChild;
