import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockAttendanceRecords, mockStudent } from '@/data/mockData';
import { CalendarCheck, Plus, User } from 'lucide-react';
import { toast } from 'sonner';

const Attendance = () => {
  const { role } = useAuth();
  const [attendance, setAttendance] = useState(mockAttendanceRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'present' as 'present' | 'absent' | 'late',
    studentId: mockStudent.id
  });

  const canMarkAttendance = role === 'teacher' || role === 'assistant';

  // Calculate stats
  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const handleAddRecord = () => {
    const record = {
      date: newRecord.date,
      status: newRecord.status,
      notes: newRecord.status === 'absent' ? 'Marked by teacher/assistant' : undefined
    };

    setAttendance([record, ...attendance]);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      studentId: mockStudent.id
    });
    setIsDialogOpen(false);
    toast.success('Attendance marked successfully');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Late</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Attendance" activeNav="/attendance">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{attendanceRate}%</div>
              <Progress value={attendanceRate} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Days Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Days Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Days Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>
        </div>

        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Attendance History</h2>
          {canMarkAttendance && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Mark Attendance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Attendance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{mockStudent.name}</p>
                      <p className="text-sm text-muted-foreground">{mockStudent.grade}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <input
                      type="date"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={newRecord.status}
                      onValueChange={(value: 'present' | 'absent' | 'late') => 
                        setNewRecord({ ...newRecord, status: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddRecord} className="w-full">
                    Save Attendance
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Attendance Records */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {attendance.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No attendance records found
                </div>
              ) : (
                attendance.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        record.status === 'present' ? 'bg-green-500' :
                        record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
