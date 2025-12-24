import { useState, useEffect, useCallback } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, RotateCcw, X, ChevronRight } from 'lucide-react';

interface WalkthroughStep {
  profileId: string;
  title: string;
  description: string;
  highlights: string[];
  duration: number;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    profileId: 'platform_admin_okatech',
    title: 'Platform Administrator',
    description: 'Full platform access with the ability to manage all apps, networks, and modules across tenants.',
    highlights: [
      'Can view and modify all tenant configurations',
      'Access to Platform Admin Console',
      'All modules enabled by default',
    ],
    duration: 8,
  },
  {
    profileId: 'tenant_admin_ministry',
    title: 'Tenant Administrator',
    description: 'Tenant-level admin for Ministry with control over apps and modules within their organization.',
    highlights: [
      'Manages apps within ministry-1 tenant',
      'Access to Tenant Admin Console',
      'Government network access',
    ],
    duration: 8,
  },
  {
    profileId: 'service_gov_app',
    title: 'Government App Service',
    description: 'Service account for a government application with full module access including iCorrespondance.',
    highlights: [
      'All modules enabled including iCorrespondance',
      'Government realm and network',
      'No actor delegation',
    ],
    duration: 8,
  },
  {
    profileId: 'service_mairie_app',
    title: 'Commercial App Service',
    description: 'Service account for a commercial application. Notice iCorrespondance is disabled due to network restrictions.',
    highlights: [
      'iCorrespondance disabled (NOT_IN_GOV_NETWORK)',
      'Commercial network type',
      'Business realm restrictions apply',
    ],
    duration: 8,
  },
  {
    profileId: 'delegated_gov_agent',
    title: 'Delegated Government Agent',
    description: 'An agent accessing via a government app with delegated permissions. Has actor_id for audit trails.',
    highlights: [
      'Delegated mode with actor_id',
      'Full government access',
      'Actions tracked to specific agent',
    ],
    duration: 8,
  },
  {
    profileId: 'delegated_citizen_via_idn',
    title: 'Delegated Citizen Access',
    description: 'A citizen accessing via a client app (like idn.ga). Limited modules due to commercial network.',
    highlights: [
      'Citizen realm with delegated access',
      'iCorrespondance disabled (REALM_NOT_GOV)',
      'actor_id enables citizen tracking',
    ],
    duration: 8,
  },
];

interface DemoWalkthroughProps {
  onClose: () => void;
}

export function DemoWalkthrough({ onClose }: DemoWalkthroughProps) {
  const { switchProfile, demoAccounts, customProfiles, effectiveModules } = useDemo();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const allProfiles = [...demoAccounts, ...customProfiles];
  const currentWalkthrough = walkthroughSteps[currentStep];
  const totalSteps = walkthroughSteps.length;

  const goToStep = useCallback((stepIndex: number) => {
    const step = walkthroughSteps[stepIndex];
    const profile = allProfiles.find(p => p.id === step.profileId);
    if (profile) {
      switchProfile(profile.id);
      setCurrentStep(stepIndex);
      setProgress(0);
    }
  }, [allProfiles, switchProfile]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    } else {
      setIsPlaying(false);
      setProgress(100);
    }
  }, [currentStep, totalSteps, goToStep]);

  const restart = useCallback(() => {
    goToStep(0);
    setIsPlaying(true);
  }, [goToStep]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return;

    const duration = currentWalkthrough.duration * 1000;
    const interval = 100;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStep();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, currentWalkthrough.duration, nextStep]);

  // Start walkthrough on mount
  useEffect(() => {
    goToStep(0);
    setIsPlaying(true);
  }, []);

  return (
    <Card className="border-primary/20 bg-card/95 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Guided Walkthrough</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} / {totalSteps}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={((currentStep) / totalSteps) * 100 + (progress / totalSteps)} className="h-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Step Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-primary">{currentWalkthrough.title}</h3>
          <p className="text-sm text-muted-foreground">{currentWalkthrough.description}</p>
        </div>

        {/* Highlights */}
        <div className="space-y-1">
          {currentWalkthrough.highlights.map((highlight, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>

        {/* Effective Modules Display */}
        <div className="flex flex-wrap gap-1">
          {effectiveModules.map(mod => (
            <Badge
              key={mod.name}
              variant={mod.enabled ? 'default' : 'outline'}
              className={`text-xs ${!mod.enabled ? 'opacity-50' : ''}`}
            >
              {mod.name}
              {mod.disabled_reason && (
                <span className="ml-1 text-[10px] opacity-70">({mod.disabled_reason})</span>
              )}
            </Badge>
          ))}
        </div>

        {/* Step Progress */}
        <div className="pt-2">
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextStep}
              disabled={currentStep >= totalSteps - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={restart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="flex gap-1">
            {walkthroughSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => { goToStep(i); setIsPlaying(false); }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
