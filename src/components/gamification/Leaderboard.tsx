import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Users, Star, ChevronRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  level: number;
  badges_count: number;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
  rank: number;
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const rankConfig = [
  { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-500/20' },
  { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/20' },
];

export function Leaderboard({ isOpen, onClose, currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Fetch stats with profiles
        const { data: stats, error: statsError } = await supabase
          .from('user_gamification_stats')
          .select('user_id, total_points, level')
          .order('total_points', { ascending: false })
          .limit(50);

        if (statsError) throw statsError;

        if (!stats || stats.length === 0) {
          setEntries([]);
          setLoading(false);
          return;
        }

        // Fetch profiles
        const userIds = stats.map(s => s.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, email')
          .in('id', userIds);

        // Fetch badge counts
        const { data: badgeCounts } = await supabase
          .from('user_badges')
          .select('user_id')
          .in('user_id', userIds);

        const badgeCountMap: Record<string, number> = {};
        badgeCounts?.forEach(b => {
          badgeCountMap[b.user_id] = (badgeCountMap[b.user_id] || 0) + 1;
        });

        const profileMap = new Map(profiles?.map(p => [p.id, p]));

        const leaderboard: LeaderboardEntry[] = stats.map((stat, index) => ({
          user_id: stat.user_id,
          total_points: stat.total_points,
          level: stat.level,
          badges_count: badgeCountMap[stat.user_id] || 0,
          profile: profileMap.get(stat.user_id) || null,
          rank: index + 1,
        }));

        setEntries(leaderboard);

        // Find current user's rank
        if (currentUserId) {
          const userEntry = leaderboard.find(e => e.user_id === currentUserId);
          setUserRank(userEntry?.rank || null);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen, currentUserId]);

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass border-l border-border/50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Classement</h2>
                    <p className="text-sm text-muted-foreground">
                      {entries.length} participants
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* User rank highlight */}
              {userRank && (
                <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Votre classement</span>
                    <span className="font-bold text-primary">#{userRank}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Aucun participant</h3>
                  <p className="text-sm text-muted-foreground">
                    Soyez le premier à rejoindre le classement !
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {entries.map((entry, index) => {
                    const isCurrentUser = entry.user_id === currentUserId;
                    const isTopThree = index < 3;
                    const RankIcon = isTopThree ? rankConfig[index].icon : null;

                    return (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-4 rounded-xl transition-colors",
                          isCurrentUser 
                            ? "bg-primary/10 border border-primary/30" 
                            : "bg-background/50 hover:bg-background/80"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                            isTopThree 
                              ? rankConfig[index].bg 
                              : "bg-muted"
                          )}>
                            {RankIcon ? (
                              <RankIcon className={cn("w-5 h-5", rankConfig[index].color)} />
                            ) : (
                              <span className="text-muted-foreground">{entry.rank}</span>
                            )}
                          </div>

                          {/* Avatar */}
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={entry.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(entry.profile?.full_name, entry.profile?.email)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground truncate">
                                {entry.profile?.full_name || entry.profile?.email?.split('@')[0] || 'Utilisateur'}
                              </h4>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">Vous</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Niv. {entry.level}
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {entry.badges_count} badges
                              </span>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-right">
                            <span className="font-bold text-foreground">
                              {entry.total_points.toLocaleString()}
                            </span>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}