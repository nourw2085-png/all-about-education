
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockAssistant, mockQuestions } from "@/data/mockData";
import { MessageSquare, FileText, CalendarCheck, Award } from "lucide-react";

const AssistantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter questions that are pending (available to answer)
  const pendingQuestions = mockQuestions.filter(q => q.status === 'pending');
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="bg-edu-purple-50 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-800">Welcome, {user?.name}</h2>
          <p className="text-gray-600">Help students, answer questions, and earn points.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="bg-white py-2 px-4 rounded-lg flex items-center shadow-sm">
            <Award className="text-edu-purple-500 mr-2" size={24} />
            <div>
              <div className="text-sm text-gray-500">Your Points</div>
              <div className="text-2xl font-bold text-edu-purple-700">{mockAssistant.points}</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Questions card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare size={18} className="mr-2 text-edu-purple-600" />
              Questions Answered
            </CardTitle>
            <CardDescription>
              Total: {mockAssistant.questionsAnswered}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Points earned from questions</div>
              <div className="text-2xl font-bold text-edu-purple-700">{mockAssistant.questionsAnswered * 5}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/questions')}
              >
                Answer more questions
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Assignments card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText size={18} className="mr-2 text-edu-purple-600" />
              Assignments Corrected
            </CardTitle>
            <CardDescription>
              Total: {mockAssistant.assignmentsCorrected}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Points earned from assignments</div>
              <div className="text-2xl font-bold text-edu-purple-700">{mockAssistant.assignmentsCorrected * 10}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/assignments')}
              >
                Grade more assignments
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quizzes card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarCheck size={18} className="mr-2 text-edu-purple-600" />
              Quizzes Corrected
            </CardTitle>
            <CardDescription>
              Total: {mockAssistant.quizzesCorrected}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Points earned from quizzes</div>
              <div className="text-2xl font-bold text-edu-purple-700">{mockAssistant.quizzesCorrected * 15}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 w-full text-edu-purple-600 hover:text-edu-purple-700 hover:bg-edu-purple-50"
                onClick={() => navigate('/quizzes')}
              >
                Grade more quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending questions section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Questions Waiting for Help</h2>
          <Button 
            onClick={() => navigate('/questions')} 
            variant="outline"
            className="text-edu-purple-600 border-edu-purple-300 hover:bg-edu-purple-50"
          >
            View All
          </Button>
        </div>
        
        {pendingQuestions.length > 0 ? (
          <div className="space-y-4">
            {pendingQuestions.map((question) => (
              <Card key={question.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-grow p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{question.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        Waiting
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{question.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">From: {question.studentName}</span>
                      <span className="text-xs text-gray-500">
                        Posted: {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 md:w-32 p-4 flex flex-row md:flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200">
                    <Button 
                      className="w-full bg-edu-purple-600 hover:bg-edu-purple-700"
                      size="sm"
                      onClick={() => navigate(`/questions/${question.id}`)}
                    >
                      Answer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500 mb-2">No questions waiting for assistance right now.</p>
            <p className="text-sm text-gray-400">Check back later or visit the Questions page.</p>
          </Card>
        )}
      </section>
      
      {/* Points breakdown */}
      <section>
        <h2 className="text-xl font-bold mb-4">Your Points Breakdown</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MessageSquare className="mr-3 text-edu-purple-500" size={20} />
                  <span>Questions Answered</span>
                </div>
                <div className="font-medium">{mockAssistant.questionsAnswered * 5} points</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <FileText className="mr-3 text-edu-purple-500" size={20} />
                  <span>Assignments Corrected</span>
                </div>
                <div className="font-medium">{mockAssistant.assignmentsCorrected * 10} points</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CalendarCheck className="mr-3 text-edu-purple-500" size={20} />
                  <span>Quizzes Corrected</span>
                </div>
                <div className="font-medium">{mockAssistant.quizzesCorrected * 15} points</div>
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-gray-200">
                <div className="font-bold">Total Points</div>
                <div className="font-bold text-edu-purple-700">{mockAssistant.points} points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AssistantDashboard;
