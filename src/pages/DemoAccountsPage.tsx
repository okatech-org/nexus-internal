import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Search, Crown, Building, Server, User, 
  Shield, Network, Globe, Lock, Check, Eye, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { DemoAccount } from '@/types/demo-accounts';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const modeIcons = {
  platform_admin: Crown,
  tenant_admin: Building,
  service: Server,
  delegated: User,
};

const modeColors = {
  platform_admin: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  tenant_admin: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  service: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  delegated: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
};

const filterTabs = [
  { id: 'all', label: 'Tous' },
  { id: 'platform', label: 'Platform' },
  { id: 'government', label: 'Government' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'delegated', label: 'Delegated' },
];

export default function DemoAccountsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { demoAccounts, loginWithDemo, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const filteredAccounts = useMemo(() => {
    return demoAccounts.filter(account => {
      // Search filter
      const matchesSearch = !searchQuery || 
        account.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.app_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Tab filter
      let matchesFilter = true;
      if (activeFilter === 'platform') {
        matchesFilter = account.mode === 'platform_admin';
      } else if (activeFilter === 'government') {
        matchesFilter = account.network_type === 'government' && account.mode !== 'platform_admin';
      } else if (activeFilter === 'commercial') {
        matchesFilter = account.network_type === 'commercial';
      } else if (activeFilter === 'delegated') {
        matchesFilter = account.mode === 'delegated';
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [demoAccounts, searchQuery, activeFilter]);
  
  const handleLogin = async (account: DemoAccount) => {
    setIsLoading(account.id);
    try {
      const success = await loginWithDemo(account);
      if (success) {
        // Redirect based on mode
        switch (account.mode) {
          case 'platform_admin':
            navigate('/');
            break;
          case 'tenant_admin':
            navigate('/');
            break;
          case 'service':
            navigate('/');
            break;
          case 'delegated':
            navigate('/');
            break;
          default:
            navigate('/');
        }
      }
    } finally {
      setIsLoading(null);
    }
  };
  
  const getModuleStatus = (account: DemoAccount, module: string) => {
    const desired = account.desired_modules[module as keyof typeof account.desired_modules];
    if (!desired) return { enabled: false, reason: 'Non demandé' };
    
    // iCorrespondance special rules
    if (module === 'icorrespondance') {
      if (account.network_type !== 'government') {
        return { enabled: false, reason: 'Réseau gov uniquement' };
      }
      if (account.realm !== 'government' && account.realm !== 'platform') {
        return { enabled: false, reason: 'Realm gov requis' };
      }
    }
    
    return { enabled: true };
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neural/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-neural flex items-center justify-center">
                  <Layers className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Comptes Démo</h1>
                  <p className="text-xs text-muted-foreground">Choisir un profil pour accéder à la sandbox</p>
                </div>
              </div>
            </div>
            
            {isAuthenticated && (
              <Link to="/">
                <Button variant="outline" size="sm">
                  Retour à l'app
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un compte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Accounts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAccounts.map((account, index) => {
              const ModeIcon = modeIcons[account.mode];
              
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border",
                        modeColors[account.mode]
                      )}>
                        <ModeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{account.label}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{account.app_id}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {account.description}
                  </p>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {account.mode.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {account.realm}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        account.network_type === 'government' 
                          ? "border-blue-500/30 text-blue-400" 
                          : "border-amber-500/30 text-amber-400"
                      )}
                    >
                      {account.network_type}
                    </Badge>
                  </div>
                  
                  {/* Modules */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {['icom', 'iboite', 'iasted', 'icorrespondance'].map((module) => {
                      const status = getModuleStatus(account, module);
                      return (
                        <span
                          key={module}
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            status.enabled
                              ? "bg-success/20 text-success"
                              : "bg-muted text-muted-foreground"
                          )}
                          title={status.reason}
                        >
                          {module}
                        </span>
                      );
                    })}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleLogin(account)}
                      disabled={isLoading === account.id}
                    >
                      {isLoading === account.id ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          Entrer
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <h4 className="font-medium text-foreground mb-3">Détails du profil</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tenant</span>
                            <span className="font-mono">{account.tenant_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Network</span>
                            <span className="font-mono">{account.network || 'N/A'}</span>
                          </div>
                          {account.actor_id && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Actor ID</span>
                              <span className="font-mono">{account.actor_id}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-border">
                            <span className="text-muted-foreground block mb-1">Scopes ({account.permissions.length})</span>
                            <div className="flex flex-wrap gap-1">
                              {account.permissions.slice(0, 6).map((scope) => (
                                <span key={scope} className="px-1.5 py-0.5 rounded bg-secondary text-xs font-mono">
                                  {scope}
                                </span>
                              ))}
                              {account.permissions.length > 6 && (
                                <span className="text-muted-foreground">+{account.permissions.length - 6}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun compte trouvé</p>
          </div>
        )}
        
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 rounded-2xl glass border border-primary/20"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Architecture App-Centric</h3>
              <p className="text-sm text-muted-foreground">
                NDJOBI est une plateforme pour <strong>applications</strong>, pas pour des utilisateurs finaux.
                Les comptes démo simulent différents types d'accès API avec JWT signé, scopes et policies réels.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
