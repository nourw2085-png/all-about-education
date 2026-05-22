import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Send, Paperclip, ArrowLeft, Plus, Check, CheckCheck, MessageSquare, Image as ImageIcon, FileText } from 'lucide-react';

interface ProfileLite {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  student_id: string;
  assistant_id: string;
  last_message_at: string;
  partner?: ProfileLite;
  last_message?: { content: string | null; attachment_type: string | null; created_at: string } | null;
  unread?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
}

const Chat = () => {
  const { user, role } = useAuth();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [partners, setPartners] = useState<ProfileLite[]>([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const column = role === 'student' ? 'student_id' : 'assistant_id';
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq(column, user.id)
      .order('last_message_at', { ascending: false });
    if (error) { console.error(error); return; }
    const list = (data ?? []) as Conversation[];
    // Fetch partners + last messages
    const partnerIds = list.map(c => role === 'student' ? c.assistant_id : c.student_id);
    if (partnerIds.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id,name,avatar_url')
        .in('user_id', partnerIds);
      const map = new Map((profs ?? []).map(p => [p.user_id, p as ProfileLite]));
      list.forEach(c => {
        c.partner = map.get(role === 'student' ? c.assistant_id : c.student_id);
      });
      // Last message per conversation
      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('conversation_id, content, attachment_type, created_at, sender_id, status')
        .in('conversation_id', list.map(c => c.id))
        .order('created_at', { ascending: false });
      const seen = new Set<string>();
      (lastMsgs ?? []).forEach(m => {
        if (seen.has(m.conversation_id)) return;
        seen.add(m.conversation_id);
        const c = list.find(x => x.id === m.conversation_id);
        if (c) c.last_message = m;
      });
      // Unread counts
      list.forEach(c => {
        c.unread = (lastMsgs ?? []).filter(m =>
          m.conversation_id === c.id && m.sender_id !== user.id && m.status !== 'read'
        ).length;
      });
    }
    setConvs(list);
  }, [user, role]);

  const loadMessages = useCallback(async (conv: Conversation) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });
    if (error) { console.error(error); return; }
    setMessages((data ?? []) as Message[]);
    // Mark inbound as read
    await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('conversation_id', conv.id)
      .neq('sender_id', user!.id)
      .neq('status', 'read');
  }, [user]);

  // Load potential partners for "New chat"
  const loadPartners = useCallback(async () => {
    if (!user || !role) return;
    const wantRole = role === 'student' ? 'assistant' : 'student';
    const { data: roleRows } = await supabase.from('user_roles').select('user_id').eq('role', wantRole);
    const ids = (roleRows ?? []).map(r => r.user_id);
    if (!ids.length) { setPartners([]); return; }
    const { data: profs } = await supabase
      .from('profiles')
      .select('user_id,name,avatar_url')
      .in('user_id', ids);
    setPartners((profs ?? []) as ProfileLite[]);
  }, [user, role]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Realtime: listen for new messages globally for this user
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('messages-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const m = (payload.new ?? payload.old) as Message | undefined;
        if (!m) return;
        if (active && m.conversation_id === active.id) {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
            if ((payload.new as Message).sender_id !== user.id) {
              supabase.from('messages').update({ status: 'read' }).eq('id', (payload.new as Message).id);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(x => x.id === (payload.new as Message).id ? payload.new as Message : x));
          }
        }
        loadConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, active, loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConv = (c: Conversation) => {
    setActive(c);
    loadMessages(c);
  };

  const startConversation = async (partner: ProfileLite) => {
    if (!user || !role) return;
    const student_id = role === 'student' ? user.id : partner.user_id;
    const assistant_id = role === 'student' ? partner.user_id : user.id;
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('student_id', student_id)
      .eq('assistant_id', assistant_id)
      .maybeSingle();
    let conv = existing as Conversation | null;
    if (!conv) {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ student_id, assistant_id })
        .select('*')
        .single();
      if (error) { toast({ title: 'Could not start chat', description: error.message, variant: 'destructive' }); return; }
      conv = data as Conversation;
    }
    setNewChatOpen(false);
    await loadConversations();
    openConv({ ...conv!, partner });
  };

  const send = async () => {
    if (!active || !user || (!text.trim())) return;
    const body = text.trim();
    setText('');
    const { error } = await supabase.from('messages').insert({
      conversation_id: active.id,
      sender_id: user.id,
      content: body,
    });
    if (error) toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
  };

  const sendFile = async (file: File) => {
    if (!active || !user) return;
    const path = `${user.id}/${active.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('chat-attachments').upload(path, file);
    if (upErr) { toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' }); return; }
    const { data: signed } = await supabase.storage.from('chat-attachments').createSignedUrl(path, 60 * 60 * 24 * 7);
    const { error } = await supabase.from('messages').insert({
      conversation_id: active.id,
      sender_id: user.id,
      content: file.name,
      attachment_url: signed?.signedUrl ?? path,
      attachment_type: file.type,
    });
    if (error) toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
  };

  const tick = (m: Message) => {
    if (m.sender_id !== user?.id) return null;
    if (m.status === 'read') return <CheckCheck size={14} className="text-blue-400" />;
    if (m.status === 'delivered') return <CheckCheck size={14} className="opacity-70" />;
    return <Check size={14} className="opacity-70" />;
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <DashboardLayout title="Chat" activeNav="/chat">
      <div className="h-[calc(100vh-9rem)] flex gap-4">
        <Card className={`${active ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0`}>
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">Conversations</h3>
            <Dialog open={newChatOpen} onOpenChange={(o) => { setNewChatOpen(o); if (o) loadPartners(); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus size={16} className="mr-1" /> New</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Start a new chat</DialogTitle></DialogHeader>
                <ScrollArea className="max-h-80">
                  <div className="space-y-1">
                    {partners.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No one to chat with yet.</p>}
                    {partners.map(p => (
                      <button key={p.user_id}
                        onClick={() => startConversation(p)}
                        className="w-full flex items-center gap-3 p-2 rounded hover:bg-muted">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={p.avatar_url ?? undefined} />
                          <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-1">
            {convs.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No conversations yet. Tap <strong>New</strong> to start one.
              </div>
            )}
            {convs.map(c => (
              <button key={c.id}
                onClick={() => openConv(c)}
                className={`w-full text-left p-3 border-b hover:bg-muted/50 flex items-center gap-3 ${active?.id === c.id ? 'bg-muted/70' : ''}`}>
                <Avatar className="h-11 w-11">
                  <AvatarImage src={c.partner?.avatar_url ?? undefined} />
                  <AvatarFallback>{c.partner?.name?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium truncate">{c.partner?.name ?? 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{fmtTime(c.last_message_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground truncate">
                      {c.last_message?.attachment_type ? '📎 Attachment' : (c.last_message?.content ?? 'Say hello!')}
                    </span>
                    {c.unread ? <Badge className="ml-2">{c.unread}</Badge> : null}
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </Card>

        <Card className={`flex-1 flex-col ${active ? 'flex' : 'hidden md:flex'}`}>
          {active ? (
            <>
              <div className="p-3 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActive(null)}>
                  <ArrowLeft size={18} />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={active.partner?.avatar_url ?? undefined} />
                  <AvatarFallback>{active.partner?.name?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <div className="font-semibold">{active.partner?.name ?? 'Conversation'}</div>
              </div>
              <ScrollArea className="flex-1 p-4 bg-muted/30">
                <div className="space-y-2">
                  {messages.map(m => {
                    const mine = m.sender_id === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
                          mine ? 'bg-edu-purple-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 rounded-bl-sm'
                        }`}>
                          {m.attachment_url && (
                            <a href={m.attachment_url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 text-sm underline mb-1">
                              {m.attachment_type?.startsWith('image/')
                                ? <ImageIcon size={14} />
                                : <FileText size={14} />}
                              {m.content || 'Attachment'}
                            </a>
                          )}
                          {!m.attachment_url && m.content && <div className="text-sm whitespace-pre-wrap">{m.content}</div>}
                          <div className={`flex items-center gap-1 mt-1 text-[10px] ${mine ? 'text-white/70 justify-end' : 'text-muted-foreground'}`}>
                            <span>{fmtTime(m.created_at)}</span>
                            {tick(m)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
              <div className="p-3 border-t flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) sendFile(f); e.target.value = ''; }}
                />
                <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()}>
                  <Paperclip size={18} />
                </Button>
                <Input
                  placeholder="Type a message"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <Button size="icon" onClick={send}><Send size={18} /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
              <MessageSquare size={48} className="opacity-40" />
              <p>Select a conversation</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
