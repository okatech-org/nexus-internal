import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Phone, 
  MessageCircle, 
  Calendar, 
  AlertTriangle,
  Trophy,
  Clock,
  Settings,
  Moon,
  Volume2,
  VolumeX,
  Vibrate,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePushNotifications, PushNotification } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    permission,
    preferences,
    notifications,
    unreadCount,
    isQuietHours,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearAll,
    updatePreferences,
  } = usePushNotifications();

  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');

  const getNotificationIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'missed_call':
        return <Phone className="w-4 h-4 text-orange-500" />;
      case 'unread_message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'meeting_reminder':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'urgent_thread':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'badge_unlock':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'challenge_expiring':
        return <Clock className="w-4 h-4 text-cyan-500" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: PushNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'normal':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-400';
    }
  };

  const groupedNotifications = {
    today: notifications.filter(n => {
      const today = new Date();
      return n.timestamp.toDateString() === today.toDateString();
    }),
    yesterday: notifications.filter(n => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return n.timestamp.toDateString() === yesterday.toDateString();
    }),
    older: notifications.filter(n => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return n.timestamp < yesterday;
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Centre de notifications</h2>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
                    {isQuietHours && ' · Mode silencieux'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Permission banner */}
            {permission !== 'granted' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="m-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <div className="flex items-start gap-3">
                  <BellOff className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      Notifications désactivées
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Activez les notifications pour recevoir des alertes en temps réel
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={requestPermission}
                      className="mt-2 h-7 text-xs border-amber-500/30 hover:bg-amber-500/10"
                    >
                      Activer les notifications
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="notifications" className="flex-1 gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </TabsTrigger>
              </TabsList>

              <TabsContent value="notifications" className="flex-1 flex flex-col mt-0 p-0">
                {/* Actions bar */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 flex items-center justify-between border-b border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="h-7 text-xs gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tout marquer comme lu
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Tout effacer
                    </Button>
                  </div>
                )}

                {/* Notifications list */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">Aucune notification</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Les nouvelles notifications apparaîtront ici
                        </p>
                      </div>
                    ) : (
                      <>
                        {groupedNotifications.today.length > 0 && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Aujourd'hui
                            </h3>
                            <div className="space-y-2">
                              {groupedNotifications.today.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkRead={markAsRead}
                                  getIcon={getNotificationIcon}
                                  getPriorityColor={getPriorityColor}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groupedNotifications.yesterday.length > 0 && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Hier
                            </h3>
                            <div className="space-y-2">
                              {groupedNotifications.yesterday.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkRead={markAsRead}
                                  getIcon={getNotificationIcon}
                                  getPriorityColor={getPriorityColor}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groupedNotifications.older.length > 0 && (
                          <div>
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Plus ancien
                            </h3>
                            <div className="space-y-2">
                              {groupedNotifications.older.map((notification) => (
                                <NotificationItem
                                  key={notification.id}
                                  notification={notification}
                                  onMarkRead={markAsRead}
                                  getIcon={getNotificationIcon}
                                  getPriorityColor={getPriorityColor}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="flex-1 mt-0 p-0">
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-6">
                    {/* Sound & Vibration */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Son et vibration</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {preferences.soundEnabled ? (
                              <Volume2 className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <VolumeX className="w-4 h-4 text-muted-foreground" />
                            )}
                            <Label htmlFor="sound">Son des notifications</Label>
                          </div>
                          <Switch
                            id="sound"
                            checked={preferences.soundEnabled}
                            onCheckedChange={(checked) => updatePreferences({ soundEnabled: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Vibrate className="w-4 h-4 text-muted-foreground" />
                            <Label htmlFor="vibration">Vibration</Label>
                          </div>
                          <Switch
                            id="vibration"
                            checked={preferences.vibrationEnabled}
                            onCheckedChange={(checked) => updatePreferences({ vibrationEnabled: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Heures de silence</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-muted-foreground" />
                            <Label htmlFor="quiet-hours">Mode silencieux</Label>
                          </div>
                          <Switch
                            id="quiet-hours"
                            checked={preferences.quietHoursEnabled}
                            onCheckedChange={(checked) => updatePreferences({ quietHoursEnabled: checked })}
                          />
                        </div>
                        {preferences.quietHoursEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-2 pl-6"
                          >
                            <Input
                              type="time"
                              value={preferences.quietHoursStart}
                              onChange={(e) => updatePreferences({ quietHoursStart: e.target.value })}
                              className="w-28 h-8 text-sm"
                            />
                            <span className="text-sm text-muted-foreground">à</span>
                            <Input
                              type="time"
                              value={preferences.quietHoursEnd}
                              onChange={(e) => updatePreferences({ quietHoursEnd: e.target.value })}
                              className="w-28 h-8 text-sm"
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Notification Types */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Types de notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-orange-500" />
                            <Label htmlFor="missed-calls">Appels manqués</Label>
                          </div>
                          <Switch
                            id="missed-calls"
                            checked={preferences.missedCalls}
                            onCheckedChange={(checked) => updatePreferences({ missedCalls: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <Label htmlFor="unread-messages">Messages non lus</Label>
                          </div>
                          <Switch
                            id="unread-messages"
                            checked={preferences.unreadMessages}
                            onCheckedChange={(checked) => updatePreferences({ unreadMessages: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            <Label htmlFor="meeting-reminders">Rappels de réunion</Label>
                          </div>
                          <Switch
                            id="meeting-reminders"
                            checked={preferences.meetingReminders}
                            onCheckedChange={(checked) => updatePreferences({ meetingReminders: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <Label htmlFor="urgent-threads">Threads urgents</Label>
                          </div>
                          <Switch
                            id="urgent-threads"
                            checked={preferences.urgentThreads}
                            onCheckedChange={(checked) => updatePreferences({ urgentThreads: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <Label htmlFor="badge-unlocks">Badges débloqués</Label>
                          </div>
                          <Switch
                            id="badge-unlocks"
                            checked={preferences.badgeUnlocks}
                            onCheckedChange={(checked) => updatePreferences({ badgeUnlocks: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-500" />
                            <Label htmlFor="challenge-expiring">Défis expirant</Label>
                          </div>
                          <Switch
                            id="challenge-expiring"
                            checked={preferences.challengeExpiring}
                            onCheckedChange={(checked) => updatePreferences({ challengeExpiring: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Notification item component
interface NotificationItemProps {
  notification: PushNotification;
  onMarkRead: (id: string) => void;
  getIcon: (type: PushNotification['type']) => React.ReactNode;
  getPriorityColor: (priority: PushNotification['priority']) => string;
}

function NotificationItem({ notification, onMarkRead, getIcon, getPriorityColor }: NotificationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-3 rounded-lg border-l-4 transition-all cursor-pointer",
        notification.read 
          ? "bg-muted/30 border-l-muted" 
          : cn("bg-card border border-border shadow-sm", getPriorityColor(notification.priority)),
        !notification.read && "hover:bg-muted/50"
      )}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          notification.read ? "bg-muted" : "bg-primary/10"
        )}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-sm truncate",
              notification.read ? "text-muted-foreground" : "font-medium text-foreground"
            )}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.body}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
