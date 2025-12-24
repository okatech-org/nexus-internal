import { motion } from 'framer-motion';
import { User, Building2, Shield, Mail, Phone as PhoneIcon, MoreHorizontal, MessageCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Realm, NetworkType } from '@/types/comms';
import { ContactActionsIndicator, PolicyIndicator } from './PolicyIndicator';
import { CommunicationChannel } from '@/lib/policyEngine';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  realm: Realm;
  organization?: string;
  avatar?: string;
  online?: boolean;
}

// Mock contacts data
const mockContacts: Contact[] = [
  { 
    id: 'c1', 
    name: 'Jean Dupont', 
    email: 'jean.dupont@gov.ga', 
    phone: '+241 01 23 45 67',
    realm: 'government', 
    organization: 'Ministère de l\'Intérieur',
    online: true 
  },
  { 
    id: 'c2', 
    name: 'Marie Koumba', 
    email: 'marie.k@idn.ga', 
    realm: 'citizen',
    online: false 
  },
  { 
    id: 'c3', 
    name: 'Tech Solutions SARL', 
    email: 'contact@techsolutions.ga', 
    phone: '+241 07 89 01 23',
    realm: 'business', 
    organization: 'Tech Solutions',
    online: true 
  },
  { 
    id: 'c4', 
    name: 'Paul Obame', 
    email: 'p.obame@parlement.ga', 
    realm: 'government', 
    organization: 'Parlement National',
    online: false 
  },
  { 
    id: 'c5', 
    name: 'Claire Ndong', 
    email: 'claire@startup.ga', 
    realm: 'business', 
    organization: 'Startup Connect',
    online: true 
  },
];

const realmConfig = {
  citizen: { icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Citoyen' },
  government: { icon: Shield, color: 'text-primary', bg: 'bg-primary/10', label: 'Gouvernement' },
  business: { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Entreprise' },
};

interface ContactListProps {
  searchQuery?: string;
  currentRealm?: Realm;
  networkType?: NetworkType;
  userScopes?: string[];
}

export function ContactList({ 
  searchQuery = '',
  currentRealm = 'government',
  networkType = 'government',
  userScopes = ['icom:*', 'iboite:*']
}: ContactListProps) {
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (contact: Contact, channel: CommunicationChannel) => {
    const actionLabels: Record<string, string> = {
      'icom.chat': 'Démarrer une conversation',
      'icom.call': 'Lancer un appel',
      'icom.meeting': 'Créer une réunion',
    };
    
    toast.success(actionLabels[channel] || channel, {
      description: `Avec ${contact.name} (${realmConfig[contact.realm].label})`,
    });
  };

  // Group contacts by realm for better visibility
  const groupedContacts = {
    government: filteredContacts.filter(c => c.realm === 'government'),
    business: filteredContacts.filter(c => c.realm === 'business'),
    citizen: filteredContacts.filter(c => c.realm === 'citizen'),
  };

  const orderedRealms: Realm[] = ['government', 'business', 'citizen'];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 space-y-4">
        {/* Current realm indicator */}
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Votre realm:</span>
            <span className={cn("font-medium", realmConfig[currentRealm].color)}>
              {realmConfig[currentRealm].label}
            </span>
            <span className="text-muted-foreground ml-auto">
              Réseau: {networkType}
            </span>
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Aucun contact trouvé' : 'Aucun contact disponible'}
            </p>
          </div>
        ) : (
          orderedRealms.map(realm => {
            const contacts = groupedContacts[realm];
            if (contacts.length === 0) return null;

            const RealmHeaderIcon = realmConfig[realm].icon;
            const isSameRealm = realm === currentRealm;

            return (
              <div key={realm} className="space-y-2">
                {/* Realm Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <RealmHeaderIcon className={cn("w-4 h-4", realmConfig[realm].color)} />
                    <span className={cn("text-xs font-medium", realmConfig[realm].color)}>
                      {realmConfig[realm].label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({contacts.length})
                    </span>
                  </div>
                  {!isSameRealm && (
                    <PolicyIndicator
                      senderRealm={currentRealm}
                      receiverRealm={realm}
                      networkType={networkType}
                      userScopes={userScopes}
                      compact={true}
                    />
                  )}
                </div>

                {/* Contacts in this realm */}
                {contacts.map((contact, index) => {
                  const RealmIcon = realmConfig[contact.realm].icon;
                  
                  return (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "group p-3 rounded-xl bg-card hover:bg-secondary/50 border transition-all duration-200 cursor-pointer",
                        isSameRealm 
                          ? "border-primary/20 hover:border-primary/30"
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            realmConfig[contact.realm].bg
                          )}>
                            <RealmIcon className={cn("w-5 h-5", realmConfig[contact.realm].color)} />
                          </div>
                          {contact.online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {contact.name}
                            </h4>
                            {!isSameRealm && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                                cross-realm
                              </span>
                            )}
                          </div>
                          {contact.organization && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {contact.organization}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            {contact.email && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{contact.email}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions with policy enforcement */}
                        <div className="flex items-center gap-1">
                          <ContactActionsIndicator
                            contactRealm={contact.realm}
                            currentRealm={currentRealm}
                            networkType={networkType}
                            userScopes={userScopes}
                            onAction={(channel) => handleAction(contact, channel)}
                          />
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
