-- Table for user gamification stats
CREATE TABLE public.user_gamification_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  calls_made INTEGER NOT NULL DEFAULT 0,
  meetings_joined INTEGER NOT NULL DEFAULT 0,
  contacts_added INTEGER NOT NULL DEFAULT 0,
  documents_processed INTEGER NOT NULL DEFAULT 0,
  days_active INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Table for user unlocked badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  celebrated BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_gamification_stats
CREATE POLICY "Users can view all stats for leaderboard"
ON public.user_gamification_stats
FOR SELECT
USING (true);

CREATE POLICY "Users can insert own stats"
ON public.user_gamification_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
ON public.user_gamification_stats
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view all badges"
ON public.user_badges
FOR SELECT
USING (true);

CREATE POLICY "Users can insert own badges"
ON public.user_badges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges"
ON public.user_badges
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_gamification_stats_updated_at
BEFORE UPDATE ON public.user_gamification_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for leaderboard queries
CREATE INDEX idx_user_gamification_stats_points ON public.user_gamification_stats(total_points DESC);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);