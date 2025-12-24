import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Clock, 
  Search, 
  Filter,
  Calendar,
  ChevronDown,
  X,
  User,
  Building2,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Call {
  id: string;
  contact_name: string;
  contact_id: string;
  company?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  timestamp: string;
}

const mockCalls: Call[] = [
  { id: 'call1', contact_name: 'Jean Dupont', contact_id: 'c1', company: 'TechCorp', type: 'incoming', duration: 342, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'call2', contact_name: 'Marie Koumba', contact_id: 'c2', company: 'Alpha Solutions', type: 'outgoing', duration: 180, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'call3', contact_name: 'Tech Solutions SARL', contact_id: 'c3', type: 'missed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'call4', contact_name: 'Paul Obame', contact_id: 'c4', company: 'BizPartner', type: 'outgoing', duration: 45, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'call5', contact_name: 'Claire Ndong', contact_id: 'c5', company: 'StartupXYZ', type: 'incoming', duration: 520, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { id: 'call6', contact_name: 'Thomas Martin', contact_id: 'c6', company: 'Consulting Pro', type: 'missed', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: 'call7', contact_name: 'Sophie Dubois', contact_id: 'c7', company: 'InnovateNow', type: 'outgoing', duration: 890, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
  { id: 'call8', contact_name: 'Marc Petit', contact_id: 'c8', company: 'DigitalFirst', type: 'incoming', duration: 120, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
];

const callTypeConfig = {
  incoming: { icon: PhoneIncoming, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Entrant' },
  outgoing: { icon: PhoneOutgoing, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Sortant' },
  missed: { icon: PhoneMissed, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Manqué' },
};

type SortField = 'timestamp' | 'duration' | 'name';
type SortOrder = 'asc' | 'desc';
type DateFilter = 'all' | 'today' | 'yesterday' | 'week';

interface DetailedCallsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getDateGroup(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return 'Hier';
  if (isThisWeek(date)) return 'Cette semaine';
  return format(date, 'MMMM yyyy', { locale: fr });
}

export function DetailedCallsView({ isOpen, onClose }: DetailedCallsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set(['incoming', 'outgoing', 'missed']));
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const toggleTypeFilter = (type: string) => {
    const newFilters = new Set(typeFilters);
    if (newFilters.has(type)) {
      if (newFilters.size > 1) newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setTypeFilters(newFilters);
  };

  const filteredAndSortedCalls = useMemo(() => {
    let result = mockCalls.filter(call => {
      // Search filter
      const matchesSearch = call.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (call.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      // Type filter
      const matchesType = typeFilters.has(call.type);
      
      // Date filter
      const callDate = new Date(call.timestamp);
      let matchesDate = true;
      if (dateFilter === 'today') matchesDate = isToday(callDate);
      else if (dateFilter === 'yesterday') matchesDate = isYesterday(callDate);
      else if (dateFilter === 'week') matchesDate = isThisWeek(callDate);
      
      return matchesSearch && matchesType && matchesDate;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'timestamp') {
        comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortField === 'duration') {
        comparison = (b.duration || 0) - (a.duration || 0);
      } else if (sortField === 'name') {
        comparison = a.contact_name.localeCompare(b.contact_name);
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, typeFilters, dateFilter, sortField, sortOrder]);

  // Group calls by date
  const groupedCalls = useMemo(() => {
    const groups: Record<string, Call[]> = {};
    filteredAndSortedCalls.forEach(call => {
      const group = getDateGroup(new Date(call.timestamp));
      if (!groups[group]) groups[group] = [];
      groups[group].push(call);
    });
    return groups;
  }, [filteredAndSortedCalls]);

  // Stats
  const stats = useMemo(() => ({
    total: filteredAndSortedCalls.length,
    incoming: filteredAndSortedCalls.filter(c => c.type === 'incoming').length,
    outgoing: filteredAndSortedCalls.filter(c => c.type === 'outgoing').length,
    missed: filteredAndSortedCalls.filter(c => c.type === 'missed').length,
    totalDuration: filteredAndSortedCalls.reduce((acc, c) => acc + (c.duration || 0), 0),
  }), [filteredAndSortedCalls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-4 sm:p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-500" />
              Historique des appels
            </SheetTitle>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contact..."
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
                    Type
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(callTypeConfig).map(([type, config]) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilters.has(type)}
                      onCheckedChange={() => toggleTypeFilter(type)}
                    >
                      <config.icon className={cn("w-4 h-4 mr-2", config.color)} />
                      {config.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDateFilter('all')}>
                    Tous les appels
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('today')}>
                    Aujourd'hui
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('yesterday')}>
                    Hier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter('week')}>
                    Cette semaine
                  </DropdownMenuItem>
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
                  <DropdownMenuItem onClick={() => { setSortField('duration'); setSortOrder('desc'); }}>
                    Durée (décroissant)
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
                {stats.total} appels
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-500 border-green-500/30 text-xs">
                  {stats.incoming} ↓
                </Badge>
                <Badge variant="outline" className="text-blue-500 border-blue-500/30 text-xs">
                  {stats.outgoing} ↑
                </Badge>
                <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
                  {stats.missed} ✕
                </Badge>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDuration(stats.totalDuration)} total
            </span>
          </div>
        </div>

        {/* Calls list */}
        <ScrollArea className="flex-1">
          <motion.div 
            className="p-4 sm:p-6 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Object.entries(groupedCalls).map(([group, calls]) => (
              <div key={group}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {group}
                </h3>
                <div className="space-y-2">
                  {calls.map((call, index) => {
                    const TypeIcon = callTypeConfig[call.type].icon;
                    return (
                      <motion.div
                        key={call.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedCall(call)}
                        className={cn(
                          "p-3 rounded-xl cursor-pointer transition-all duration-200",
                          "bg-card hover:bg-secondary/50 border border-border/50 hover:border-border",
                          selectedCall?.id === call.id && "ring-2 ring-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            callTypeConfig[call.type].bg
                          )}>
                            <TypeIcon className={cn("w-5 h-5", callTypeConfig[call.type].color)} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {call.contact_name}
                              </h4>
                              <Badge variant="outline" className={cn(
                                "text-[10px] px-1.5 py-0 h-4",
                                callTypeConfig[call.type].color
                              )}>
                                {callTypeConfig[call.type].label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {call.company && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Building2 className="w-3 h-3" />
                                  {call.company}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {format(new Date(call.timestamp), 'HH:mm', { locale: fr })}
                              </span>
                              {call.duration !== undefined && call.duration > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(call.duration)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredAndSortedCalls.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Phone className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucun appel trouvé</p>
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
