import { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockAssistant } from '@/data/mockData';
import { User, MessageSquare, FileText, Award, Search, ChevronRight } from 'lucide-react';

const Assistants = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock multiple assistants for display
  const assistants = [
    {
      ...mockAssistant,
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      points: 200,
      questionsAnswered: 40,
      assignmentsCorrected: 20,
      quizzesCorrected: 15
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david@example.com',
      points: 100,
      questionsAnswered: 20,
      assignmentsCorrected: 10,
      quizzesCorrected: 5
    }
  ];

  const filteredAssistants = assistants.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by points (leaderboard style)
  const sortedAssistants = [...filteredAssistants].sort((a, b) => b.points - a.points);

  return (
    <DashboardLayout title="Assistants" activeNav="/assistants">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assistants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline">{filteredAssistants.length} assistants</Badge>
        </div>

        {/* Leaderboard Header */}
        <div className="bg-primary/10 rounded-lg p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Assistant Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground">Ranked by total points earned</p>
        </div>

        {/* Assistants List */}
        <div className="space-y-4">
          {sortedAssistants.map((assistant, index) => (
            <Card key={assistant.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Avatar and Info */}
                  <div className="flex items-center gap-3 flex-grow">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{assistant.name}</h3>
                      <p className="text-sm text-muted-foreground">{assistant.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>Questions</span>
                      </div>
                      <p className="font-semibold">{assistant.questionsAnswered}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Assignments</span>
                      </div>
                      <p className="font-semibold">{assistant.assignmentsCorrected}</p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                      {assistant.points} pts
                    </Badge>
                  </div>

                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Stats */}
                <div className="flex md:hidden items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span>{assistant.questionsAnswered} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{assistant.assignmentsCorrected} assignments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assistants;
