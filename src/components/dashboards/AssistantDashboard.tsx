
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Award, CheckCircle, Users } from "lucide-react";
import BankInfoForm from "../assistant/BankInfoForm";

const AssistantDashboard = () => {
  const { user } = useAuth();
  
  // Mock data
  const stats = {
    answeredQuestions: 45,
    pendingQuestions: 3,
    totalPoints: user?.points || 0,
    correctedAssignments: 28
  };
  
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="bg-edu-purple-50 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-edu-purple-800">Welcome, {user?.name}</h2>
          <p className="text-gray-600">View your stats, answer questions, and correct assignments.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge variant="default" className="bg-edu-purple-600 text-white text-lg px-3 py-1">
            {stats.totalPoints} Points
          </Badge>
        </div>
      </section>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare size={18} className="mr-2 text-edu-purple-600" />
              Questions Answered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.answeredQuestions}</div>
            <Progress value={(stats.answeredQuestions / (stats.answeredQuestions + stats.pendingQuestions)) * 100} className="mt-2" />
            <div className="text-xs text-right mt-1">
              {stats.pendingQuestions} pending questions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle size={18} className="mr-2 text-edu-purple-600" />
              Assignments Corrected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.correctedAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award size={18} className="mr-2 text-edu-purple-600" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPoints}</div>
            <div className="text-xs text-right mt-1">
              5 points per question
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Banking Information */}
      <section>
        <h2 className="text-xl font-bold mb-4">Payment Information</h2>
        <BankInfoForm />
      </section>
      
      {/* New Questions Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Questions</h2>
          <Badge variant="outline" className="text-edu-purple-600 border-edu-purple-600">
            3 pending
          </Badge>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(index => (
            <Card key={index} className="hover:border-edu-purple-300 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Users className="h-10 w-10 text-edu-purple-600 bg-edu-purple-100 p-2 rounded-full" />
                    <div>
                      <h4 className="font-medium">Student {index}</h4>
                      <p className="text-sm text-gray-600">Math Problem #{index}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    New • 5 points
                  </Badge>
                </div>
                <p className="mt-3 text-gray-700">
                  {`I'm having trouble understanding this algebra problem. Can you help me solve it?`}
                </p>
                <div className="flex justify-end mt-3">
                  <Button className="bg-edu-purple-600 hover:bg-edu-purple-700">
                    Answer Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AssistantDashboard;
