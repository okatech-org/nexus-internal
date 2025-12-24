import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { DemoAccount, DemoState, EffectiveModule, AppState, NetworkState } from '@/types/demo-accounts';
import { ModuleName, Realm, NetworkType } from '@/types/comms';
import demoAccountsData from '@/mocks/demo-accounts.mock.json';
import appsData from '@/mocks/apps.mock.json';
import networksData from '@/mocks/networks.mock.json';

const STORAGE_KEY = 'comms.demoProfile';

const demoAccounts: DemoAccount[] = demoAccountsData as DemoAccount[];

interface DemoContextType {
  // State
  activeProfile: DemoAccount | null;
  effectiveModules: EffectiveModule[];
  apps: AppState[];
  networks: NetworkState[];
  demoAccounts: DemoAccount[];
  customProfiles: DemoAccount[];
  
  // Actions
  switchProfile: (profileId: string) => void;
  clearProfile: () => void;
  updateAppModules: (appId: string, modules: Partial<Record<ModuleName, boolean>>) => void;
  updateNetworkPolicy: (networkId: string, modules: Partial<Record<ModuleName, boolean>>) => void;
  addAppToNetwork: (appId: string, networkId: string) => void;
  createCustomProfile: (profile: Omit<DemoAccount, 'id'>) => DemoAccount;
  deleteCustomProfile: (profileId: string) => void;
  resetDemoState: () => void;
  
  // Admin checks
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

function calculateEffectiveModules(
  profile: DemoAccount | null,
  networks: NetworkState[]
): EffectiveModule[] {
  const modules: ModuleName[] = ['icom', 'iboite', 'iasted', 'icorrespondance'];
  
  if (!profile) {
    return modules.map(name => ({ name, enabled: false, disabled_reason: 'NO_PROFILE_SELECTED' }));
  }
  
  const network = networks.find(n => n.network_id === profile.network);
  
  return modules.map(name => {
    // Check desired modules from profile
    const desired = profile.desired_modules[name];
    if (!desired) {
      return { name, enabled: false, disabled_reason: 'MODULE_DISABLED' };
    }
    
    // Check network policy
    if (network && !network.modules_policy[name]) {
      return { name, enabled: false, disabled_reason: 'NETWORK_POLICY' };
    }
    
    // Special iCorrespondance rules
    if (name === 'icorrespondance') {
      // Must be in government network
      if (profile.network_type !== 'government') {
        return { name, enabled: false, disabled_reason: 'NOT_IN_GOV_NETWORK' };
      }
      
      // Realm must be government (or platform for admins)
      if (profile.realm !== 'government' && profile.realm !== 'platform') {
        return { name, enabled: false, disabled_reason: 'REALM_NOT_GOV' };
      }
    }
    
    return { name, enabled: true };
  });
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<DemoAccount | null>(null);
  const [customProfiles, setCustomProfiles] = useState<DemoAccount[]>(() => {
    const stored = localStorage.getItem('comms.customProfiles');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  
  const [apps, setApps] = useState<AppState[]>(() => {
    const stored = localStorage.getItem('comms.demoApps');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return appsData as AppState[];
      }
    }
    return appsData as AppState[];
  });
  
  const [networks, setNetworks] = useState<NetworkState[]>(() => {
    const stored = localStorage.getItem('comms.demoNetworks');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return networksData as NetworkState[];
      }
    }
    return networksData as NetworkState[];
  });
  
  const [effectiveModules, setEffectiveModules] = useState<EffectiveModule[]>([]);
  
  // Combine built-in and custom profiles
  const allProfiles = [...demoAccounts, ...customProfiles];
  
  // Load profile on mount
  useEffect(() => {
    const storedProfileId = localStorage.getItem(STORAGE_KEY);
    if (storedProfileId) {
      const profile = allProfiles.find(p => p.id === storedProfileId);
      if (profile) {
        setActiveProfile(profile);
      }
    }
  }, [customProfiles]);
  
  // Recalculate effective modules when profile or networks change
  useEffect(() => {
    setEffectiveModules(calculateEffectiveModules(activeProfile, networks));
  }, [activeProfile, networks]);
  
  // Persist apps and networks to localStorage
  useEffect(() => {
    localStorage.setItem('comms.demoApps', JSON.stringify(apps));
  }, [apps]);
  
  useEffect(() => {
    localStorage.setItem('comms.demoNetworks', JSON.stringify(networks));
  }, [networks]);
  
  // Persist custom profiles
  useEffect(() => {
    localStorage.setItem('comms.customProfiles', JSON.stringify(customProfiles));
  }, [customProfiles]);
  
  const switchProfile = useCallback((profileId: string) => {
    const profile = allProfiles.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      localStorage.setItem(STORAGE_KEY, profileId);
      
      // Also update the main comms context localStorage
      localStorage.setItem('comms.app_id', profile.app_id);
      localStorage.setItem('comms.tenant_id', profile.tenant_id);
      localStorage.setItem('comms.network_id', profile.network || '');
      localStorage.setItem('comms.network_type', profile.network_type);
      localStorage.setItem('comms.mode', profile.mode === 'delegated' ? 'delegated' : 'service');
      
      if (profile.actor_id) {
        localStorage.setItem('comms.delegated_actor_id', profile.actor_id);
      } else {
        localStorage.removeItem('comms.delegated_actor_id');
      }
      
      if (profile.realm && profile.realm !== 'platform') {
        localStorage.setItem('comms.delegated_realm', profile.realm);
      } else {
        localStorage.removeItem('comms.delegated_realm');
      }
    }
  }, [allProfiles]);
  
  const clearProfile = useCallback(() => {
    setActiveProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  const updateAppModules = useCallback((appId: string, modules: Partial<Record<ModuleName, boolean>>) => {
    setApps(prev => prev.map(app => 
      app.app_id === appId 
        ? { ...app, enabled_modules: { ...app.enabled_modules, ...modules } }
        : app
    ));
  }, []);
  
  const updateNetworkPolicy = useCallback((networkId: string, modules: Partial<Record<ModuleName, boolean>>) => {
    setNetworks(prev => prev.map(network => 
      network.network_id === networkId 
        ? { ...network, modules_policy: { ...network.modules_policy, ...modules } }
        : network
    ));
  }, []);
  
  const addAppToNetwork = useCallback((appId: string, networkId: string) => {
    setNetworks(prev => prev.map(network => 
      network.network_id === networkId 
        ? { ...network, member_apps: [...new Set([...network.member_apps, appId])] }
        : network
    ));
    
    setApps(prev => prev.map(app => 
      app.app_id === appId 
        ? { ...app, network_id: networkId }
        : app
    ));
  }, []);
  
  const createCustomProfile = useCallback((profileData: Omit<DemoAccount, 'id'>): DemoAccount => {
    const newProfile: DemoAccount = {
      ...profileData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setCustomProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, []);
  
  const deleteCustomProfile = useCallback((profileId: string) => {
    setCustomProfiles(prev => prev.filter(p => p.id !== profileId));
    if (activeProfile?.id === profileId) {
      setActiveProfile(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeProfile]);
  
  const resetDemoState = useCallback(() => {
    setActiveProfile(null);
    setCustomProfiles([]);
    setApps(appsData as AppState[]);
    setNetworks(networksData as NetworkState[]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('comms.customProfiles');
    localStorage.removeItem('comms.demoApps');
    localStorage.removeItem('comms.demoNetworks');
  }, []);
  
  const isPlatformAdmin = activeProfile?.mode === 'platform_admin';
  const isTenantAdmin = activeProfile?.mode === 'tenant_admin';
  
  return (
    <DemoContext.Provider
      value={{
        activeProfile,
        effectiveModules,
        apps,
        networks,
        demoAccounts: allProfiles,
        customProfiles,
        switchProfile,
        clearProfile,
        updateAppModules,
        updateNetworkPolicy,
        addAppToNetwork,
        createCustomProfile,
        deleteCustomProfile,
        resetDemoState,
        isPlatformAdmin,
        isTenantAdmin,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
