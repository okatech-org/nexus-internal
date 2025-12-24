import { motion } from 'framer-motion';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Call {
  id: string;
  contact_name: string;
  contact_id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration?: number; // in seconds
  timestamp: string;
}

// Mock calls data
const mockCalls: Call[] = [
  { 
    id: 'call1', 
    contact_name: 'Jean Dupont', 
    contact_id: 'c1',
    type: 'incoming',
    duration: 342,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  { 
    id: 'call2', 
    contact_name: 'Marie Koumba', 
    contact_id: 'c2',
    type: 'outgoing',
    duration: 180,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  { 
    id: 'call3', 
    contact_name: 'Tech Solutions SARL', 
    contact_id: 'c3',
    type: 'missed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  { 
    id: 'call4', 
    contact_name: 'Paul Obame', 
    contact_id: 'c4',
    type: 'outgoing',
    duration: 45,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
];

const callTypeConfig = {
  incoming: { icon: PhoneIncoming, color: 'text-green-500', label: 'Entrant' },
  outgoing: { icon: PhoneOutgoing, color: 'text-blue-500', label: 'Sortant' },
  missed: { icon: PhoneMissed, color: 'text-destructive', label: 'Manqué' },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface CallListProps {
  searchQuery?: string;
}

export function CallList({ searchQuery = '' }: CallListProps) {
  const filteredCalls = mockCalls.filter(call => 
    call.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 space-y-2">
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Phone className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Aucun appel trouvé' : 'Aucun appel récent'}
            </p>
          </div>
        ) : (
          filteredCalls.map((call, index) => {
            const TypeIcon = callTypeConfig[call.type].icon;
            
            return (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-3 rounded-xl bg-card hover:bg-secondary/50 border border-border/50 hover:border-border transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-secondary"
                  )}>
                    <TypeIcon className={cn("w-5 h-5", callTypeConfig[call.type].color)} />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {call.contact_name}
                      </h4>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-secondary",
                        callTypeConfig[call.type].color
                      )}>
                        {callTypeConfig[call.type].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true, locale: fr })}
                      </span>
                      {call.duration && (
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(call.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
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
