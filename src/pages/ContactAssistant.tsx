import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare } from 'lucide-react';

const ContactAssistant = () => {
  const { user, role, authReady, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!authReady || loading) return null;
  if (!user || role !== 'parent') {
    navigate('/dashboard');
    return null;
  }

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: 'Missing info', description: 'Please add a subject and a message.', variant: 'destructive' });
      return;
    }
    setSending(true);
    // Placeholder: backend messaging not yet wired up for parent→assistant.
    setTimeout(() => {
      toast({ title: 'Message sent', description: 'Your assistant will reply soon.' });
      setSubject('');
      setMessage('');
      setSending(false);
    }, 500);
  };

  return (
    <DashboardLayout title="Contact Assistant" activeNav="/contact-assistant">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} className="text-edu-purple-600" />
              Reach out for help
            </CardTitle>
            <CardDescription>
              Send a message to your child's assistant about progress, questions or concerns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Question about last week's quiz" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Write your message..." />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContactAssistant;
