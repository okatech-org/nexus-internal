import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, MoreHorizontal, Plus, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Call {
  id: string;
  contact_name: string;
  contact_id: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration?: number; // in seconds
  timestamp: string;
}

// Mock contacts for call creation
const mockContacts = [
  { id: 'c1', name: 'Jean Dupont' },
  { id: 'c2', name: 'Marie Koumba' },
  { id: 'c3', name: 'Tech Solutions SARL' },
  { id: 'c4', name: 'Paul Obame' },
  { id: 'c5', name: 'Claire Ndong' },
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
  const [calls, setCalls] = useState<Call[]>([
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
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [isDialing, setIsDialing] = useState(false);

  const filteredCalls = calls.filter(call => 
    call.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartCall = async () => {
    if (!selectedContact) return;
    
    setIsDialing(true);
    
    // Simulate dialing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const contact = mockContacts.find(c => c.id === selectedContact);
    if (!contact) return;

    const newCall: Call = {
      id: `call-${Date.now()}`,
      contact_name: contact.name,
      contact_id: contact.id,
      type: 'outgoing',
      duration: 0,
      timestamp: new Date().toISOString(),
    };

    setCalls(prev => [newCall, ...prev]);
    setIsDialing(false);
    setIsCreateOpen(false);
    setSelectedContact('');
    
    toast.success(`Appel lancé vers ${contact.name}`, {
      description: 'L\'appel est en cours...',
    });
  };

  const handleQuickCall = (contactId: string, contactName: string) => {
    toast.success(`Appel vers ${contactName}`, {
      description: 'Connexion en cours...',
    });
  };

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="p-3 space-y-2">
          {/* Create Call Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setIsCreateOpen(true)}
            className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Nouvel appel</span>
          </motion.button>

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
                        {call.duration !== undefined && call.duration > 0 && (
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
                        onClick={() => handleQuickCall(call.contact_id, call.contact_name)}
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

      {/* Create Call Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-500" />
              Nouvel appel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contact</label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contact" />
                </SelectTrigger>
                <SelectContent>
                  {mockContacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {contact.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleStartCall} 
              disabled={!selectedContact || isDialing}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isDialing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Appel en cours...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
