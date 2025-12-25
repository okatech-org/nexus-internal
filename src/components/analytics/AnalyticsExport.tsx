import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Table, 
  X, 
  Calendar,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AnalyticsExportProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    calls: number;
    messages: number;
    meetings: number;
    documents: number;
    period: string;
  };
}

type ExportFormat = 'csv' | 'pdf';
type DataSection = 'summary' | 'calls' | 'messages' | 'meetings' | 'trends';

interface ExportOption {
  id: DataSection;
  label: string;
  description: string;
}

const exportOptions: ExportOption[] = [
  { id: 'summary', label: 'Résumé général', description: 'Vue d\'ensemble des statistiques' },
  { id: 'calls', label: 'Appels', description: 'Détails des appels entrants/sortants' },
  { id: 'messages', label: 'Messages', description: 'Statistiques de messagerie' },
  { id: 'meetings', label: 'Réunions', description: 'Réunions planifiées et effectuées' },
  { id: 'trends', label: 'Tendances', description: 'Évolution sur la période' },
];

export function AnalyticsExport({ isOpen, onClose, data }: AnalyticsExportProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedSections, setSelectedSections] = useState<DataSection[]>(['summary', 'calls', 'messages']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const toggleSection = (section: DataSection) => {
    if (selectedSections.includes(section)) {
      setSelectedSections(selectedSections.filter(s => s !== section));
    } else {
      setSelectedSections([...selectedSections, section]);
    }
  };

  const generateCSV = () => {
    const headers = ['Métrique', 'Valeur', 'Période'];
    const rows = [
      ['Appels totaux', data?.calls?.toString() || '156', data?.period || 'Cette semaine'],
      ['Messages envoyés', data?.messages?.toString() || '342', data?.period || 'Cette semaine'],
      ['Réunions', data?.meetings?.toString() || '12', data?.period || 'Cette semaine'],
      ['Documents traités', data?.documents?.toString() || '28', data?.period || 'Cette semaine'],
    ];

    if (selectedSections.includes('calls')) {
      rows.push(
        ['Appels entrants', '89', data?.period || 'Cette semaine'],
        ['Appels sortants', '67', data?.period || 'Cette semaine'],
        ['Appels manqués', '12', data?.period || 'Cette semaine'],
        ['Durée moyenne', '8:34', data?.period || 'Cette semaine']
      );
    }

    if (selectedSections.includes('messages')) {
      rows.push(
        ['Messages reçus', '187', data?.period || 'Cette semaine'],
        ['Messages envoyés', '155', data?.period || 'Cette semaine'],
        ['Temps de réponse moyen', '12 min', data?.period || 'Cette semaine']
      );
    }

    if (selectedSections.includes('meetings')) {
      rows.push(
        ['Réunions planifiées', '15', data?.period || 'Cette semaine'],
        ['Réunions effectuées', '12', data?.period || 'Cette semaine'],
        ['Participants moyens', '4.2', data?.period || 'Cette semaine']
      );
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  };

  const generatePDFContent = () => {
    // For demo, we'll generate a text-based PDF-like content
    let content = `
RAPPORT ANALYTIQUE
==================
Généré le: ${new Date().toLocaleDateString('fr-FR')}
Période: ${data?.period || 'Cette semaine'}

`;

    if (selectedSections.includes('summary')) {
      content += `
RÉSUMÉ GÉNÉRAL
--------------
• Appels totaux: ${data?.calls || 156}
• Messages: ${data?.messages || 342}
• Réunions: ${data?.meetings || 12}
• Documents: ${data?.documents || 28}
`;
    }

    if (selectedSections.includes('calls')) {
      content += `
DÉTAIL DES APPELS
-----------------
• Appels entrants: 89
• Appels sortants: 67
• Appels manqués: 12
• Durée moyenne: 8:34
`;
    }

    if (selectedSections.includes('messages')) {
      content += `
STATISTIQUES MESSAGERIE
-----------------------
• Messages reçus: 187
• Messages envoyés: 155
• Temps de réponse moyen: 12 min
`;
    }

    if (selectedSections.includes('meetings')) {
      content += `
RÉUNIONS
--------
• Réunions planifiées: 15
• Réunions effectuées: 12
• Participants moyens: 4.2
`;
    }

    if (selectedSections.includes('trends')) {
      content += `
TENDANCES
---------
• Croissance appels: +12% vs semaine précédente
• Croissance messages: +8% vs semaine précédente
• Taux de participation réunions: 80%
`;
    }

    return content;
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast.error('Sélectionnez au moins une section à exporter');
      return;
    }

    setIsExporting(true);

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        content = generateCSV();
        filename = `rapport-analytique-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = generatePDFContent();
        filename = `rapport-analytique-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      toast.success(`Rapport exporté en ${format.toUpperCase()}`);

      // Reset after 2 seconds
      setTimeout(() => {
        setExportComplete(false);
      }, 2000);

    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Exporter les données</h2>
                <p className="text-sm text-muted-foreground">Choisissez le format et les données</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Format d'export</Label>
              <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)} className="grid grid-cols-2 gap-3">
                <Label
                  htmlFor="csv"
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    format === 'csv' 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value="csv" id="csv" />
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">CSV</p>
                      <p className="text-xs text-muted-foreground">Pour Excel/Sheets</p>
                    </div>
                  </div>
                </Label>
                <Label
                  htmlFor="pdf"
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    format === 'pdf' 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value="pdf" id="pdf" />
                  <div className="flex items-center gap-2">
                    <File className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Rapport</p>
                      <p className="text-xs text-muted-foreground">Format texte</p>
                    </div>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Data Sections */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Données à inclure</Label>
              <div className="space-y-2">
                {exportOptions.map(option => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedSections.includes(option.id)
                        ? "border-primary/50 bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    )}
                    onClick={() => toggleSection(option.id)}
                  >
                    <Checkbox
                      checked={selectedSections.includes(option.id)}
                      onCheckedChange={() => toggleSection(option.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Période: <span className="font-medium text-foreground">{data?.period || 'Cette semaine'}</span>
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || selectedSections.length === 0}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Export en cours...
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Exporté !
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exporter en {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
