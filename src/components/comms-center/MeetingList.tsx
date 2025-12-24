import { motion } from 'framer-motion';
import { Video, Calendar, Clock, Users, MoreHorizontal, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Meeting {
  id: string;
  title: string;
  participants: string[];
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended';
}

// Mock meetings data
const mockMeetings: Meeting[] = [
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
];

const statusConfig = {
  scheduled: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Planifiée' },
  live: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'En cours' },
  ended: { color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Terminée' },
};

interface MeetingListProps {
  searchQuery?: string;
}

export function MeetingList({ searchQuery = '' }: MeetingListProps) {
  const filteredMeetings = mockMeetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort: live first, then scheduled, then ended
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const order = { live: 0, scheduled: 1, ended: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 space-y-2">
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
  );
}
