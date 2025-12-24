import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Filter,
  Calendar,
  ChevronDown,
  X,
  User,
  Users,
  Building2,
  ArrowUpDown,
  MoreHorizontal,
  Clock,
  CheckCheck,
  Check,
  Pin,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
  id: string;
  title: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage: {
    content: string;
    sender: string;
    timestamp: string;
    read: boolean;
  };
  unreadCount: number;
  pinned: boolean;
  starred: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    title: 'Jean Dupont',
    type: 'direct',
    participants: ['Jean Dupont'],
    lastMessage: { content: "D'accord, je regarde ça", sender: 'Jean Dupont', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), read: false },
    unreadCount: 2,
    pinned: true,
    starred: true,
  },
  {
    id: 'conv2',
    title: 'Équipe Projet Alpha',
    type: 'group',
    participants: ['Marie Martin', 'Paul Obame', 'Claire Ndong'],
    lastMessage: { content: 'Le dossier a été validé par la direction', sender: 'Marie Martin', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: true },
    unreadCount: 0,
    pinned: true,
    starred: false,
  },
  {
    id: 'conv3',
    title: 'Support Technique',
    type: 'direct',
    participants: ['Support Technique'],
    lastMessage: { content: 'Ticket #4521 résolu - Fermeture automatique', sender: 'Support', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
    unreadCount: 1,
    pinned: false,
    starred: false,
  },
  {
    id: 'conv4',
    title: 'Thomas Martin',
    type: 'direct',
    participants: ['Thomas Martin'],
    lastMessage: { content: 'Pouvez-vous confirmer la réunion de demain ?', sender: 'Thomas Martin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: true },
    unreadCount: 0,
    pinned: false,
    starred: true,
  },
  {
    id: 'conv5',
    title: 'Comité de Direction',
    type: 'group',
    participants: ['Sophie Dubois', 'Marc Petit', 'Julie Bernard', 'Pierre Laurent'],
    lastMessage: { content: 'Prochaine réunion fixée au 15 janvier', sender: 'Sophie Dubois', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
    unreadCount: 0,
    pinned: false,
    starred: false,
  },
  {
    id: 'conv6',
    title: 'Claire Ndong',
    type: 'direct',
    participants: ['Claire Ndong'],
    lastMessage: { content: 'Merci pour votre retour rapide !', sender: 'Claire Ndong', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
    unreadCount: 0,
    pinned: false,
    starred: false,
  },
];

type ConversationType = 'all' | 'direct' | 'group';
type ReadFilter = 'all' | 'unread' | 'read';
type SortField = 'timestamp' | 'unread' | 'name';
type SortOrder = 'asc' | 'desc';

interface DetailedConversationsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return format(date, 'HH:mm', { locale: fr });
  if (isYesterday(date)) return 'Hier';
  if (isThisWeek(date)) return format(date, 'EEEE', { locale: fr });
  return format(date, 'dd/MM/yyyy', { locale: fr });
}

export function DetailedConversationsView({ isOpen, onClose }: DetailedConversationsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ConversationType>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const filteredAndSortedConversations = useMemo(() => {
    let result = mockConversations.filter(conv => {
      // Search filter
      const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Type filter
      const matchesType = typeFilter === 'all' || conv.type === typeFilter;
      
      // Read filter
      let matchesRead = true;
      if (readFilter === 'unread') matchesRead = conv.unreadCount > 0;
      else if (readFilter === 'read') matchesRead = conv.unreadCount === 0;
      
      // Special filters
      if (showPinnedOnly && !conv.pinned) return false;
      if (showStarredOnly && !conv.starred) return false;
      
      return matchesSearch && matchesType && matchesRead;
    });

    // Sort - pinned first, then by sort field
    result.sort((a, b) => {
      // Pinned conversations first
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
      } else if (sortField === 'unread') {
        comparison = b.unreadCount - a.unreadCount;
      } else if (sortField === 'name') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, typeFilter, readFilter, showPinnedOnly, showStarredOnly, sortField, sortOrder]);

  // Stats
  const stats = useMemo(() => ({
    total: mockConversations.length,
    unread: mockConversations.filter(c => c.unreadCount > 0).length,
    direct: mockConversations.filter(c => c.type === 'direct').length,
    group: mockConversations.filter(c => c.type === 'group').length,
    pinned: mockConversations.filter(c => c.pinned).length,
  }), []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-4 sm:p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Conversations
            </SheetTitle>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {/* Type filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                    Toutes les conversations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('direct')}>
                    <User className="w-4 h-4 mr-2" />
                    Messages directs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('group')}>
                    <Users className="w-4 h-4 mr-2" />
                    Groupes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setReadFilter('unread')}>
                    Non lues seulement
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={showPinnedOnly}
                    onCheckedChange={setShowPinnedOnly}
                  >
                    <Pin className="w-4 h-4 mr-2" />
                    Épinglées
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showStarredOnly}
                    onCheckedChange={setShowStarredOnly}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Favorites
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortField('timestamp'); setSortOrder('desc'); }}>
                    Plus récent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField('timestamp'); setSortOrder('asc'); }}>
                    Plus ancien
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSortField('unread'); setSortOrder('desc'); }}>
                    Non lues d'abord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortField('name'); setSortOrder('asc'); }}>
                    Nom (A-Z)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetHeader>

        {/* Stats bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-border/30 bg-secondary/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                {filteredAndSortedConversations.length} conversations
              </span>
              {stats.unread > 0 && (
                <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                  {stats.unread} non lues
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{stats.direct} directs</span>
              <span>·</span>
              <span>{stats.group} groupes</span>
            </div>
          </div>
        </div>

        {/* Conversations list */}
        <ScrollArea className="flex-1">
          <motion.div 
            className="p-2 sm:p-4 space-y-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredAndSortedConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "p-3 rounded-xl cursor-pointer transition-all duration-200",
                    "hover:bg-secondary/50 border border-transparent hover:border-border/50",
                    conv.unreadCount > 0 && "bg-primary/5",
                    selectedConversation?.id === conv.id && "ring-2 ring-primary/50 bg-secondary/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className={cn(
                          "text-sm font-medium",
                          conv.type === 'group' ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"
                        )}>
                          {conv.type === 'group' ? (
                            <Users className="w-5 h-5" />
                          ) : (
                            conv.title.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conv.pinned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Pin className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className={cn(
                            "text-sm truncate",
                            conv.unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"
                          )}>
                            {conv.title}
                          </h4>
                          {conv.starred && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {getDateLabel(new Date(conv.lastMessage.timestamp))}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className={cn(
                          "text-xs truncate flex-1",
                          conv.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {conv.type === 'group' && (
                            <span className="font-medium">{conv.lastMessage.sender}: </span>
                          )}
                          {conv.lastMessage.content}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {conv.lastMessage.read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          {conv.unreadCount > 0 && (
                            <Badge className="h-5 min-w-5 px-1.5 text-[10px] bg-primary">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {conv.type === 'group' && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            {conv.participants.length} membres
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAndSortedConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucune conversation trouvée</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Essayez de modifier vos filtres
                </p>
              </div>
            )}
          </motion.div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
