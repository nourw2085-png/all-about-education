import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { mockQuestions, mockMessages } from '@/data/mockData';
import { Question, Message } from '@/types';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { MessageSquare, Send, Plus, ArrowLeft } from 'lucide-react';

const Questions = () => {
  const { user, role } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusColor = (status: Question['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'answered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedQuestion || !user) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id || '1',
      senderName: user.name,
      senderRole: role!,
      content: newMessage,
      contentType: 'text',
      timestamp: new Date().toISOString(),
      read: false,
      questionId: selectedQuestion.id,
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleCreateQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionContent.trim() || !user) return;
    
    const question: Question = {
      id: Date.now().toString(),
      studentId: user.id || '1',
      studentName: user.name,
      title: newQuestionTitle,
      content: newQuestionContent,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    setQuestions(prev => [question, ...prev]);
    setNewQuestionTitle('');
    setNewQuestionContent('');
    setIsDialogOpen(false);
  };

  const questionMessages = selectedQuestion 
    ? messages.filter(m => m.questionId === selectedQuestion.id)
    : [];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout title="Questions & Chat" activeNav="/questions">
      <div className="h-[calc(100vh-12rem)] flex gap-4">
        {/* Questions List */}
        <Card className={`${selectedQuestion ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0`}>
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">My Questions</CardTitle>
            {role === 'student' && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus size={16} className="mr-1" /> New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ask a Question</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Question title..."
                      value={newQuestionTitle}
                      onChange={(e) => setNewQuestionTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Describe your question in detail..."
                      value={newQuestionContent}
                      onChange={(e) => setNewQuestionContent(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleCreateQuestion} className="w-full">
                      Submit Question
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 pb-4 space-y-2">
              {questions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedQuestion(question)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedQuestion?.id === question.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-sm line-clamp-1">{question.title}</span>
                    <Badge variant="secondary" className={`shrink-0 text-xs ${getStatusColor(question.status)}`}>
                      {question.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{question.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className={`flex-1 flex flex-col ${!selectedQuestion ? 'hidden md:flex' : 'flex'}`}>
          {selectedQuestion ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden h-8 w-8"
                    onClick={() => setSelectedQuestion(null)}
                  >
                    <ArrowLeft size={18} />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{selectedQuestion.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedQuestion.assistantName 
                        ? `Helping: ${selectedQuestion.assistantName}` 
                        : 'Waiting for assistant...'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(selectedQuestion.status)}>
                    {selectedQuestion.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Initial question */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">{selectedQuestion.studentName}</p>
                    <p className="text-sm">{selectedQuestion.content}</p>
                  </div>
                  
                  {/* Messages */}
                  {questionMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === (user?.id || '1') ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === (user?.id || '1')
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {message.senderName}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a question to view the conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Questions;