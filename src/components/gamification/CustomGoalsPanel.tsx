import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  X, 
  Plus, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Phone,
  MessageSquare,
  Video,
  FileText,
  Users,
  Trash2,
  Edit2,
  Bell,
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'calls' | 'messages' | 'meetings' | 'documents' | 'contacts';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  notifyOnProgress: boolean;
  notifyOnComplete: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface CustomGoalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeConfig = {
  calls: { icon: Phone, label: 'Appels', color: 'text-blue-500', bg: 'bg-blue-500/20' },
  messages: { icon: MessageSquare, label: 'Messages', color: 'text-green-500', bg: 'bg-green-500/20' },
  meetings: { icon: Video, label: 'Réunions', color: 'text-purple-500', bg: 'bg-purple-500/20' },
  documents: { icon: FileText, label: 'Documents', color: 'text-orange-500', bg: 'bg-orange-500/20' },
  contacts: { icon: Users, label: 'Contacts', color: 'text-pink-500', bg: 'bg-pink-500/20' },
};

const periodLabels = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
};

const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'Objectif appels hebdo',
    description: 'Passer au moins 50 appels cette semaine',
    type: 'calls',
    target: 50,
    current: 32,
    period: 'weekly',
    notifyOnProgress: true,
    notifyOnComplete: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Messages quotidiens',
    description: 'Répondre à 20 messages par jour',
    type: 'messages',
    target: 20,
    current: 18,
    period: 'daily',
    notifyOnProgress: false,
    notifyOnComplete: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Réunions mensuelles',
    description: 'Organiser 15 réunions ce mois',
    type: 'meetings',
    target: 15,
    current: 15,
    period: 'monthly',
    notifyOnProgress: true,
    notifyOnComplete: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    completedAt: new Date(),
  },
];

export function CustomGoalsPanel({ isOpen, onClose }: CustomGoalsPanelProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Create form state
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'calls' as Goal['type'],
    target: 10,
    period: 'weekly' as Goal['period'],
    notifyOnProgress: true,
    notifyOnComplete: true,
  });

  const stats = useMemo(() => {
    const completed = goals.filter(g => g.current >= g.target).length;
    const inProgress = goals.filter(g => g.current < g.target).length;
    const avgProgress = goals.length > 0 
      ? Math.round(goals.reduce((acc, g) => acc + Math.min((g.current / g.target) * 100, 100), 0) / goals.length)
      : 0;
    return { completed, inProgress, avgProgress, total: goals.length };
  }, [goals]);

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) {
      toast.error('Veuillez entrer un titre');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      current: 0,
      createdAt: new Date(),
    };

    setGoals([goal, ...goals]);
    setShowCreateDialog(false);
    setNewGoal({
      title: '',
      description: '',
      type: 'calls',
      target: 10,
      period: 'weekly',
      notifyOnProgress: true,
      notifyOnComplete: true,
    });
    toast.success('Objectif créé !');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast.success('Objectif supprimé');
  };

  const handleSimulateProgress = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id && g.current < g.target) {
        const newCurrent = Math.min(g.current + Math.ceil(g.target * 0.1), g.target);
        const isComplete = newCurrent >= g.target;
        
        if (isComplete && g.notifyOnComplete) {
          toast.success(`🎉 Objectif "${g.title}" atteint !`, {
            description: 'Félicitations pour avoir atteint votre objectif !',
          });
        } else if (g.notifyOnProgress && newCurrent >= g.target * 0.5 && g.current < g.target * 0.5) {
          toast.info(`📊 "${g.title}" à 50%`, {
            description: 'Vous êtes à mi-chemin de votre objectif !',
          });
        }

        return {
          ...g,
          current: newCurrent,
          completedAt: isComplete ? new Date() : undefined,
        };
      }
      return g;
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Mes Objectifs</h2>
                <p className="text-sm text-muted-foreground">
                  {stats.completed} complété{stats.completed !== 1 ? 's' : ''} / {stats.total}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateDialog(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvel objectif</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 p-4 sm:p-6 border-b border-border">
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Complétés</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">En cours</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/20">
              <CardContent className="p-3 text-center">
                <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.avgProgress}%</p>
                <p className="text-xs text-muted-foreground">Progression</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals List */}
          <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
            <div className="p-4 sm:p-6 space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Aucun objectif</p>
                  <p className="text-sm">Créez votre premier objectif pour commencer</p>
                </div>
              ) : (
                goals.map((goal, index) => {
                  const config = typeConfig[goal.type];
                  const TypeIcon = config.icon;
                  const progress = Math.min((goal.current / goal.target) * 100, 100);
                  const isComplete = goal.current >= goal.target;

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={cn(
                        "transition-all",
                        isComplete && "border-green-500/50 bg-green-500/5"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
                              <TypeIcon className={cn("w-5 h-5", config.color)} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{goal.title}</h3>
                                {isComplete && (
                                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30 gap-1">
                                    <Award className="w-3 h-3" />
                                    Atteint
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {periodLabels[goal.period]}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {goal.description}
                              </p>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progression</span>
                                  <span className="font-medium">{goal.current} / {goal.target}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                {goal.notifyOnProgress && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Bell className="w-3 h-3" />
                                    Progression
                                  </Badge>
                                )}
                                {goal.notifyOnComplete && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Complétion
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              {!isComplete && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleSimulateProgress(goal.id)}
                                  title="Simuler progression"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteGoal(goal.id)}
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>

        {/* Create Goal Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Nouvel objectif
              </DialogTitle>
              <DialogDescription>
                Définissez un objectif personnalisé avec des notifications
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Ex: Objectif appels hebdomadaires"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Ex: Passer 50 appels cette semaine"
                  value={newGoal.description}
                  onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newGoal.type} onValueChange={v => setNewGoal({ ...newGoal, type: v as Goal['type'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className={cn("w-4 h-4", config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Période</Label>
                  <Select value={newGoal.period} onValueChange={v => setNewGoal({ ...newGoal, period: v as Goal['period'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(periodLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Objectif cible</Label>
                <Input
                  id="target"
                  type="number"
                  min={1}
                  value={newGoal.target}
                  onChange={e => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Notification de progression</Label>
                    <p className="text-xs text-muted-foreground">Recevoir une alerte à 50%</p>
                  </div>
                  <Switch
                    checked={newGoal.notifyOnProgress}
                    onCheckedChange={v => setNewGoal({ ...newGoal, notifyOnProgress: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Notification de complétion</Label>
                    <p className="text-xs text-muted-foreground">Recevoir une alerte à 100%</p>
                  </div>
                  <Switch
                    checked={newGoal.notifyOnComplete}
                    onCheckedChange={v => setNewGoal({ ...newGoal, notifyOnComplete: v })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateGoal} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer l'objectif
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}
