import { useTranslation } from 'react-i18next';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Building2, 
  Briefcase, 
  User, 
  UserCheck,
  MessageCircle,
  Brain,
  Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface QuickDemoBarProps {
  onOpenComms: () => void;
  onOpenAsted: () => void;
}

const profileButtons = [
  { id: 'platform_admin_okatech', labelKey: 'quickDemo.platformAdmin', icon: Crown, color: 'text-amber-400 hover:bg-amber-500/20' },
  { id: 'service_gov_app', labelKey: 'quickDemo.govService', icon: Building2, color: 'text-blue-400 hover:bg-blue-500/20' },
  { id: 'service_commercial_app', labelKey: 'quickDemo.bizService', icon: Briefcase, color: 'text-emerald-400 hover:bg-emerald-500/20' },
  { id: 'delegated_citizen', labelKey: 'quickDemo.citizen', icon: User, color: 'text-purple-400 hover:bg-purple-500/20' },
  { id: 'delegated_gov_agent', labelKey: 'quickDemo.govAgent', icon: UserCheck, color: 'text-cyan-400 hover:bg-cyan-500/20' },
];

export function QuickDemoBar({ onOpenComms, onOpenAsted }: QuickDemoBarProps) {
  const { t } = useTranslation();
  const { activeProfile, switchProfile, effectiveModules } = useDemo();
  
  const iAstedEnabled = effectiveModules.find(m => m.name === 'iasted')?.enabled ?? false;
  
  const handleOpenAsted = () => {
    if (iAstedEnabled) {
      onOpenAsted();
    } else {
      const reason = effectiveModules.find(m => m.name === 'iasted')?.disabled_reason;
      toast.error(`iAsted ${t('common.disabled')}${reason ? `: ${reason}` : ''}`);
    }
  };
  
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 border border-border/50">
      {/* Profile Buttons */}
      <div className="flex items-center gap-0.5">
        {profileButtons.map(({ id, labelKey, icon: Icon, color }) => {
          const isActive = activeProfile?.id === id;
          const label = t(labelKey);
          return (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              onClick={() => switchProfile(id)}
              className={cn(
                "h-8 px-2 gap-1.5 text-xs font-medium transition-all",
                color,
                isActive && "bg-primary/20 ring-1 ring-primary/50"
              )}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{label}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Separator */}
      <div className="w-px h-6 bg-border/50 mx-1" />
      
      {/* Quick Actions */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenComms}
          className="h-8 px-2 gap-1.5 text-xs font-medium text-foreground hover:bg-primary/20"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('quickDemo.openComms')}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenAsted}
          className={cn(
            "h-8 px-2 gap-1.5 text-xs font-medium",
            iAstedEnabled ? "text-neural hover:bg-neural/20" : "text-muted-foreground opacity-50"
          )}
        >
          <Brain className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t('quickDemo.openAsted')}</span>
        </Button>
        
        <Link to="/debug">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary/50"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t('nav.debug')}</span>
          </Button>
        </Link>
        
        <Link to="/simulator">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 gap-1.5 text-xs font-medium border-primary/50 text-primary hover:bg-primary/10"
          >
            <span>{t('nav.simulator')}</span>
          </Button>
        </Link>
        
        {/* Language Switcher */}
        <div className="w-px h-6 bg-border/50 mx-1" />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
