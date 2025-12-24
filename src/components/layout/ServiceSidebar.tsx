/**
 * Service/Delegated Dashboard Sidebar Component
 * Dynamic navigation based on enabled modules and features
 */

import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle,
  Phone,
  Video,
  Users,
  Inbox,
  Brain,
  FileText,
  Home,
  ChevronLeft,
  Trophy,
  Target,
  BarChart3,
  Gift,
  Sparkles,
  UsersRound,
  Crown,
  Bell,
  Settings,
  Activity,
  Server,
  User,
  Shield,
  Building2,
  Briefcase,
  type LucideIcon
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';

type DashboardMode = 'service' | 'delegated';

interface ServiceSidebarProps {
  mode: DashboardMode;
  onOpenPanel?: (panel: string) => void;
  unreadCounts?: {
    chat?: number;
    calls?: number;
    meetings?: number;
    inbox?: number;
    documents?: number;
  };
  gamificationStats?: {
    level?: number;
    streak?: number;
    claimableQuests?: number;
    pendingChallenges?: number;
  };
}

interface MenuItem {
  id: string;
  title: string;
  icon: LucideIcon;
  action?: string;
  unread?: number;
  enabled: boolean;
  color?: string;
}

interface MenuGroup {
  group: string;
  label?: string;
  items: MenuItem[];
}

export function ServiceSidebar({ 
  mode, 
  onOpenPanel,
  unreadCounts = {},
  gamificationStats = {}
}: ServiceSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  const { payload, hasScope } = useAuth();
  const { activeProfile } = useDemo();
  const collapsed = state === 'collapsed';
  
  // Check which features are enabled based on scopes
  const hasChat = hasScope('icom:chat:*');
  const hasCall = hasScope('icom:call:use');
  const hasMeeting = hasScope('icom:meeting:use');
  const hasContact = hasScope('icom:contact:read');
  const hasIboite = hasScope('iboite:read');
  const hasIasted = hasScope('iasted:chat');
  const hasCorrespondance = hasScope('icorrespondance:read');
  
  // Profile configuration based on mode and realm
  const getProfileConfig = () => {
    const realm = payload?.realm;
    const networkType = payload?.network_type;
    
    if (mode === 'delegated') {
      if (realm === 'government') {
        return {
          name: 'Agent Gouvernemental',
          description: 'Full iCom + iCorrespondance',
          icon: Shield,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20',
        };
      }
      return {
        name: 'Espace Citoyen',
        description: 'Services personnalisés',
        icon: User,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
      };
    }
    
    // Service mode profiles
    if (networkType === 'government') {
      return {
        name: 'Gov Service',
        description: 'Full iCom Suite',
        icon: Server,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
      };
    }
    if (hasCall && hasContact && !hasChat && !hasMeeting) {
      return {
        name: 'Biz Service',
        description: 'iAppel + iContact',
        icon: Briefcase,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
      };
    }
    if (hasChat && hasContact && !hasCall && !hasMeeting && !hasIboite) {
      return {
        name: 'Startup App',
        description: 'iChat + iContact',
        icon: Building2,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
      };
    }
    return {
      name: 'Service',
      description: 'Configuration personnalisée',
      icon: Building2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    };
  };
  
  const profileConfig = getProfileConfig();
  const ProfileIcon = profileConfig.icon;
  
  // Build menu items based on enabled features
  const communicationItems: MenuItem[] = [
    {
      id: 'chat',
      title: 'iChat',
      icon: MessageCircle,
      action: 'chat',
      unread: unreadCounts.chat,
      enabled: hasChat,
      color: 'text-blue-500',
    },
    {
      id: 'call',
      title: 'iAppel',
      icon: Phone,
      action: 'call',
      unread: unreadCounts.calls,
      enabled: hasCall,
      color: 'text-orange-500',
    },
    {
      id: 'meeting',
      title: 'iRéunion',
      icon: Video,
      action: 'meeting',
      unread: unreadCounts.meetings,
      enabled: hasMeeting,
      color: 'text-purple-500',
    },
    {
      id: 'contact',
      title: 'iContact',
      icon: Users,
      action: 'contact',
      enabled: hasContact,
      color: 'text-emerald-500',
    },
  ];
  
  const modulesItems: MenuItem[] = [
    {
      id: 'iboite',
      title: 'iBoîte',
      icon: Inbox,
      action: 'iboite',
      unread: unreadCounts.inbox,
      enabled: hasIboite,
      color: 'text-iboite',
    },
    {
      id: 'iasted',
      title: 'iAsted',
      icon: Brain,
      action: 'iasted',
      enabled: hasIasted,
      color: 'text-neural',
    },
    {
      id: 'icorrespondance',
      title: 'iCorrespondance',
      icon: FileText,
      action: 'icorrespondance',
      unread: unreadCounts.documents,
      enabled: hasCorrespondance,
      color: 'text-primary',
    },
  ];
  
  const gamificationItems: MenuItem[] = [
    {
      id: 'challenges',
      title: 'Défis du jour',
      icon: Target,
      action: 'challenges',
      unread: gamificationStats.pendingChallenges,
      enabled: true,
      color: 'text-orange-500',
    },
    {
      id: 'weekly-rewards',
      title: 'Récompenses',
      icon: Gift,
      action: 'weekly-rewards',
      unread: gamificationStats.streak,
      enabled: true,
      color: 'text-pink-500',
    },
    {
      id: 'monthly-quests',
      title: 'Quêtes mensuelles',
      icon: Sparkles,
      action: 'monthly-quests',
      unread: gamificationStats.claimableQuests,
      enabled: true,
      color: 'text-purple-500',
    },
    {
      id: 'badges',
      title: 'Badges',
      icon: Trophy,
      action: 'badges',
      enabled: true,
      color: 'text-amber-500',
    },
    {
      id: 'leaderboard',
      title: 'Classement',
      icon: Crown,
      action: 'leaderboard',
      enabled: true,
      color: 'text-purple-500',
    },
    {
      id: 'team',
      title: 'Performance équipe',
      icon: UsersRound,
      action: 'team',
      enabled: true,
      color: 'text-blue-500',
    },
    {
      id: 'stats',
      title: 'Statistiques',
      icon: BarChart3,
      action: 'stats',
      enabled: true,
      color: 'text-cyan-500',
    },
  ];
  
  const enabledCommunication = communicationItems.filter(item => item.enabled);
  const enabledModules = modulesItems.filter(item => item.enabled);
  
  const menuGroups: MenuGroup[] = [
    {
      group: 'communication',
      label: 'iCom',
      items: enabledCommunication,
    },
    {
      group: 'modules',
      label: 'Modules',
      items: enabledModules,
    },
    {
      group: 'gamification',
      label: 'Gamification',
      items: gamificationItems,
    },
  ].filter(group => group.items.length > 0);
  
  const handleItemClick = (action?: string) => {
    if (action && onOpenPanel) {
      onOpenPanel(action);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <SidebarHeader className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "rounded-xl flex items-center justify-center shrink-0 w-9 h-9 sm:w-10 sm:h-10",
            profileConfig.bgColor
          )}>
            <ProfileIcon className={cn("w-4 h-4 sm:w-5 sm:h-5", profileConfig.color)} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-sidebar-foreground truncate text-sm">
                {profileConfig.name}
              </h2>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profileConfig.description}
              </p>
            </div>
          )}
        </div>
        
        {!collapsed && activeProfile && (
          <div className="mt-2 sm:mt-3 p-2 rounded-lg bg-sidebar-accent/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              <span className="text-xs font-mono text-sidebar-foreground/70 truncate">
                {payload?.app_id}
              </span>
            </div>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                {payload?.network_type}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                {mode}
              </Badge>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent className="px-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.group} className="py-2">
            {group.label && (
              <SidebarGroupLabel className="text-[10px] sm:text-xs uppercase tracking-wider text-sidebar-foreground/50 px-2 mb-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => handleItemClick(item.action)}
                      tooltip={collapsed ? item.title : undefined}
                      className="relative cursor-pointer h-9 sm:h-10 px-2 sm:px-3 hover:bg-sidebar-accent/70 transition-colors rounded-lg"
                    >
                      <item.icon className={cn("w-4 h-4 shrink-0", item.color)} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm">{item.title}</span>
                          {item.unread !== undefined && item.unread > 0 && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "h-5 min-w-5 px-1.5 text-[10px] font-medium",
                                item.color?.replace('text-', 'bg-') + '/20',
                                item.color
                              )}
                            >
                              {item.unread > 99 ? '99+' : item.unread}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && item.unread !== undefined && item.unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-destructive text-[9px] flex items-center justify-center text-white font-medium">
                          {item.unread > 9 ? '9+' : item.unread}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 py-3 sm:px-4 sm:py-4">
        {!collapsed && gamificationStats.level !== undefined && (
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-2 sm:mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span className="text-xs font-medium text-sidebar-foreground">
                  Niveau {gamificationStats.level}
                </span>
              </div>
              <Badge className="bg-amber-500/20 text-amber-400 text-[10px] h-5">
                {gamificationStats.level && gamificationStats.level >= 10 ? 'Expert' : 'Novice'}
              </Badge>
            </div>
          </div>
        )}
        
        <SidebarMenuButton
          onClick={() => handleItemClick('notifications')}
          tooltip={collapsed ? 'Notifications' : undefined}
          className="cursor-pointer h-9 px-2 sm:px-3 hover:bg-sidebar-accent/70 rounded-lg"
        >
          <Bell className="w-4 h-4" />
          {!collapsed && <span className="text-sm">Notifications</span>}
        </SidebarMenuButton>
        
        <SidebarSeparator className="my-2" />
        
        <Link to="/demo-accounts">
          <SidebarMenuButton
            tooltip={collapsed ? 'Changer de compte' : undefined}
            className="cursor-pointer h-9 px-2 sm:px-3 hover:bg-sidebar-accent/70 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Changer de compte</span>}
          </SidebarMenuButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
