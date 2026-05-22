# Platform Overhaul Plan

Big request — splitting into 5 workstreams. I'll implement them in order, behind one approval.

## 1. Backend: schema for chat, scoring, monitoring

New migration adding:

- `conversations` (id, student_id, assistant_id, last_message_at)
- `messages` (id, conversation_id, sender_id, content, attachment_url, attachment_type, status: sent/delivered/read, created_at)
- `parent_links` (parent_id, student_id) — explicit parent→child link via `student_code`
- `point_events` (id, assistant_id, kind: question_answered|assignment_graded|quiz_graded|quality_bonus, points, ref_id, created_at)
- `assignments_submissions.grade` + `graded_by` (assistant) — extend existing assignment data so grading awards points
- Storage bucket `chat-attachments` (private) with RLS by conversation membership
- Realtime enabled on `messages` + `conversations`

**RLS principles**
- `profiles`: tighten — only self, linked parent, teachers, or assistants in same conversation can view (no more `true` for everyone)
- `messages` / `conversations`: only the two participants + teachers (read-only)
- `point_events`: assistant sees own; teachers see all; insert via SECURITY DEFINER function on grading/answering
- `parent_links`: parent sees own; teacher sees all
- Helper functions: `is_teacher()`, `is_parent_of(student_id)`, `is_conversation_member(conv_id)`

## 2. Parent portal — view-only

- `ParentDashboard` rewritten: child selector (from `parent_links`), then **read-only** cards: Grades, Attendance, Assignments, Quiz scores, Activity timeline
- Remove any write/chat/edit UI from parent routes
- Route guard: parents blocked from `/questions` (chat), `/assignments` create, `/materials` upload, `/students`, `/assistants`
- Register flow: parent enters child's `student_code(s)` → creates `parent_links` rows (validated server-side)

## 3. WhatsApp-style student chat

Replace `Questions.tsx` chat with `Chat.tsx`:
- Left: conversation list (avatar, name, last message preview, unread badge, time)
- Right: thread view with bubbles, timestamps, ticks (✓ sent, ✓✓ delivered, ✓✓ blue read)
- Input: text + paperclip (file/image upload to `chat-attachments`) + send
- Realtime via supabase channel on `messages` filtered by `conversation_id`
- Mark-as-read on view → updates `status`
- Students start a chat by picking an assistant; assistants see all their conversations

## 4. Assistant scoring system

- DB function `award_points(assistant_id, kind, ref_id, points)` (SECURITY DEFINER) — single source of truth, called from:
  - Sending an answer message in a student conversation (+5, once per question/day-debounced)
  - Marking an assignment submission graded (+10)
  - Marking a quiz attempt graded (+8)
  - Teacher "quality bonus" button (+1..+20)
- `AssistantDashboard`: shows breakdown by kind, recent point events, weekly total, rank
- Leaderboard page reads from aggregate view `assistant_scores`

## 5. Teacher dashboard & monitoring

`TeacherDashboard` rebuilt with widgets:
- **Pending questions** (conversations with student message but no assistant reply > 1h)
- **Student engagement**: active students this week, quiz participation %, attendance %
- **Assistant performance**: points this week per assistant, response time avg, answers count
- **Assignments/quizzes progress**: % submitted, % graded, overdue list
- **Unresolved/delayed**: ungraded > 48h, unanswered > 24h
- Teacher gets read access to all chat threads (audit) + ability to award quality bonus

## 6. General fixes

- Centralize route guards in `<RoleRoute allow={['teacher','assistant']}>` wrapper used in `App.tsx`
- Hide nav items per role in `DashboardLayout`
- Fix `profiles` RLS over-exposure (remove `true` SELECT policy)
- Replace remaining mock data in Questions/Students/Assistants with live queries
- Add empty/loading/error states consistently

## Technical notes

- Edge function `award-points` not needed — DB function + RLS-safe RPC suffices
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE messages, conversations`
- Migration order: enums → tables → functions → triggers → RLS → publication → bucket → policies
- Frontend route changes in `App.tsx`; new pages: `src/pages/Chat.tsx`, updated dashboards

## Out of scope (flag for later)

- Admin role (not yet in `app_role` enum) — say so and skip unless you want it added now
- Video/voice calls in chat (text + file only for v1)
- Push notifications

Scope is large (~1 migration + ~10 file changes). Approve and I'll ship it in one pass.