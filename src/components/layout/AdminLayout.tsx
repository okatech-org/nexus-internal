/**
 * Admin Layout Component
 * Provides sidebar + main content layout for admin dashboards
 */

import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { UserMenu } from './UserMenu';
import { cn } from '@/lib/utils';

type AdminType = 'platform' | 'tenant';

interface AdminLayoutProps {
  children: ReactNode;
  adminType: AdminType;
  title?: string;
  subtitle?: string;
}

export function AdminLayout({ children, adminType, title, subtitle }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar adminType={adminType} />
        
        <SidebarInset>
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-sm px-6">
            <SidebarTrigger className="-ml-2" />
            
            {title && (
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
            
            <UserMenu />
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
