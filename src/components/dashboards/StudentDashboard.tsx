
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockStudent, mockAssignments, mockQuestions, mockQuizzes, mockAttendanceRecords } from "@/data/mockData";
import { FileText, MessageSquare, CalendarCheck, BookOpen } from "lucide-react";

const StudentDashboard = () => {
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
  
  const questionStats = {
    total: mockQuestions.length,
    inProgress: mockQuestions.filter(q => q.status === 'in-progress').length,
    answered: mockQuestions.filter(q => q.status === 'answered').length,
  };
  
  // Attendance calculation
  const attendanceStats = {
    total: mockAttendanceRecords.length,
    present: mockAttendanceRecords.filter(a => a.status === 'present').length,
  };
  
  const attendancePercentage = Math.round((attendanceStats.present / attendanceStats.total) * 100);
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="bg-edu-purple-50 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-800">Welcome, {user?.name}</h2>
          <p className="text-gray-600">Track your progress, submit assignments, and get help from assistants.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button onClick={() => navigate('/questions')} className="bg-edu-purple-600 hover:bg-edu-purple-700">
            <MessageSquare size={18} className="mr-2" /> Ask a Question
          </Button>
        </div>
      </section>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="text-xs text-right font-medium">
                {Math.round((assignmentStats.completed / assignmentStats.total) * 100)}% complete
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
              onClick={() => navigate('/assignments')}
            >
              View all assignments
            </Button>
          </CardContent>
        </Card>
        
        {/* Questions card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare size={18} className="mr-2 text-edu-purple-600" />
              Questions
            </CardTitle>
            <CardDescription>
              {questionStats.answered} of {questionStats.total} answered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={(questionStats.answered / questionStats.total) * 100} />
              <div className="flex justify-between text-xs font-medium">
                <div>{questionStats.inProgress} in progress</div>
                <div>{questionStats.answered} answered</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
              onClick={() => navigate('/questions')}
            >
              View all questions
            </Button>
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
              onClick={() => navigate('/attendance')}
            >
              View attendance details
            </Button>
          </CardContent>
        </Card>
        
        {/* Materials card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen size={18} className="mr-2 text-edu-purple-600" />
              Learning Materials
            </CardTitle>
            <CardDescription>
              Access study resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm">Recently added:</div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Math Textbook PDF</li>
                <li>• Physics Lecture Recording</li>
                <li>• Chemistry Lab Demo</li>
              </ul>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
              onClick={() => navigate('/materials')}
            >
              View all materials
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent assignments */}
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
                <div className="bg-gray-50 md:w-32 p-4 flex flex-row md:flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mb-0 md:mb-2"
                  >
                    View
                  </Button>
                  {assignment.status === 'pending' && (
                    <Button 
                      className="w-full bg-edu-purple-600 hover:bg-edu-purple-700 ml-2 md:ml-0"
                      size="sm"
                    >
                      Submit
                    </Button>
                  )}
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
    </div>
  );
};

export default StudentDashboard;
