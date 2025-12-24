import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Crown, Target, Trophy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  permission: NotificationPermission;
  settings: {
    challengeExpiring: boolean;
    leaderboardChanges: boolean;
    badgeUnlocked: boolean;
  };
  onRequestPermission: () => Promise<boolean>;
  onUpdateSettings: (settings: Partial<{
    challengeExpiring: boolean;
    leaderboardChanges: boolean;
    badgeUnlocked: boolean;
  }>) => void;
}

export function NotificationSettings({
  isOpen,
  onClose,
  permission,
  settings,
  onRequestPermission,
  onUpdateSettings,
}: NotificationSettingsProps) {
  const [requesting, setRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setRequesting(true);
    await onRequestPermission();
    setRequesting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass rounded-2xl border border-border/50 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                    <p className="text-sm text-muted-foreground">
                      Paramètres de notification
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Permission Status */}
              <div className={cn(
                "p-4 rounded-xl border",
                permission === 'granted' 
                  ? "bg-success/10 border-success/30" 
                  : permission === 'denied'
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-muted/50 border-border/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {permission === 'granted' ? (
                      <Bell className="w-5 h-5 text-success" />
                    ) : (
                      <BellOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {permission === 'granted' 
                          ? 'Notifications activées' 
                          : permission === 'denied'
                          ? 'Notifications bloquées'
                          : 'Notifications désactivées'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {permission === 'granted' 
                          ? 'Vous recevrez des alertes' 
                          : permission === 'denied'
                          ? 'Activez-les dans les paramètres du navigateur'
                          : 'Activez pour ne rien manquer'}
                      </p>
                    </div>
                  </div>
                  
                  {permission !== 'granted' && permission !== 'denied' && (
                    <Button 
                      size="sm" 
                      onClick={handleRequestPermission}
                      disabled={requesting}
                    >
                      {requesting ? 'Activation...' : 'Activer'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Types de notifications
                </h3>

                <div className="space-y-3">
                  {/* Challenge Expiring */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <Label className="font-medium">Défis expirants</Label>
                        <p className="text-xs text-muted-foreground">
                          Alerte 2h avant expiration
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.challengeExpiring}
                      onCheckedChange={(checked) => 
                        onUpdateSettings({ challengeExpiring: checked })
                      }
                      disabled={permission !== 'granted'}
                    />
                  </div>

                  {/* Leaderboard Changes */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <Label className="font-medium">Classement</Label>
                        <p className="text-xs text-muted-foreground">
                          Quand quelqu'un vous dépasse
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.leaderboardChanges}
                      onCheckedChange={(checked) => 
                        onUpdateSettings({ leaderboardChanges: checked })
                      }
                      disabled={permission !== 'granted'}
                    />
                  </div>

                  {/* Badge Unlocked */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <Label className="font-medium">Badges débloqués</Label>
                        <p className="text-xs text-muted-foreground">
                          Nouveaux succès obtenus
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.badgeUnlocked}
                      onCheckedChange={(checked) => 
                        onUpdateSettings({ badgeUnlocked: checked })
                      }
                      disabled={permission !== 'granted'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}