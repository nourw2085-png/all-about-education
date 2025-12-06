import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockStudent, mockAssignments, mockAttendanceRecords, mockQuestions } from '@/data/mockData';
import { User, FileText, CalendarCheck, MessageSquare, Search, ChevronRight } from 'lucide-react';

const Students = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock multiple students for display
  const students = [
    {
      ...mockStudent,
      assignmentStats: {
        completed: mockAssignments.filter(a => a.status !== 'pending').length,
        total: mockAssignments.length
      },
      attendanceRate: Math.round(
        (mockAttendanceRecords.filter(a => a.status === 'present').length / mockAttendanceRecords.length) * 100
      ),
      pendingQuestions: mockQuestions.filter(q => q.status === 'pending').length
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      grade: '10th Grade',
      assignmentStats: { completed: 2, total: 3 },
      attendanceRate: 95,
      pendingQuestions: 1
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      grade: '10th Grade',
      assignmentStats: { completed: 3, total: 3 },
      attendanceRate: 100,
      pendingQuestions: 0
    }
  ];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Students" activeNav="/students">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline">{filteredStudents.length} students</Badge>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{student.grade}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignments */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Assignments</span>
                    </div>
                    <span className="font-medium">
                      {student.assignmentStats.completed}/{student.assignmentStats.total}
                    </span>
                  </div>
                  <Progress 
                    value={(student.assignmentStats.completed / student.assignmentStats.total) * 100} 
                  />
                </div>

                {/* Attendance */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary" />
                    <span>Attendance</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={student.attendanceRate >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {student.attendanceRate}%
                  </Badge>
                </div>

                {/* Questions */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>Pending Questions</span>
                  </div>
                  <Badge variant={student.pendingQuestions > 0 ? 'default' : 'outline'}>
                    {student.pendingQuestions}
                  </Badge>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  View Details <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Students;
