
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockQuestions, mockAssignments, mockStudent, mockAssistant } from "@/data/mockData";
import { 
  Users, 
  User, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  CalendarCheck,
  ChevronRight
} from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Count of pending assignments to review
  const pendingAssignments = mockAssignments.filter(a => a.status === 'submitted').length;
  
  // Count of questions in progress or pending
  const activeQuestions = mockQuestions.filter(q => q.status === 'pending' || q.status === 'in-progress').length;
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="bg-edu-purple-50 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-800">Welcome, {user?.name}</h2>
          <p className="text-gray-600">Supervise assistants, manage assignments, and monitor student progress.</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-3 flex">
          <Button onClick={() => navigate('/assignments/create')} className="bg-edu-purple-600 hover:bg-edu-purple-700">
            <FileText size={18} className="mr-2" /> New Assignment
          </Button>
          <Button onClick={() => navigate('/materials/upload')} variant="outline" className="border-edu-purple-300">
            <BookOpen size={18} className="mr-2" /> Upload Material
          </Button>
        </div>
      </section>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Students card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users size={18} className="mr-2 text-edu-purple-600" />
              Students
            </CardTitle>
            <CardDescription>
              1 Total Students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/students')}
              >
                <span className="flex-grow text-left">View Students</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Assistants card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User size={18} className="mr-2 text-edu-purple-600" />
              Assistants
            </CardTitle>
            <CardDescription>
              1 Total Assistants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/assistants')}
              >
                <span className="flex-grow text-left">Manage Assistants</span>
                <ChevronRight size={16} />
              </Button>
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
              {pendingAssignments} pending review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/assignments')}
              >
                <span className="flex-grow text-left">Review Assignments</span>
                <ChevronRight size={16} />
              </Button>
            </div>
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
              {activeQuestions} active questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/questions')}
              >
                <span className="flex-grow text-left">View Questions</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student activities */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Student Activities</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start pb-4 border-b border-gray-100">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <FileText size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mockStudent.name} submitted an assignment</p>
                    <p className="text-xs text-gray-500">History Essay</p>
                    <p className="text-xs text-gray-400 mt-1">Today at 10:30 AM</p>
                  </div>
                </li>
                <li className="flex items-start pb-4 border-b border-gray-100">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <MessageSquare size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mockStudent.name} asked a question</p>
                    <p className="text-xs text-gray-500">Help with calculus problem</p>
                    <p className="text-xs text-gray-400 mt-1">Today at 2:22 PM</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <CalendarCheck size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mockStudent.name} attended class</p>
                    <p className="text-xs text-gray-400 mt-1">Today at 9:00 AM</p>
                  </div>
                </li>
              </ul>
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                  onClick={() => navigate('/students')}
                >
                  View all student activities
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Assistant activities */}
        <section>
          <h2 className="text-xl font-bold mb-4">Recent Assistant Activities</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                <li className="flex items-start pb-4 border-b border-gray-100">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <MessageSquare size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mockAssistant.name} answered a question</p>
                    <p className="text-xs text-gray-500">Grammar check for essay</p>
                    <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                  </div>
                </li>
                <li className="flex items-start pb-4 border-b border-gray-100">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <MessageSquare size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mockAssistant.name} is helping with a question</p>
                    <p className="text-xs text-gray-500">Physics question about momentum</p>
                    <p className="text-xs text-gray-400 mt-1">Yesterday at 10:15 AM</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <FileText size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{mockAssistant.name} graded an assignment</p>
                    <p className="text-xs text-gray-500">Science Lab Report</p>
                    <p className="text-xs text-gray-400 mt-1">4 days ago</p>
                  </div>
                </li>
              </ul>
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                  onClick={() => navigate('/assistants')}
                >
                  View all assistant activities
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      
      {/* Materials section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Learning Materials</h2>
          <Button 
            onClick={() => navigate('/materials/upload')} 
            className="bg-edu-purple-600 hover:bg-edu-purple-700"
          >
            Upload New
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <li className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <BookOpen size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Math Textbook PDF</p>
                    <p className="text-xs text-gray-400">Uploaded on Apr 15, 2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <BookOpen size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Physics Lecture Recording</p>
                    <p className="text-xs text-gray-400">Uploaded on May 1, 2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-edu-purple-100 rounded-full p-2 mr-3">
                    <BookOpen size={16} className="text-edu-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Chemistry Lab Demonstration</p>
                    <p className="text-xs text-gray-400">Uploaded on May 4, 2025</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </li>
            </ul>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                className="text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/materials')}
              >
                View all materials
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default TeacherDashboard;
