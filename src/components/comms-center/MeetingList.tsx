import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Calendar, Clock, Users, MoreHorizontal, Play, Plus, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isFuture, addHours, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  participants: string[];
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended';
}

// Mock contacts for meeting creation
const mockContacts = [
  { id: 'c1', name: 'Jean Dupont' },
  { id: 'c2', name: 'Marie Koumba' },
  { id: 'c3', name: 'Tech Solutions SARL' },
  { id: 'c4', name: 'Paul Obame' },
  { id: 'c5', name: 'Claire Ndong' },
];

const statusConfig = {
  scheduled: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Planifiée' },
  live: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'En cours' },
  ended: { color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Terminée' },
};

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2 heures' },
];

const scheduleOptions = [
  { value: 'now', label: 'Maintenant' },
  { value: '1h', label: 'Dans 1 heure' },
  { value: '3h', label: 'Dans 3 heures' },
  { value: 'tomorrow', label: 'Demain' },
];

interface MeetingListProps {
  searchQuery?: string;
}

export function MeetingList({ searchQuery = '' }: MeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([
    { 
      id: 'meet1', 
      title: 'Réunion hebdomadaire', 
      participants: ['Jean Dupont', 'Marie Koumba', 'Paul Obame'],
      scheduled_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      duration_minutes: 60,
      status: 'scheduled'
    },
    { 
      id: 'meet2', 
      title: 'Point projet iCom', 
      participants: ['Tech Solutions SARL', 'Claire Ndong'],
      scheduled_at: new Date().toISOString(),
      duration_minutes: 30,
      status: 'live'
    },
    { 
      id: 'meet3', 
      title: 'Revue technique Q4', 
      participants: ['Jean Dupont', 'Paul Obame', 'Claire Ndong', 'Marie Koumba'],
      scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      duration_minutes: 90,
      status: 'scheduled'
    },
    { 
      id: 'meet4', 
      title: 'Formation utilisateurs', 
      participants: ['Marie Koumba'],
      scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      duration_minutes: 45,
      status: 'ended'
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    participants: [] as string[],
    schedule: 'now',
    duration: '30',
  });
  const [isCreating, setIsCreating] = useState(false);

  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort: live first, then scheduled, then ended
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const order = { live: 0, scheduled: 1, ended: 2 };
    return order[a.status] - order[b.status];
  });

  const toggleParticipant = (contactId: string) => {
    setNewMeeting(prev => ({
      ...prev,
      participants: prev.participants.includes(contactId)
        ? prev.participants.filter(p => p !== contactId)
        : [...prev.participants, contactId],
    }));
  };

  const getScheduledDate = (schedule: string): Date => {
    switch (schedule) {
      case '1h': return addHours(new Date(), 1);
      case '3h': return addHours(new Date(), 3);
      case 'tomorrow': return addDays(new Date(), 1);
      default: return new Date();
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeeting.title.trim()) {
      toast.error('Veuillez saisir un titre');
      return;
    }
    if (newMeeting.participants.length === 0) {
      toast.error('Veuillez sélectionner au moins un participant');
      return;
    }

    setIsCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const participantNames = newMeeting.participants
      .map(id => mockContacts.find(c => c.id === id)?.name)
      .filter(Boolean) as string[];

    const scheduledAt = getScheduledDate(newMeeting.schedule);
    const isNow = newMeeting.schedule === 'now';

    const meeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: newMeeting.title,
      participants: participantNames,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parseInt(newMeeting.duration),
      status: isNow ? 'live' : 'scheduled',
    };

    setMeetings(prev => [meeting, ...prev]);
    setIsCreating(false);
    setIsCreateOpen(false);
    setNewMeeting({ title: '', participants: [], schedule: 'now', duration: '30' });

    toast.success(
      isNow ? 'Réunion démarrée' : 'Réunion planifiée',
      { description: meeting.title }
    );
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    toast.success('Connexion à la réunion...', {
      description: meeting.title,
    });
  };

  const handleStartMeeting = (meeting: Meeting) => {
    setMeetings(prev => prev.map(m => 
      m.id === meeting.id ? { ...m, status: 'live' as const } : m
    ));
    toast.success('Réunion démarrée', {
      description: meeting.title,
    });
  };

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="p-3 space-y-2">
          {/* Create Meeting Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsCreateOpen(true)}
            className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Nouvelle réunion</span>
          </motion.button>

          {sortedMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Video className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Aucune réunion trouvée' : 'Aucune réunion planifiée'}
              </p>
            </div>
          ) : (
            sortedMeetings.map((meeting, index) => {
              const scheduledDate = new Date(meeting.scheduled_at);
              const isUpcoming = isFuture(scheduledDate);
              
              return (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                    meeting.status === 'live' 
                      ? "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
                      : "bg-card border-border/50 hover:bg-secondary/50 hover:border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      statusConfig[meeting.status].bg
                    )}>
                      <Video className={cn("w-5 h-5", statusConfig[meeting.status].color)} />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {meeting.title}
                        </h4>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          statusConfig[meeting.status].bg,
                          statusConfig[meeting.status].color
                        )}>
                          {statusConfig[meeting.status].label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(scheduledDate, 'dd MMM HH:mm', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {meeting.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {meeting.participants.length}
                        </span>
                      </div>
                      
                      {isUpcoming && meeting.status === 'scheduled' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(scheduledDate, { addSuffix: true, locale: fr })}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {meeting.status === 'live' && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white gap-1"
                          onClick={() => handleJoinMeeting(meeting)}
                        >
                          <Play className="w-3 h-3" />
                          Rejoindre
                        </Button>
                      )}
                      {meeting.status === 'scheduled' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleStartMeeting(meeting)}
                        >
                          <Video className="w-3 h-3" />
                          Démarrer
                        </Button>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Meeting Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" />
              Nouvelle réunion
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Titre</label>
              <Input
                placeholder="Ex: Point hebdomadaire"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Participants</label>
              <div className="flex flex-wrap gap-2">
                {mockContacts.map(contact => {
                  const isSelected = newMeeting.participants.includes(contact.id);
                  return (
                    <button
                      key={contact.id}
                      onClick={() => toggleParticipant(contact.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                        isSelected
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {contact.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {newMeeting.participants.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {newMeeting.participants.length} participant(s) sélectionné(s)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quand</label>
                <Select 
                  value={newMeeting.schedule} 
                  onValueChange={(v) => setNewMeeting(prev => ({ ...prev, schedule: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Durée</label>
                <Select 
                  value={newMeeting.duration} 
                  onValueChange={(v) => setNewMeeting(prev => ({ ...prev, duration: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateMeeting} 
              disabled={isCreating}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Création...
                </>
              ) : newMeeting.schedule === 'now' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Démarrer maintenant
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Planifier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
