import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Building2, 
  User, 
  Circle,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  Check,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline' | 'busy';
  company: string;
  phone: string;
  email?: string;
  avatar?: string;
  department?: string;
}

interface AdvancedContactFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockContacts: Contact[] = [
  { id: '1', name: 'Jean Dupont', role: 'Chef de projet', status: 'online', company: 'TechCorp', phone: '+33 6 12 34 56 78', email: 'jean.dupont@techcorp.fr', department: 'IT' },
  { id: '2', name: 'Marie Martin', role: 'Directrice RH', status: 'away', company: 'Alpha Solutions', phone: '+33 6 23 45 67 89', email: 'marie.martin@alpha.fr', department: 'RH' },
  { id: '3', name: 'Pierre Laurent', role: 'Développeur', status: 'offline', company: 'BizPartner', phone: '+33 6 34 56 78 90', email: 'pierre.laurent@bizpartner.fr', department: 'IT' },
  { id: '4', name: 'Sophie Dubois', role: 'Designer', status: 'online', company: 'Consultants Pro', phone: '+33 6 45 67 89 01', email: 'sophie.dubois@cpro.fr', department: 'Design' },
  { id: '5', name: 'Marc Petit', role: 'Commercial', status: 'online', company: 'StartupXYZ', phone: '+33 6 56 78 90 12', email: 'marc.petit@startupxyz.fr', department: 'Ventes' },
  { id: '6', name: 'Julie Bernard', role: 'CEO', status: 'away', company: 'InnovateNow', phone: '+33 6 67 89 01 23', email: 'julie.bernard@innovatenow.fr', department: 'Direction' },
  { id: '7', name: 'Thomas Leroy', role: 'Analyste', status: 'busy', company: 'TechCorp', phone: '+33 6 78 90 12 34', email: 'thomas.leroy@techcorp.fr', department: 'Finance' },
  { id: '8', name: 'Emma Roux', role: 'Ingénieur', status: 'online', company: 'Alpha Solutions', phone: '+33 6 89 01 23 45', email: 'emma.roux@alpha.fr', department: 'IT' },
  { id: '9', name: 'Lucas Moreau', role: 'Manager', status: 'offline', company: 'BizPartner', phone: '+33 6 90 12 34 56', email: 'lucas.moreau@bizpartner.fr', department: 'Opérations' },
  { id: '10', name: 'Chloé Girard', role: 'Consultante', status: 'online', company: 'Consultants Pro', phone: '+33 6 01 23 45 67', email: 'chloe.girard@cpro.fr', department: 'Conseil' },
];

const statusConfig = {
  online: { label: 'En ligne', color: 'bg-green-500', textColor: 'text-green-500' },
  away: { label: 'Absent', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  busy: { label: 'Occupé', color: 'bg-red-500', textColor: 'text-red-500' },
  offline: { label: 'Hors ligne', color: 'bg-muted', textColor: 'text-muted-foreground' },
};

export function AdvancedContactFilters({ isOpen, onClose }: AdvancedContactFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Extract unique values for filters
  const companies = useMemo(() => [...new Set(mockContacts.map(c => c.company))], []);
  const roles = useMemo(() => [...new Set(mockContacts.map(c => c.role))], []);
  const departments = useMemo(() => [...new Set(mockContacts.map(c => c.department).filter(Boolean))], []);
  const statuses = ['online', 'away', 'busy', 'offline'] as const;

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return mockContacts.filter(contact => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        contact.name.toLowerCase().includes(searchLower) ||
        contact.company.toLowerCase().includes(searchLower) ||
        contact.role.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.phone.includes(searchQuery);

      // Company filter
      const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(contact.company);

      // Role filter
      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(contact.role);

      // Status filter
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(contact.status);

      // Department filter
      const matchesDepartment = selectedDepartments.length === 0 || (contact.department && selectedDepartments.includes(contact.department));

      return matchesSearch && matchesCompany && matchesRole && matchesStatus && matchesDepartment;
    });
  }, [searchQuery, selectedCompanies, selectedRoles, selectedStatuses, selectedDepartments]);

  const activeFiltersCount = selectedCompanies.length + selectedRoles.length + selectedStatuses.length + selectedDepartments.length;

  const clearAllFilters = () => {
    setSelectedCompanies([]);
    setSelectedRoles([]);
    setSelectedStatuses([]);
    setSelectedDepartments([]);
    setSearchQuery('');
  };

  const toggleFilter = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Contacts</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} trouvé{filteredContacts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 sm:p-6 border-b border-border space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, entreprise, rôle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-2">
              {/* Company Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Entreprise
                    {selectedCompanies.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedCompanies.length}</Badge>
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Entreprises</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {companies.map(company => (
                    <DropdownMenuCheckboxItem
                      key={company}
                      checked={selectedCompanies.includes(company)}
                      onCheckedChange={() => toggleFilter(company, selectedCompanies, setSelectedCompanies)}
                    >
                      {company}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Role Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Rôle
                    {selectedRoles.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedRoles.length}</Badge>
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Rôles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles.map(role => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleFilter(role, selectedRoles, setSelectedRoles)}
                    >
                      {role}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Circle className="w-4 h-4" />
                    Statut
                    {selectedStatuses.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedStatuses.length}</Badge>
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Statuts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statuses.map(status => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => toggleFilter(status, selectedStatuses, setSelectedStatuses)}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", statusConfig[status].color)} />
                        {statusConfig[status].label}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Department Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Département
                    {selectedDepartments.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedDepartments.length}</Badge>
                    )}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Départements</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {departments.map(dept => (
                    <DropdownMenuCheckboxItem
                      key={dept}
                      checked={selectedDepartments.includes(dept!)}
                      onCheckedChange={() => toggleFilter(dept!, selectedDepartments, setSelectedDepartments)}
                    >
                      {dept}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-1" />
                  Effacer ({activeFiltersCount})
                </Button>
              )}
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCompanies.map(company => (
                  <Badge key={company} variant="secondary" className="gap-1">
                    <Building2 className="w-3 h-3" />
                    {company}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(company, selectedCompanies, setSelectedCompanies)} />
                  </Badge>
                ))}
                {selectedRoles.map(role => (
                  <Badge key={role} variant="secondary" className="gap-1">
                    <User className="w-3 h-3" />
                    {role}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(role, selectedRoles, setSelectedRoles)} />
                  </Badge>
                ))}
                {selectedStatuses.map(status => (
                  <Badge key={status} variant="secondary" className="gap-1">
                    <span className={cn("w-2 h-2 rounded-full", statusConfig[status as keyof typeof statusConfig].color)} />
                    {statusConfig[status as keyof typeof statusConfig].label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(status, selectedStatuses, setSelectedStatuses)} />
                  </Badge>
                ))}
                {selectedDepartments.map(dept => (
                  <Badge key={dept} variant="secondary" className="gap-1">
                    {dept}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleFilter(dept, selectedDepartments, setSelectedDepartments)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
            <div className="p-4 sm:p-6 space-y-3">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun contact trouvé</p>
                  <p className="text-sm">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                              statusConfig[contact.status].color
                            )} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{contact.name}</h3>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {contact.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{contact.company}</span>
                              {contact.department && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{contact.department}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </span>
                              {contact.email && (
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Appeler">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Message">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Email">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
