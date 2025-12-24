import { 
  App, 
  Network, 
  Capabilities, 
  AppContext, 
  ModuleConfig,
  ModuleName,
  DisabledReason,
  Realm 
} from '@/types/comms';
import appsData from '@/mocks/apps.mock.json';
import networksData from '@/mocks/networks.mock.json';

// Type assertions for JSON imports
const mockApps: App[] = appsData as App[];
const mockNetworks: Network[] = networksData as Network[];

// LocalStorage keys
const STORAGE_KEYS = {
  APP_ID: 'comms.app_id',
  TENANT_ID: 'comms.tenant_id',
  NETWORK_ID: 'comms.network_id',
  NETWORK_TYPE: 'comms.network_type',
  MODE: 'comms.mode',
  DELEGATED_ACTOR_ID: 'comms.delegated_actor_id',
  DELEGATED_REALM: 'comms.delegated_realm',
} as const;

// Get all available apps
export function getApps(): App[] {
  return mockApps;
}

// Get all available networks
export function getNetworks(): Network[] {
  return mockNetworks;
}

// Get app by ID
export function getAppById(appId: string): App | undefined {
  return mockApps.find(app => app.app_id === appId);
}

// Get network by ID
export function getNetworkById(networkId: string): Network | undefined {
  return mockNetworks.find(network => network.network_id === networkId);
}

// Get network for an app
export function getNetworkForApp(appId: string): Network | undefined {
  const app = getAppById(appId);
  if (!app) return undefined;
  return getNetworkById(app.network_id);
}

// Load app context from localStorage
export function loadAppContext(): AppContext {
  const stored = {
    app_id: localStorage.getItem(STORAGE_KEYS.APP_ID),
    tenant_id: localStorage.getItem(STORAGE_KEYS.TENANT_ID),
    network_id: localStorage.getItem(STORAGE_KEYS.NETWORK_ID),
    network_type: localStorage.getItem(STORAGE_KEYS.NETWORK_TYPE),
    mode: localStorage.getItem(STORAGE_KEYS.MODE),
    delegated_actor_id: localStorage.getItem(STORAGE_KEYS.DELEGATED_ACTOR_ID),
    delegated_realm: localStorage.getItem(STORAGE_KEYS.DELEGATED_REALM),
  };

  // Default to sandbox-app if nothing stored
  const defaultApp = getAppById('sandbox-app')!;
  const defaultNetwork = getNetworkById(defaultApp.network_id)!;

  return {
    app_id: stored.app_id || defaultApp.app_id,
    tenant_id: stored.tenant_id || defaultApp.tenant_id,
    network_id: stored.network_id || defaultApp.network_id,
    network_type: (stored.network_type as 'commercial' | 'government') || defaultNetwork.network_type,
    mode: (stored.mode as 'service' | 'delegated') || 'service',
    delegated_actor_id: stored.delegated_actor_id || undefined,
    delegated_realm: (stored.delegated_realm as Realm) || undefined,
  };
}

// Save app context to localStorage
export function saveAppContext(context: AppContext): void {
  localStorage.setItem(STORAGE_KEYS.APP_ID, context.app_id);
  localStorage.setItem(STORAGE_KEYS.TENANT_ID, context.tenant_id);
  localStorage.setItem(STORAGE_KEYS.NETWORK_ID, context.network_id);
  localStorage.setItem(STORAGE_KEYS.NETWORK_TYPE, context.network_type);
  localStorage.setItem(STORAGE_KEYS.MODE, context.mode);
  
  if (context.delegated_actor_id) {
    localStorage.setItem(STORAGE_KEYS.DELEGATED_ACTOR_ID, context.delegated_actor_id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.DELEGATED_ACTOR_ID);
  }
  
  if (context.delegated_realm) {
    localStorage.setItem(STORAGE_KEYS.DELEGATED_REALM, context.delegated_realm);
  } else {
    localStorage.removeItem(STORAGE_KEYS.DELEGATED_REALM);
  }
}

// Calculate effective module status
function calculateModuleStatus(
  moduleName: ModuleName,
  app: App,
  network: Network,
  delegatedRealm?: Realm
): ModuleConfig {
  const appEnabled = app.enabled_modules[moduleName];
  const networkPolicy = network.modules_policy[moduleName];
  
  // Base config
  const config: ModuleConfig = {
    enabled: false,
  };

  // Check if app wants this module
  if (!appEnabled) {
    config.disabled_reason = 'MODULE_DISABLED';
    return config;
  }

  // Check network policy
  if (!networkPolicy) {
    config.disabled_reason = 'NETWORK_POLICY';
    return config;
  }

  // Special handling for iCorrespondance - government only
  if (moduleName === 'icorrespondance') {
    // Must be in government network
    if (network.network_type !== 'government') {
      config.disabled_reason = 'NOT_IN_GOV_NETWORK';
      config.realm_required = 'government';
      return config;
    }
    
    // If in delegated mode, realm must be government
    if (delegatedRealm && delegatedRealm !== 'government') {
      config.disabled_reason = 'REALM_NOT_GOV';
      config.realm_required = 'government';
      return config;
    }
    
    config.realm_required = 'government';
  }

  // Module is enabled
  config.enabled = true;
  
  // Add realtime config for iCom
  if (moduleName === 'icom') {
    config.realtime = { sse_url: '/v1/realtime' };
  }

  return config;
}

// Bootstrap capabilities for an app context
export function bootstrapCapabilities(appContext: AppContext): Capabilities | null {
  const app = getAppById(appContext.app_id);
  if (!app) return null;

  const network = getNetworkById(app.network_id);
  if (!network) return null;

  const delegatedRealm = appContext.mode === 'delegated' ? appContext.delegated_realm : undefined;

  return {
    platform: 'okatech-comms',
    version: '1.0',
    tenant_id: app.tenant_id,
    app_id: app.app_id,
    network_id: network.network_id,
    network_type: network.network_type,
    modules: {
      icom: calculateModuleStatus('icom', app, network, delegatedRealm),
      iboite: calculateModuleStatus('iboite', app, network, delegatedRealm),
      iasted: calculateModuleStatus('iasted', app, network, delegatedRealm),
      icorrespondance: calculateModuleStatus('icorrespondance', app, network, delegatedRealm),
    },
  };
}

// Get API headers for requests
export function getApiHeaders(appContext: AppContext): Record<string, string> {
  const headers: Record<string, string> = {
    'X-App-Id': appContext.app_id,
    'X-Dev-Tenant': appContext.tenant_id,
    'X-Dev-Network': appContext.network_id,
    'X-Dev-Network-Type': appContext.network_type,
    'X-Dev-Mode': appContext.mode,
  };

  if (appContext.mode === 'delegated' && appContext.delegated_actor_id) {
    headers['X-Dev-Actor'] = appContext.delegated_actor_id;
  }

  return headers;
}
