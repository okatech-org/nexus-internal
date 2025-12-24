import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  FileEdit, 
  ClipboardList, 
  Gavel, 
  Paperclip,
  Search,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Document } from '@/types/correspondance';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: Document['type'];
  icon: typeof FileText;
  category: 'administrative' | 'legal' | 'internal' | 'report';
  content: string;
  variables: TemplateVariable[];
}

interface TemplateVariable {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'date' | 'textarea';
  required: boolean;
}

interface DocumentTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (document: Omit<Document, 'id' | 'case_id' | 'created_at'>) => void;
}

const templates: DocumentTemplate[] = [
  {
    id: 'courrier-officiel',
    name: 'Courrier Officiel',
    description: 'Lettre officielle avec en-tête gouvernemental',
    type: 'courrier',
    icon: FileText,
    category: 'administrative',
    content: `RÉPUBLIQUE FRANÇAISE

Ministère {{ministry}}

Direction {{direction}}

{{city}}, le {{date}}

Référence : {{reference}}

Objet : {{subject}}

Madame, Monsieur,

{{body}}

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

{{signature}}
{{title}}`,
    variables: [
      { key: 'ministry', label: 'Ministère', placeholder: 'de l\'Intérieur', type: 'text', required: true },
      { key: 'direction', label: 'Direction', placeholder: 'Générale des Services', type: 'text', required: true },
      { key: 'city', label: 'Ville', placeholder: 'Paris', type: 'text', required: true },
      { key: 'date', label: 'Date', placeholder: 'JJ/MM/AAAA', type: 'date', required: true },
      { key: 'reference', label: 'Référence', placeholder: 'DGOS/2024/001', type: 'text', required: true },
      { key: 'subject', label: 'Objet', placeholder: 'Demande d\'autorisation', type: 'text', required: true },
      { key: 'body', label: 'Corps du courrier', placeholder: 'Rédigez le contenu de votre courrier...', type: 'textarea', required: true },
      { key: 'signature', label: 'Nom du signataire', placeholder: 'Jean DUPONT', type: 'text', required: true },
      { key: 'title', label: 'Titre du signataire', placeholder: 'Directeur Général', type: 'text', required: true },
    ],
  },
  {
    id: 'note-service',
    name: 'Note de Service',
    description: 'Communication interne aux agents',
    type: 'note',
    icon: FileEdit,
    category: 'internal',
    content: `NOTE DE SERVICE N° {{number}}

Date : {{date}}
Émetteur : {{sender}}
Destinataires : {{recipients}}

Objet : {{subject}}

---

{{body}}

---

Cette note est applicable à compter du {{effective_date}}.

{{signature}}
{{title}}`,
    variables: [
      { key: 'number', label: 'Numéro de note', placeholder: 'NS-2024-001', type: 'text', required: true },
      { key: 'date', label: 'Date', placeholder: 'JJ/MM/AAAA', type: 'date', required: true },
      { key: 'sender', label: 'Émetteur', placeholder: 'Direction des Ressources Humaines', type: 'text', required: true },
      { key: 'recipients', label: 'Destinataires', placeholder: 'Tous les agents', type: 'text', required: true },
      { key: 'subject', label: 'Objet', placeholder: 'Modification des horaires', type: 'text', required: true },
      { key: 'body', label: 'Contenu de la note', placeholder: 'Décrivez les informations à communiquer...', type: 'textarea', required: true },
      { key: 'effective_date', label: 'Date d\'application', placeholder: 'JJ/MM/AAAA', type: 'date', required: true },
      { key: 'signature', label: 'Nom', placeholder: 'Marie MARTIN', type: 'text', required: true },
      { key: 'title', label: 'Fonction', placeholder: 'Directrice RH', type: 'text', required: true },
    ],
  },
  {
    id: 'rapport-activite',
    name: 'Rapport d\'Activité',
    description: 'Rapport périodique avec métriques',
    type: 'rapport',
    icon: ClipboardList,
    category: 'report',
    content: `RAPPORT D'ACTIVITÉ

Période : {{period}}
Service : {{service}}
Rédacteur : {{author}}
Date : {{date}}

═══════════════════════════════════════

I. RÉSUMÉ EXÉCUTIF

{{summary}}

II. ACTIVITÉS PRINCIPALES

{{activities}}

III. INDICATEURS CLÉS

{{metrics}}

IV. DIFFICULTÉS RENCONTRÉES

{{challenges}}

V. PERSPECTIVES

{{outlook}}

═══════════════════════════════════════

Document validé par : {{validator}}
Date de validation : {{validation_date}}`,
    variables: [
      { key: 'period', label: 'Période', placeholder: 'T4 2024', type: 'text', required: true },
      { key: 'service', label: 'Service', placeholder: 'Direction Financière', type: 'text', required: true },
      { key: 'author', label: 'Rédacteur', placeholder: 'Pierre BERNARD', type: 'text', required: true },
      { key: 'date', label: 'Date', placeholder: 'JJ/MM/AAAA', type: 'date', required: true },
      { key: 'summary', label: 'Résumé exécutif', placeholder: 'Synthèse des points clés...', type: 'textarea', required: true },
      { key: 'activities', label: 'Activités principales', placeholder: 'Liste des activités réalisées...', type: 'textarea', required: true },
      { key: 'metrics', label: 'Indicateurs clés', placeholder: 'Métriques et chiffres...', type: 'textarea', required: true },
      { key: 'challenges', label: 'Difficultés', placeholder: 'Problèmes rencontrés...', type: 'textarea', required: false },
      { key: 'outlook', label: 'Perspectives', placeholder: 'Objectifs à venir...', type: 'textarea', required: false },
      { key: 'validator', label: 'Validateur', placeholder: 'Sophie LEROY', type: 'text', required: false },
      { key: 'validation_date', label: 'Date validation', placeholder: 'JJ/MM/AAAA', type: 'date', required: false },
    ],
  },
  {
    id: 'decision-administrative',
    name: 'Décision Administrative',
    description: 'Acte juridique officiel',
    type: 'decision',
    icon: Gavel,
    category: 'legal',
    content: `DÉCISION N° {{number}}

Le {{authority_title}},

Vu {{legal_references}};

Vu {{additional_references}};

Considérant que {{considerations}};

DÉCIDE :

Article 1er
{{article_1}}

Article 2
{{article_2}}

Article 3
La présente décision sera notifiée à {{notified_parties}} et publiée {{publication}}.

Fait à {{city}}, le {{date}}

{{signature}}
{{title}}`,
    variables: [
      { key: 'number', label: 'Numéro de décision', placeholder: 'DEC-2024-001', type: 'text', required: true },
      { key: 'authority_title', label: 'Autorité', placeholder: 'Préfet de la région Île-de-France', type: 'text', required: true },
      { key: 'legal_references', label: 'Références légales', placeholder: 'le Code général des collectivités territoriales', type: 'textarea', required: true },
      { key: 'additional_references', label: 'Références additionnelles', placeholder: 'l\'arrêté du...', type: 'textarea', required: false },
      { key: 'considerations', label: 'Considérants', placeholder: 'les circonstances justifiant la décision...', type: 'textarea', required: true },
      { key: 'article_1', label: 'Article 1', placeholder: 'Dispositions principales...', type: 'textarea', required: true },
      { key: 'article_2', label: 'Article 2', placeholder: 'Dispositions complémentaires...', type: 'textarea', required: false },
      { key: 'notified_parties', label: 'Parties notifiées', placeholder: 'M. X et Mme Y', type: 'text', required: true },
      { key: 'publication', label: 'Publication', placeholder: 'au recueil des actes administratifs', type: 'text', required: true },
      { key: 'city', label: 'Ville', placeholder: 'Paris', type: 'text', required: true },
      { key: 'date', label: 'Date', placeholder: 'JJ/MM/AAAA', type: 'date', required: true },
      { key: 'signature', label: 'Signataire', placeholder: 'Jean PRÉFET', type: 'text', required: true },
      { key: 'title', label: 'Titre', placeholder: 'Préfet', type: 'text', required: true },
    ],
  },
  {
    id: 'bordereau-transmission',
    name: 'Bordereau de Transmission',
    description: 'Accompagnement de pièces jointes',
    type: 'annexe',
    icon: Paperclip,
    category: 'administrative',
    content: `BORDEREAU DE TRANSMISSION

Date : {{date}}
De : {{sender}}
À : {{recipient}}
Référence : {{reference}}

═══════════════════════════════════════

PIÈCES TRANSMISES :

{{documents}}

═══════════════════════════════════════

OBSERVATIONS :

{{observations}}

═══════════════════════════════════════

☐ Pour information
☐ Pour suite à donner
☐ Pour attribution
☐ Pour avis
☐ Pour signature

Transmission effectuée par : {{transmitted_by}}`,
    variables: [
      { key: 'date', label: 'Date', placeholder: 'JJ/MM/AAAA', type: 'date', required: true },
      { key: 'sender', label: 'Expéditeur', placeholder: 'Service des Affaires Générales', type: 'text', required: true },
      { key: 'recipient', label: 'Destinataire', placeholder: 'Direction Financière', type: 'text', required: true },
      { key: 'reference', label: 'Référence', placeholder: 'BT-2024-001', type: 'text', required: true },
      { key: 'documents', label: 'Liste des pièces', placeholder: '1. Document A\n2. Document B\n3. Document C', type: 'textarea', required: true },
      { key: 'observations', label: 'Observations', placeholder: 'Remarques éventuelles...', type: 'textarea', required: false },
      { key: 'transmitted_by', label: 'Transmis par', placeholder: 'Nom et fonction', type: 'text', required: true },
    ],
  },
];

const categoryConfig = {
  administrative: { label: 'Administratif', color: 'bg-blue-500/20 text-blue-400' },
  legal: { label: 'Juridique', color: 'bg-purple-500/20 text-purple-400' },
  internal: { label: 'Interne', color: 'bg-green-500/20 text-green-400' },
  report: { label: 'Rapport', color: 'bg-amber-500/20 text-amber-400' },
};

export function DocumentTemplates({ isOpen, onClose, onCreateDocument }: DocumentTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [documentName, setDocumentName] = useState('');

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormValues({});
    setDocumentName(template.name);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setFormValues({});
  };

  const handleValueChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  const generateContent = (): string => {
    if (!selectedTemplate) return '';
    
    let content = selectedTemplate.content;
    selectedTemplate.variables.forEach(variable => {
      const value = formValues[variable.key] || '';
      content = content.replace(new RegExp(`{{${variable.key}}}`, 'g'), value);
    });
    return content;
  };

  const isFormValid = (): boolean => {
    if (!selectedTemplate) return false;
    return selectedTemplate.variables
      .filter(v => v.required)
      .every(v => formValues[v.key]?.trim());
  };

  const handleCreate = () => {
    if (!selectedTemplate || !isFormValid()) return;

    const newDocument: Omit<Document, 'id' | 'case_id' | 'created_at'> = {
      name: documentName || selectedTemplate.name,
      type: selectedTemplate.type,
      content: generateContent(),
      version: 1,
      created_by: 'current-user',
    };

    onCreateDocument(newDocument);
    onClose();
    setSelectedTemplate(null);
    setFormValues({});
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setSelectedTemplate(null);
    setFormValues({});
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {selectedTemplate ? 'Personnaliser le modèle' : 'Modèles de documents'}
          </DialogTitle>
          <DialogDescription>
            {selectedTemplate 
              ? 'Remplissez les champs pour générer votre document'
              : 'Choisissez un modèle pour créer rapidement un nouveau document'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedTemplate ? (
            <motion.div
              key="template-list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un modèle..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Template Grid */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {filteredTemplates.map((template, idx) => {
                  const Icon = template.icon;
                  const category = categoryConfig[template.category];
                  
                  return (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSelectTemplate(template)}
                      className="w-full p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{template.name}</h4>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", category.color)}>
                              {category.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="template-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              {/* Document Name */}
              <div className="mb-4">
                <Label htmlFor="doc-name">Nom du document</Label>
                <Input
                  id="doc-name"
                  value={documentName}
                  onChange={e => setDocumentName(e.target.value)}
                  placeholder={selectedTemplate.name}
                  className="mt-1"
                />
              </div>

              {/* Form Fields */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.key}>
                    <Label htmlFor={variable.key}>
                      {variable.label}
                      {variable.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {variable.type === 'textarea' ? (
                      <Textarea
                        id={variable.key}
                        value={formValues[variable.key] || ''}
                        onChange={e => handleValueChange(variable.key, e.target.value)}
                        placeholder={variable.placeholder}
                        className="mt-1 min-h-[80px]"
                      />
                    ) : (
                      <Input
                        id={variable.key}
                        type={variable.type === 'date' ? 'date' : 'text'}
                        value={formValues[variable.key] || ''}
                        onChange={e => handleValueChange(variable.key, e.target.value)}
                        placeholder={variable.placeholder}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleCreate}
                  disabled={!isFormValid()}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Créer le document
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
