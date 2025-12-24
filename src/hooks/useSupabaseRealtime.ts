import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeNotification {
  id: string;
  type: 'message' | 'thread' | 'metric' | 'invitation';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export function useSupabaseRealtime(tenantId?: string) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);
    
    toast.info(notification.title, {
      description: notification.description,
      duration: 4000,
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    // Subscribe to usage_metrics changes for real-time stats updates
    const metricsChannel = supabase
      .channel('usage-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'usage_metrics',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ metric_type: string; count: number }>) => {
          const data = payload.new as { metric_type: string; count: number };
          if (data) {
            addNotification({
              type: 'metric',
              title: 'Nouvelle activité',
              description: `${data.metric_type}: +${data.count}`,
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Connected to usage_metrics');
        }
      });

    // Subscribe to invitations for the tenant
    const invitationsChannel = supabase
      .channel('invitations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invitations',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ email: string; role: string }>) => {
          const data = payload.new as { email: string; role: string };
          if (data) {
            addNotification({
              type: 'invitation',
              title: 'Nouvelle invitation envoyée',
              description: `${data.email} a été invité comme ${data.role}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(invitationsChannel);
      setIsConnected(false);
    };
  }, [tenantId, addNotification]);

  return {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
