import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Layers, 
  ArrowLeft, 
  RefreshCcw, 
  Network,
  MessageCircle,
  Inbox,
  Brain,
  FileText,
  Send,
  Plus,
  Grid3X3,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DemoAccount, EffectiveModule } from '@/types/demo-accounts';
import { ModuleName } from '@/types/comms';
import demoAccountsData from '@/mocks/demo-accounts.mock.json';
import {
  PlatformEvent,
  PlatformMessage,
  PlatformConversation,
  PlatformThread,
  PlatformThreadMessage,
  subscribeToEvents,
  resetStore,
  createConversation,
  sendMessage,
  getConversations,
  getMessages,
  createThread,
  sendThreadMessage,
  getThreads,
  getThreadMessages,
} from '@/lib/mockPlatform/store';

const demoAccounts: DemoAccount[] = demoAccountsData as DemoAccount[];

function calculateEffectiveModules(profile: DemoAccount | null): EffectiveModule[] {
  const modules: ModuleName[] = ['icom', 'iboite', 'iasted', 'icorrespondance'];
  
  if (!profile) {
    return modules.map(name => ({ name, enabled: false, disabled_reason: 'NO_PROFILE' }));
  }
  
  return modules.map(name => {
    const desired = profile.desired_modules[name];
    if (!desired) {
      return { name, enabled: false, disabled_reason: 'MODULE_DISABLED' };
    }
    
    // iCorrespondance special rules
    if (name === 'icorrespondance') {
      if (profile.network_type !== 'government') {
        return { name, enabled: false, disabled_reason: 'NOT_IN_GOV_NETWORK' };
      }
      if (profile.realm !== 'government' && profile.realm !== 'platform') {
        return { name, enabled: false, disabled_reason: 'REALM_NOT_GOV' };
      }
    }
    
    return { name, enabled: true };
  });
}

interface AppPanelProps {
  panelId: string;
  title: string;
  profile: DemoAccount | null;
  onProfileChange: (profileId: string) => void;
  otherProfile: DemoAccount | null;
}

function AppPanel({ panelId, title, profile, onProfileChange, otherProfile }: AppPanelProps) {
  // iCom state
  const [conversations, setConversations] = useState<PlatformConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<PlatformMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // iBoîte state
  const [threads, setThreads] = useState<PlatformThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<PlatformThreadMessage[]>([]);
  const [newThreadMessage, setNewThreadMessage] = useState('');
  const [newThreadSubject, setNewThreadSubject] = useState('');
  
  const [activeTab, setActiveTab] = useState('icom');
  
  const effectiveModules = calculateEffectiveModules(profile);
  
  // Subscribe to platform events
  useEffect(() => {
    if (!profile) return;
    
    const unsubscribe = subscribeToEvents(panelId, (event: PlatformEvent) => {
      if (event.tenant_id !== profile.tenant_id && event.tenant_id !== '*') return;
      if (event.network_id !== profile.network && event.network_id !== '*') return;
      
      if (event.type === 'icom.message.created') {
        const msg = event.payload as PlatformMessage;
        if (msg.conversation_id === selectedConversation) {
          setMessages(prev => [...prev, msg]);
        }
      } else if (event.type === 'icom.conversation.created') {
        loadConversations();
      } else if (event.type === 'iboite.message.created') {
        const msg = event.payload as PlatformThreadMessage;
        if (msg.thread_id === selectedThread) {
          setThreadMessages(prev => [...prev, msg]);
        }
      } else if (event.type === 'iboite.thread.created') {
        loadThreads();
      } else if (event.type === 'store.reset') {
        setConversations([]);
        setMessages([]);
        setSelectedConversation(null);
        setThreads([]);
        setThreadMessages([]);
        setSelectedThread(null);
      }
    });
    
    return unsubscribe;
  }, [panelId, profile, selectedConversation, selectedThread]);
  
  // Load conversations when profile changes
  const loadConversations = useCallback(() => {
    if (!profile) return;
    const convs = getConversations(profile.tenant_id, profile.network || '');
    setConversations(convs);
  }, [profile]);
  
  // Load threads when profile changes
  const loadThreads = useCallback(() => {
    if (!profile) return;
    const ths = getThreads(profile.tenant_id, profile.network || '');
    setThreads(ths);
  }, [profile]);
  
  useEffect(() => {
    loadConversations();
    loadThreads();
  }, [loadConversations, loadThreads]);
  
  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setMessages(getMessages(selectedConversation));
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);
  
  // Load thread messages when thread changes
  useEffect(() => {
    if (selectedThread) {
      setThreadMessages(getThreadMessages(selectedThread));
    } else {
      setThreadMessages([]);
    }
  }, [selectedThread]);
  
  const handleCreateConversation = () => {
    if (!profile || !otherProfile) {
      toast.error('Need both apps to be configured in same network');
      return;
    }
    
    if (profile.tenant_id !== otherProfile.tenant_id || profile.network !== otherProfile.network) {
      toast.error('Apps must be in the same tenant and network');
      return;
    }
    
    const conv = createConversation(
      profile.tenant_id,
      profile.network || '',
      [
        { app_id: profile.app_id, actor_id: profile.actor_id },
        { app_id: otherProfile.app_id, actor_id: otherProfile.actor_id },
      ]
    );
    
    setSelectedConversation(conv.id);
    toast.success('Conversation created');
  };
  
  const handleSendMessage = () => {
    if (!profile || !selectedConversation || !newMessage.trim()) return;
    
    sendMessage(
      selectedConversation,
      profile.app_id,
      profile.actor_id,
      newMessage.trim()
    );
    
    setNewMessage('');
  };
  
  const handleCreateThread = () => {
    if (!profile || !otherProfile) {
      toast.error('Need both apps to be configured in same network');
      return;
    }
    
    if (profile.tenant_id !== otherProfile.tenant_id || profile.network !== otherProfile.network) {
      toast.error('Apps must be in the same tenant and network');
      return;
    }
    
    if (!newThreadSubject.trim()) {
      toast.error('Please enter a thread subject');
      return;
    }
    
    const thread = createThread(
      profile.tenant_id,
      profile.network || '',
      newThreadSubject.trim(),
      [
        { app_id: profile.app_id, actor_id: profile.actor_id },
        { app_id: otherProfile.app_id, actor_id: otherProfile.actor_id },
      ],
      profile.app_id
    );
    
    setSelectedThread(thread.id);
    setNewThreadSubject('');
    toast.success('Thread created');
  };
  
  const handleSendThreadMessage = () => {
    if (!profile || !selectedThread || !newThreadMessage.trim()) return;
    
    sendThreadMessage(
      selectedThread,
      profile.app_id,
      profile.actor_id,
      newThreadMessage.trim()
    );
    
    setNewThreadMessage('');
  };
  
  const iComEnabled = effectiveModules.find(m => m.name === 'icom')?.enabled ?? false;
  const iBoiteEnabled = effectiveModules.find(m => m.name === 'iboite')?.enabled ?? false;
  const iCorrespondanceModule = effectiveModules.find(m => m.name === 'icorrespondance');
  
  return (
    <Card className="flex-1 flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Select
            value={profile?.id || ''}
            onValueChange={onProfileChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select profile" />
            </SelectTrigger>
            <SelectContent>
              {demoAccounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Profile Info */}
        {profile && (
          <div className="flex flex-wrap gap-1 mt-2 text-[10px]">
            <Badge variant="outline" className="font-mono">{profile.app_id}</Badge>
            <Badge variant="outline">{profile.tenant_id}</Badge>
            <Badge 
              variant="outline" 
              className={profile.network_type === 'government' ? 'border-blue-500 text-blue-400' : 'border-amber-500 text-amber-400'}
            >
              {profile.network_type}
            </Badge>
            <Badge variant="outline">{profile.realm}</Badge>
            <Badge 
              variant="outline" 
              className={profile.mode === 'delegated' ? 'border-purple-500 text-purple-400' : 'border-emerald-500 text-emerald-400'}
            >
              {profile.mode}
            </Badge>
            {profile.actor_id && (
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                actor: {profile.actor_id}
              </Badge>
            )}
          </div>
        )}
        
        {/* Effective Modules */}
        <div className="flex gap-1 mt-2">
          {effectiveModules.map(mod => (
            <Badge
              key={mod.name}
              variant={mod.enabled ? 'default' : 'outline'}
              className={cn(
                "text-[10px]",
                !mod.enabled && "opacity-50"
              )}
              title={mod.disabled_reason}
            >
              {mod.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mb-2 shrink-0">
            <TabsTrigger value="icom" disabled={!iComEnabled}>
              <MessageCircle className="w-3 h-3 mr-1" />
              iCom
            </TabsTrigger>
            <TabsTrigger value="iboite" disabled={!iBoiteEnabled}>
              <Inbox className="w-3 h-3 mr-1" />
              iBoîte
            </TabsTrigger>
            <TabsTrigger value="iasted">
              <Brain className="w-3 h-3 mr-1" />
              iAsted
            </TabsTrigger>
            {iCorrespondanceModule?.enabled && (
              <TabsTrigger value="icorrespondance">
                <FileText className="w-3 h-3 mr-1" />
                iCorr
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="icom" className="flex-1 flex flex-col m-0 px-4 pb-4 overflow-hidden">
            {iComEnabled ? (
              <>
                {/* Conversations List */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Conversations</span>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={handleCreateConversation}
                    disabled={!otherProfile}
                    title="Create conversation with other app"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                {conversations.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                    No conversations. Click + to start one.
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                      {conversations.map(conv => (
                        <Button
                          key={conv.id}
                          variant={selectedConversation === conv.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedConversation(conv.id)}
                          className="shrink-0 text-xs"
                        >
                          {conv.id.slice(0, 12)}...
                        </Button>
                      ))}
                    </div>
                    
                    {/* Messages */}
                    <ScrollArea className="flex-1 border rounded-lg p-2 mb-2">
                      {messages.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No messages yet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {messages.map(msg => {
                            const isOwn = msg.sender_app_id === profile?.app_id;
                            return (
                              <div
                                key={msg.id}
                                className={cn(
                                  "text-xs p-2 rounded-lg max-w-[80%]",
                                  isOwn 
                                    ? "bg-primary/20 ml-auto text-right" 
                                    : "bg-secondary"
                                )}
                              >
                                <div className="font-mono text-[10px] text-muted-foreground mb-0.5">
                                  {msg.sender_app_id}
                                  {msg.sender_actor_id && ` (${msg.sender_actor_id})`}
                                </div>
                                <div>{msg.content}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                    
                    {/* Input */}
                    {selectedConversation && (
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="text-sm"
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button size="icon" onClick={handleSendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                iCom disabled for this profile
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="iboite" className="flex-1 flex flex-col m-0 px-4 pb-4 overflow-hidden">
            {iBoiteEnabled ? (
              <>
                {/* Create Thread */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Threads</span>
                  <div className="flex-1 flex gap-1">
                    <Input
                      value={newThreadSubject}
                      onChange={e => setNewThreadSubject(e.target.value)}
                      placeholder="New thread subject..."
                      className="text-xs h-7"
                      onKeyDown={e => e.key === 'Enter' && handleCreateThread()}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={handleCreateThread}
                      disabled={!otherProfile || !newThreadSubject.trim()}
                      title="Create thread with other app"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {threads.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                    No threads. Enter a subject and click + to start one.
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                      {threads.map(thread => (
                        <Button
                          key={thread.id}
                          variant={selectedThread === thread.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedThread(thread.id)}
                          className="shrink-0 text-xs"
                          title={thread.subject}
                        >
                          {thread.subject.slice(0, 15)}{thread.subject.length > 15 ? '...' : ''}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Thread Messages */}
                    <ScrollArea className="flex-1 border rounded-lg p-2 mb-2">
                      {threadMessages.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No messages yet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {threadMessages.map(msg => {
                            const isOwn = msg.sender_app_id === profile?.app_id;
                            return (
                              <div
                                key={msg.id}
                                className={cn(
                                  "text-xs p-2 rounded-lg max-w-[80%]",
                                  isOwn 
                                    ? "bg-primary/20 ml-auto text-right" 
                                    : "bg-secondary"
                                )}
                              >
                                <div className="font-mono text-[10px] text-muted-foreground mb-0.5">
                                  {msg.sender_app_id}
                                  {msg.sender_actor_id && ` (${msg.sender_actor_id})`}
                                </div>
                                <div>{msg.content}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                    
                    {/* Input */}
                    {selectedThread && (
                      <div className="flex gap-2">
                        <Input
                          value={newThreadMessage}
                          onChange={e => setNewThreadMessage(e.target.value)}
                          placeholder="Reply to thread..."
                          className="text-sm"
                          onKeyDown={e => e.key === 'Enter' && handleSendThreadMessage()}
                        />
                        <Button size="icon" onClick={handleSendThreadMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                iBoîte disabled for this profile
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="iasted" className="flex-1 m-0 px-4 pb-4">
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              iAsted simulation coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="icorrespondance" className="flex-1 m-0 px-4 pb-4">
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              iCorrespondance (Government only)
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Policies Matrix Component
const REALMS = ['government', 'business', 'citizen', 'platform'] as const;
const NETWORK_TYPES = ['government', 'commercial'] as const;

interface PolicyRule {
  allowed: boolean;
  modules: string[];
  note?: string;
}

// Policy matrix: [sourceRealm][targetRealm][networkType] -> PolicyRule
function getPolicyRule(sourceRealm: string, targetRealm: string, networkType: string): PolicyRule {
  // Government network rules
  if (networkType === 'government') {
    // Platform admin can communicate with all
    if (sourceRealm === 'platform' || targetRealm === 'platform') {
      return { allowed: true, modules: ['iCom', 'iBoîte', 'iAsted', 'iCorr'] };
    }
    // Government ↔ Government: full access
    if (sourceRealm === 'government' && targetRealm === 'government') {
      return { allowed: true, modules: ['iCom', 'iBoîte', 'iAsted', 'iCorr'] };
    }
    // Government ↔ Business: limited
    if ((sourceRealm === 'government' && targetRealm === 'business') ||
        (sourceRealm === 'business' && targetRealm === 'government')) {
      return { allowed: true, modules: ['iCom', 'iBoîte'], note: 'No iCorrespondance' };
    }
    // Government ↔ Citizen: public services
    if ((sourceRealm === 'government' && targetRealm === 'citizen') ||
        (sourceRealm === 'citizen' && targetRealm === 'government')) {
      return { allowed: true, modules: ['iCom', 'iBoîte', 'iCorr'], note: 'Public services' };
    }
    // Business ↔ Business on gov network: not typical
    if (sourceRealm === 'business' && targetRealm === 'business') {
      return { allowed: false, modules: [], note: 'Use commercial network' };
    }
    // Citizen ↔ Citizen: not allowed on gov network
    if (sourceRealm === 'citizen' && targetRealm === 'citizen') {
      return { allowed: false, modules: [], note: 'P2P not allowed' };
    }
    // Citizen ↔ Business: not on gov network
    if ((sourceRealm === 'citizen' && targetRealm === 'business') ||
        (sourceRealm === 'business' && targetRealm === 'citizen')) {
      return { allowed: false, modules: [], note: 'Use commercial network' };
    }
  }
  
  // Commercial network rules
  if (networkType === 'commercial') {
    // Platform admin can communicate with all
    if (sourceRealm === 'platform' || targetRealm === 'platform') {
      return { allowed: true, modules: ['iCom', 'iBoîte', 'iAsted'], note: 'No iCorr on commercial' };
    }
    // No iCorrespondance on commercial
    // Business ↔ Business: full commercial access
    if (sourceRealm === 'business' && targetRealm === 'business') {
      return { allowed: true, modules: ['iCom', 'iBoîte', 'iAsted'] };
    }
    // Business ↔ Citizen: customer service
    if ((sourceRealm === 'business' && targetRealm === 'citizen') ||
        (sourceRealm === 'citizen' && targetRealm === 'business')) {
      return { allowed: true, modules: ['iCom', 'iBoîte'], note: 'Customer service' };
    }
    // Citizen ↔ Citizen: limited P2P
    if (sourceRealm === 'citizen' && targetRealm === 'citizen') {
      return { allowed: true, modules: ['iCom'], note: 'P2P messaging only' };
    }
    // Government on commercial: typically not present
    if (sourceRealm === 'government' || targetRealm === 'government') {
      return { allowed: false, modules: [], note: 'Gov uses gov network' };
    }
  }
  
  return { allowed: false, modules: [] };
}

function PoliciesMatrix() {
  return (
    <Card className="shrink-0">
      <CardHeader className="py-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm">Realm Communication Policies</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          {NETWORK_TYPES.map(networkType => (
            <div key={networkType} className="space-y-2">
              <div className={cn(
                "text-xs font-medium px-2 py-1 rounded text-center",
                networkType === 'government' 
                  ? "bg-blue-500/20 text-blue-400" 
                  : "bg-amber-500/20 text-amber-400"
              )}>
                {networkType.charAt(0).toUpperCase() + networkType.slice(1)} Network
              </div>
              
              <div className="text-[10px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 text-left text-muted-foreground">From \ To</th>
                      {REALMS.map(realm => (
                        <th key={realm} className="p-1 text-center text-muted-foreground">
                          {realm.slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {REALMS.map(sourceRealm => (
                      <tr key={sourceRealm}>
                        <td className="p-1 font-medium">{sourceRealm.slice(0, 3)}</td>
                        {REALMS.map(targetRealm => {
                          const rule = getPolicyRule(sourceRealm, targetRealm, networkType);
                          return (
                            <td 
                              key={targetRealm} 
                              className="p-1 text-center"
                              title={rule.note || rule.modules.join(', ')}
                            >
                              {rule.allowed ? (
                                <div className="flex flex-col items-center">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-[8px] text-muted-foreground">
                                    {rule.modules.length}
                                  </span>
                                </div>
                              ) : (
                                <X className="w-3 h-3 text-destructive mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Allowed (hover for modules)</span>
          </div>
          <div className="flex items-center gap-1">
            <X className="w-3 h-3 text-destructive" />
            <span>Not allowed</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>iCorr = Government only</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Simulator() {
  const [app1Profile, setApp1Profile] = useState<DemoAccount | null>(null);
  const [app2Profile, setApp2Profile] = useState<DemoAccount | null>(null);
  const [showPolicies, setShowPolicies] = useState(false);
  
  const handleSetBothToNetwork = (networkType: 'government' | 'commercial') => {
    const govProfiles = demoAccounts.filter(a => a.network_type === networkType);
    if (govProfiles.length >= 2) {
      setApp1Profile(govProfiles[0]);
      setApp2Profile(govProfiles[1]);
      toast.success(`Both apps set to ${networkType} network`);
    } else if (govProfiles.length === 1) {
      setApp1Profile(govProfiles[0]);
      setApp2Profile(govProfiles[0]);
      toast.info(`Only one ${networkType} profile available`);
    }
  };
  
  const handleResetData = () => {
    resetStore();
    toast.success('Platform data reset');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Multi-App Simulator</h1>
                <p className="text-xs text-muted-foreground">Side-by-side app communication</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={showPolicies ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPolicies(!showPolicies)}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Policies
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSetBothToNetwork('government')}
              >
                <Network className="w-4 h-4 mr-2" />
                Both to Gov
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSetBothToNetwork('commercial')}
              >
                <Network className="w-4 h-4 mr-2" />
                Both to Commercial
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleResetData}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Policies Matrix */}
      {showPolicies && (
        <div className="container mx-auto px-6 pt-4">
          <PoliciesMatrix />
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6 flex gap-6 overflow-hidden">
        <AppPanel
          panelId="app1"
          title="Client App #1"
          profile={app1Profile}
          onProfileChange={(id) => setApp1Profile(demoAccounts.find(a => a.id === id) || null)}
          otherProfile={app2Profile}
        />
        
        <AppPanel
          panelId="app2"
          title="Client App #2"
          profile={app2Profile}
          onProfileChange={(id) => setApp2Profile(demoAccounts.find(a => a.id === id) || null)}
          otherProfile={app1Profile}
        />
      </main>
    </div>
  );
}
