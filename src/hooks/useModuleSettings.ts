/**
 * useModuleSettings Hook
 * Manages module settings with real-time updates from Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';

export interface ModuleSetting {
  id: string;
  application_id: string;
  module_name: string;
  enabled: boolean;
  settings: unknown;
  updated_at: string;
}

interface UseModuleSettingsOptions {
  applicationId?: string;
}

export function useModuleSettings({ applicationId }: UseModuleSettingsOptions = {}) {
  const [settings, setSettings] = useState<ModuleSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch module settings
  const fetchSettings = useCallback(async () => {
    if (!applicationId) {
      setSettings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('module_settings')
        .select('*')
        .eq('application_id', applicationId)
        .order('module_name');

      if (fetchError) throw fetchError;
      
      setSettings((data || []) as ModuleSetting[]);
    } catch (err) {
      console.error('Error fetching module settings:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // Toggle module enabled state
  const toggleModule = useCallback(async (moduleId: string, enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('module_settings')
        .update({ 
          enabled, 
          updated_by: user?.id 
        })
        .eq('id', moduleId);

      if (updateError) throw updateError;

      // Optimistic update
      setSettings(prev => 
        prev.map(s => s.id === moduleId ? { ...s, enabled } : s)
      );

      toast.success(`Module ${enabled ? 'activé' : 'désactivé'}`);
    } catch (err) {
      console.error('Error toggling module:', err);
      toast.error('Erreur lors de la mise à jour du module');
      // Revert optimistic update
      fetchSettings();
    }
  }, [fetchSettings]);

  // Update module settings
  const updateModuleSettings = useCallback(async (
    moduleId: string, 
    newSettings: Json
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: updateError } = await supabase
        .from('module_settings')
        .update({ 
          settings: newSettings,
          updated_by: user?.id 
        })
        .eq('id', moduleId);

      if (updateError) throw updateError;

      // Optimistic update
      setSettings(prev => 
        prev.map(s => s.id === moduleId ? { ...s, settings: newSettings } : s)
      );

      toast.success('Paramètres mis à jour');
    } catch (err) {
      console.error('Error updating module settings:', err);
      toast.error('Erreur lors de la mise à jour des paramètres');
      fetchSettings();
    }
  }, [fetchSettings]);

  // Get setting for a specific module
  const getModuleSetting = useCallback((moduleName: string) => {
    return settings.find(s => s.module_name === moduleName);
  }, [settings]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Real-time subscription
  useEffect(() => {
    if (!applicationId) return;

    const channel = supabase
      .channel(`module-settings-${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_settings',
          filter: `application_id=eq.${applicationId}`
        },
        (payload: RealtimePostgresChangesPayload<ModuleSetting>) => {
          console.log('Module settings update:', payload);

          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as ModuleSetting;
            setSettings(prev => [...prev, {
              ...newRecord,
              settings: (newRecord.settings as Record<string, unknown>) || {}
            }]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedRecord = payload.new as ModuleSetting;
            setSettings(prev => 
              prev.map(s => s.id === updatedRecord.id ? {
                ...updatedRecord,
                settings: (updatedRecord.settings as Record<string, unknown>) || {}
              } : s)
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedRecord = payload.old as ModuleSetting;
            setSettings(prev => prev.filter(s => s.id !== deletedRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  return {
    settings,
    loading,
    error,
    toggleModule,
    updateModuleSettings,
    getModuleSetting,
    refetch: fetchSettings
  };
}
