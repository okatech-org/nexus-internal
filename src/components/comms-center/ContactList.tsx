import { motion } from 'framer-motion';
import { User, Building2, Shield, Mail, Phone as PhoneIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  realm: 'citizen' | 'government' | 'business';
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
  citizen: { icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  government: { icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
  business: { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

interface ContactListProps {
  searchQuery?: string;
}

export function ContactList({ searchQuery = '' }: ContactListProps) {
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 space-y-2">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Aucun contact trouvé' : 'Aucun contact disponible'}
            </p>
          </div>
        ) : (
          filteredContacts.map((contact, index) => {
            const RealmIcon = realmConfig[contact.realm].icon;
            
            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-3 rounded-xl bg-card hover:bg-secondary/50 border border-border/50 hover:border-border transition-all duration-200 cursor-pointer"
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
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        realmConfig[contact.realm].bg,
                        realmConfig[contact.realm].color
                      )}>
                        {contact.realm}
                      </span>
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
                          <span className="truncate max-w-[120px]">{contact.email}</span>
                        </span>
                      )}
                      {contact.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <PhoneIcon className="w-3 h-3" />
                          <span className="truncate">{contact.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
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
