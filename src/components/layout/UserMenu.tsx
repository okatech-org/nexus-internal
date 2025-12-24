import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, Shield, LogOut, Users, Key, Settings, 
  ChevronDown, Building2, Network, Globe, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const modeIcons = {
  platform_admin: Shield,
  tenant_admin: Building2,
  service: Key,
  delegated: User,
};

const modeColors = {
  platform_admin: 'text-amber-400 bg-amber-500/20',
  tenant_admin: 'text-blue-400 bg-blue-500/20',
  service: 'text-emerald-400 bg-emerald-500/20',
  delegated: 'text-violet-400 bg-violet-500/20',
};

export function UserMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { payload, activeProfile, logout, expiresIn } = useAuth();
  
  if (!payload) return null;
  
  const ModeIcon = modeIcons[payload.mode as keyof typeof modeIcons] || User;
  const modeLabel = t(`modes.${payload.mode}`) || payload.mode;
  const modeColor = modeColors[payload.mode as keyof typeof modeColors] || 'text-primary bg-primary/20';
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleBackToHome = () => {
    logout();
    navigate('/');
  };
  
  const handleSwitchAccount = () => {
    navigate('/demo-accounts');
  };
  
  // Format expiration time
  const formatExpiry = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 h-10 px-3">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", modeColor)}>
            <ModeIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-medium leading-none">
              {activeProfile?.label || payload.sub}
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
              {modeLabel}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72">
        {/* Profile Header */}
        <div className="px-3 py-3">
          <div className="flex items-start gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", modeColor)}>
              <ModeIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-foreground truncate">
                {activeProfile?.label || payload.sub}
              </p>
              <p className="text-xs text-muted-foreground">
                {modeLabel}
              </p>
              <Badge variant="outline" className="mt-1 text-[10px] h-5">
                {t('userMenu.expiresIn')} {formatExpiry(expiresIn)}
              </Badge>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Session Details */}
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">
          {t('userMenu.session')}
        </DropdownMenuLabel>
        
        <div className="px-3 py-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Key className="w-3 h-3" />
              {t('userMenu.appId')}
            </span>
            <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">
              {payload.app_id}
            </code>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              {t('userMenu.tenant')}
            </span>
            <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[10px]">
              {payload.tenant_id}
            </code>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Network className="w-3 h-3" />
              {t('userMenu.network')}
            </span>
            <Badge variant={payload.network_type === 'government' ? 'default' : 'secondary'} className="text-[10px] h-5">
              {t(`networkTypes.${payload.network_type}`)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              {t('userMenu.realm')}
            </span>
            <Badge variant="outline" className="text-[10px] h-5 capitalize">
              {t(`realms.${payload.realm}`)}
            </Badge>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Scopes Preview */}
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal">
          {t('userMenu.scopes')} ({payload.scopes.length})
        </DropdownMenuLabel>
        
        <div className="px-3 py-2">
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {payload.scopes.slice(0, 8).map((scope) => (
              <span 
                key={scope} 
                className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono"
              >
                {scope}
              </span>
            ))}
            {payload.scopes.length > 8 && (
              <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                +{payload.scopes.length - 8} {t('userMenu.more')}
              </span>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Actions */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/debug')} className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            {t('nav.jwtInspector')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSwitchAccount} className="cursor-pointer">
            <Users className="w-4 h-4 mr-2" />
            {t('nav.switchAccount')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleBackToHome} 
          className="cursor-pointer"
        >
          <Home className="w-4 h-4 mr-2" />
          {t('nav.backToHome')}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
