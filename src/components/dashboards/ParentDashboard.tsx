
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockStudent, mockAssignments, mockQuizzes, mockAttendanceRecords } from "@/data/mockData";
import { User, FileText, BookOpen, CalendarCheck } from "lucide-react";

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Calculate stats for progress bars
  const assignmentStats = {
    total: mockAssignments.length,
    completed: mockAssignments.filter(a => a.status === 'submitted' || a.status === 'graded').length,
    graded: mockAssignments.filter(a => a.status === 'graded').length,
  };
  
  const quizStats = {
    total: mockQuizzes.length,
    completed: mockQuizzes.filter(q => q.status === 'completed' || q.status === 'graded').length,
    graded: mockQuizzes.filter(q => q.status === 'graded').length,
  };
  
  // Attendance calculation
  const attendanceStats = {
    total: mockAttendanceRecords.length,
    present: mockAttendanceRecords.filter(a => a.status === 'present').length,
  };
  
  const attendancePercentage = Math.round((attendanceStats.present / attendanceStats.total) * 100);
  
  // Calculate average grade
  const gradedAssignments = mockAssignments.filter(a => a.status === 'graded' && a.grade !== undefined);
  const gradedQuizzes = mockQuizzes.filter(q => q.status === 'graded' && q.grade !== undefined);
  
  let totalGradePoints = 0;
  let totalItems = 0;
  
  gradedAssignments.forEach(a => {
    if (a.grade) {
      totalGradePoints += a.grade;
      totalItems++;
    }
  });
  
  gradedQuizzes.forEach(q => {
    if (q.grade) {
      totalGradePoints += q.grade;
      totalItems++;
    }
  });
  
  const averageGrade = totalItems > 0 ? Math.round(totalGradePoints / totalItems) : 0;
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="bg-edu-purple-50 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-800">Welcome, {user?.name}</h2>
          <p className="text-gray-600">Track your child's progress, assignments, and attendance.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center space-x-4">
                <User size={32} className="text-edu-purple-600" />
                <div>
                  <div className="text-sm text-gray-500">Your Child</div>
                  <div className="font-medium">{mockStudent.name}</div>
                  <div className="text-xs text-gray-500">{mockStudent.grade}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall grade card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen size={18} className="mr-2 text-edu-purple-600" />
              Overall Grade
            </CardTitle>
            <CardDescription>
              Average across all graded work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="flex items-center justify-center">
                <div className={`text-4xl font-bold ${
                  averageGrade >= 90 ? 'text-green-600' : 
                  averageGrade >= 80 ? 'text-blue-600' : 
                  averageGrade >= 70 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {averageGrade}%
                </div>
              </div>
              <div className="text-xs text-center text-gray-500 mt-2">
                Based on {totalItems} graded items
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Attendance card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarCheck size={18} className="mr-2 text-edu-purple-600" />
              Attendance
            </CardTitle>
            <CardDescription>
              {attendanceStats.present} of {attendanceStats.total} days present
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={attendancePercentage} />
              <div className="text-xs text-right font-medium">
                {attendancePercentage}% attendance rate
              </div>
            </div>
          </CardContent>
        </Card>

        
        {/* Assignments card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText size={18} className="mr-2 text-edu-purple-600" />
              Assignments
            </CardTitle>
            <CardDescription>
              {assignmentStats.completed} of {assignmentStats.total} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={(assignmentStats.completed / assignmentStats.total) * 100} />
              <div className="flex justify-between text-xs font-medium">
                <div>{assignmentStats.total - assignmentStats.completed} remaining</div>
                <div>{assignmentStats.graded} graded</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact assistant card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User size={18} className="mr-2 text-edu-purple-600" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Reach out to your child's assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 mb-3">
              Ask questions about progress, attendance or assignments.
            </p>
            <Button
              size="sm"
              className="w-full"
              onClick={() => navigate('/contact-assistant')}
            >
              Contact Assistant
            </Button>
          </CardContent>
        </Card>

      </div>
      
      {/* Assignments section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Recent Assignments</h2>
        <div className="space-y-4">
          {mockAssignments.map((assignment) => (
            <Card key={assignment.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-grow p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      assignment.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : assignment.status === 'submitted' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {assignment.status === 'pending' ? 'Due' : assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    {assignment.status === 'graded' && (
                      <span className="text-xs font-medium bg-edu-purple-100 text-edu-purple-800 px-2 py-1 rounded">
                        Grade: {assignment.grade}/100
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 md:w-32 p-4 flex justify-center items-center border-t md:border-t-0 md:border-l border-gray-200">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/assignments/${assignment.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/assignments')}
          >
            View All Assignments
          </Button>
        </div>
      </section>
      
      {/* Attendance history */}
      <section>
        <h2 className="text-xl font-bold mb-4">Recent Attendance</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {mockAttendanceRecords.slice(0, 5).map((record, index) => (
                <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      record.status === 'present' 
                        ? 'bg-green-500' 
                        : record.status === 'absent' 
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                    }`} />
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    record.status === 'present' 
                      ? 'bg-green-100 text-green-800' 
                      : record.status === 'absent' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                className="text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/attendance')}
              >
                View full attendance history
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ParentDashboard;
