import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { mockAssignments } from '@/data/mockData';
import { Plus, FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Assignments = () => {
  const { role } = useAuth();
  const [assignments, setAssignments] = useState(mockAssignments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const canAddAssignments = role === 'teacher' || role === 'assistant';
  const canSubmitAssignments = role === 'student';

  const handleAddAssignment = () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const assignment = {
      id: String(assignments.length + 1),
      title: newAssignment.title,
      description: newAssignment.description,
      dueDate: newAssignment.dueDate,
      status: 'pending' as const
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({ title: '', description: '', dueDate: '' });
    setIsDialogOpen(false);
    toast.success('Assignment created successfully');
  };

  const handleSubmitAssignment = (id: string) => {
    setAssignments(assignments.map(a => 
      a.id === id ? { ...a, status: 'submitted' as const } : a
    ));
    toast.success('Assignment submitted successfully');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Submitted</Badge>;
      case 'graded':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Graded</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Assignments" activeNav="/assignments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            {canAddAssignments ? 'Create and manage assignments' : 'View and submit your assignments'}
          </p>
          {canAddAssignments && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      placeholder="Enter assignment title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      placeholder="Enter assignment description"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddAssignment} className="w-full">
                    Create Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No assignments found
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-grow p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{assignment.title}</h3>
                        </div>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        {assignment.status === 'graded' && assignment.grade && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Grade: {assignment.grade}/100</span>
                          </div>
                        )}
                      </div>
                      {assignment.feedback && (
                        <p className="mt-2 text-sm italic text-muted-foreground">
                          Feedback: {assignment.feedback}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted/50 md:w-40 p-4 flex items-center justify-center border-t md:border-t-0 md:border-l">
                      {canSubmitAssignments && assignment.status === 'pending' ? (
                        <Button 
                          onClick={() => handleSubmitAssignment(assignment.id)}
                          className="w-full"
                        >
                          Submit
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
