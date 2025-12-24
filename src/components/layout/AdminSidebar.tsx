/**
 * Admin Sidebar Component
 * Sidebar navigation for Platform Admin and Tenant Admin spaces
 */

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Crown, 
  AppWindow, 
  Network, 
  Layers, 
  Activity, 
  Settings, 
  Users, 
  Shield,
  Home,
  Building,
  MessageCircle,
  Inbox,
  Bot,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Badge } from '@/components/ui/badge';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useDemo } from '@/contexts/DemoContext';

type AdminType = 'platform' | 'tenant';

interface AdminSidebarProps {
  adminType: AdminType;
}

const PLATFORM_ADMIN_ITEMS = [
  { 
    group: 'main',
    items: [
      { title: 'Tableau de bord', url: '/admin/platform', icon: Home, end: true },
      { title: 'Applications', url: '/admin/platform/apps', icon: AppWindow },
      { title: 'Réseaux', url: '/admin/platform/networks', icon: Network },
      { title: 'Modules', url: '/admin/platform/modules', icon: Layers },
    ]
  },
  {
    group: 'management',
    label: 'Gestion',
    items: [
      { title: 'Tenants', url: '/admin/platform/tenants', icon: Building },
      { title: 'Utilisateurs', url: '/admin/platform/users', icon: Users },
      { title: 'Sécurité', url: '/admin/platform/security', icon: Shield },
    ]
  },
  {
    group: 'monitoring',
    label: 'Monitoring',
    items: [
      { title: 'Audit', url: '/admin/platform/audit', icon: Activity },
      { title: 'Logs', url: '/admin/platform/logs', icon: FileText },
    ]
  },
  {
    group: 'settings',
    label: 'Configuration',
    items: [
      { title: 'Paramètres', url: '/admin/platform/settings', icon: Settings },
    ]
  }
];

const TENANT_ADMIN_ITEMS = [
  { 
    group: 'main',
    items: [
      { title: 'Tableau de bord', url: '/admin/tenant', icon: Home, end: true },
      { title: 'Applications', url: '/admin/tenant/apps', icon: AppWindow },
      { title: 'Modules', url: '/admin/tenant/modules', icon: Layers },
    ]
  },
  {
    group: 'communication',
    label: 'Communication',
    items: [
      { title: 'iCom', url: '/admin/tenant/icom', icon: MessageCircle },
      { title: 'iBoîte', url: '/admin/tenant/iboite', icon: Inbox },
      { title: 'iAsted', url: '/admin/tenant/iasted', icon: Bot },
    ]
  },
  {
    group: 'management',
    label: 'Gestion',
    items: [
      { title: 'Utilisateurs', url: '/admin/tenant/users', icon: Users },
      { title: 'Audit', url: '/admin/tenant/audit', icon: Activity },
    ]
  },
  {
    group: 'settings',
    label: 'Configuration',
    items: [
      { title: 'Paramètres', url: '/admin/tenant/settings', icon: Settings },
    ]
  }
];

export function AdminSidebar({ adminType }: AdminSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  const { activeProfile } = useDemo();
  const collapsed = state === 'collapsed';
  
  const menuItems = adminType === 'platform' ? PLATFORM_ADMIN_ITEMS : TENANT_ADMIN_ITEMS;
  const adminLabel = adminType === 'platform' ? 'Platform Admin' : 'Tenant Admin';
  const adminIcon = adminType === 'platform' ? Crown : Building;
  const AdminIcon = adminIcon;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-xl flex items-center justify-center shrink-0",
            adminType === 'platform' 
              ? "bg-amber-500/20 w-10 h-10" 
              : "bg-primary/20 w-10 h-10"
          )}>
            <AdminIcon className={cn(
              "w-5 h-5",
              adminType === 'platform' ? "text-amber-400" : "text-primary"
            )} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-semibold text-sidebar-foreground truncate">
                {adminLabel}
              </h2>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {activeProfile?.label || 'NDJOBI Platform'}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Navigation */}
      <SidebarContent>
        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={group.group}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item.end 
                    ? location.pathname === item.url 
                    : location.pathname.startsWith(item.url);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={collapsed ? item.title : undefined}
                      >
                        <NavLink 
                          to={item.url} 
                          end={item.end}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-4 py-4">
        {!collapsed && (
          <div className="p-3 rounded-xl bg-sidebar-accent/50">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                activeProfile ? "bg-success" : "bg-muted"
              )} />
              <span className="text-xs font-medium text-sidebar-foreground">
                {activeProfile ? 'Connecté' : 'Non connecté'}
              </span>
            </div>
            {activeProfile && (
              <div className="space-y-1">
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {activeProfile.app_id}
                </p>
                <Badge variant="outline" className="text-[10px]">
                  {activeProfile.network_type}
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <NavLink 
          to="/" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {!collapsed && <span>Retour à l'accueil</span>}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
