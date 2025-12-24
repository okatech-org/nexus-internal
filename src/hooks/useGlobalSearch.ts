import { useState, useCallback, useMemo } from 'react';

export type SearchResultType = 'message' | 'contact' | 'document' | 'thread' | 'meeting';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  icon: string;
  timestamp?: string;
  highlight?: string;
  metadata?: Record<string, unknown>;
}

// Mock data for search
const mockMessages = [
  { id: 'm1', title: 'Jean Dupont', subtitle: 'D\'accord, je regarde ça', timestamp: '10:42' },
  { id: 'm2', title: 'Marie Martin', subtitle: 'Le dossier a été validé', timestamp: '09:15' },
  { id: 'm3', title: 'Support Technique', subtitle: 'Ticket #4521 résolu', timestamp: 'Hier' },
  { id: 'm4', title: 'Direction Générale', subtitle: 'Rapport validé. Merci pour votre travail.', timestamp: '10 min' },
  { id: 'm5', title: 'Équipe Technique', subtitle: 'Le système est opérationnel.', timestamp: '30 min' },
];

const mockContacts = [
  { id: 'c1', title: 'Jean Dupont', subtitle: 'Chef de projet · TechCorp' },
  { id: 'c2', title: 'Marie Martin', subtitle: 'Directrice RH · Alpha Solutions' },
  { id: 'c3', title: 'Pierre Laurent', subtitle: 'Développeur · BizPartner' },
  { id: 'c4', title: 'Sophie Dubois', subtitle: 'Designer · Consultants Pro' },
  { id: 'c5', title: 'Marc Petit', subtitle: 'Commercial · StartupXYZ' },
  { id: 'c6', title: 'Service Impôts', subtitle: 'Administration' },
  { id: 'c7', title: 'Mairie Centrale', subtitle: 'Services municipaux' },
];

const mockDocuments = [
  { id: 'd1', title: 'Arrêté N°2024-0892', subtitle: 'Document officiel · En attente' },
  { id: 'd2', title: 'Note de service #45', subtitle: 'Document interne · Brouillon' },
  { id: 'd3', title: 'Convention interministérielle', subtitle: 'Document légal · Signé' },
  { id: 'd4', title: 'Rapport trimestriel Q4', subtitle: 'Rapport · Validé' },
  { id: 'd5', title: 'Procès-verbal réunion', subtitle: 'Compte-rendu · Archivé' },
];

const mockThreads = [
  { id: 't1', title: 'Demande de congés', subtitle: 'De: RH · Non lu' },
  { id: 't2', title: '[URGENT] Validation budget Q4', subtitle: 'De: Direction · Urgent' },
  { id: 't3', title: 'Compte-rendu réunion', subtitle: 'De: Jean Dupont · Lu' },
];

const mockMeetings = [
  { id: 'mt1', title: 'Réunion d\'équipe', subtitle: 'Aujourd\'hui · 15:00 · 5 participants' },
  { id: 'mt2', title: 'Point projet Alpha', subtitle: 'Demain · 10:00 · 3 participants' },
  { id: 'mt3', title: 'Formation nouveaux outils', subtitle: 'Ven 27 · 14:00 · 12 participants' },
];

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>('all');

  const allResults = useMemo((): SearchResult[] => {
    return [
      ...mockMessages.map(m => ({
        ...m,
        type: 'message' as SearchResultType,
        icon: '💬',
      })),
      ...mockContacts.map(c => ({
        ...c,
        type: 'contact' as SearchResultType,
        icon: '👤',
      })),
      ...mockDocuments.map(d => ({
        ...d,
        type: 'document' as SearchResultType,
        icon: '📄',
      })),
      ...mockThreads.map(t => ({
        ...t,
        type: 'thread' as SearchResultType,
        icon: '📥',
      })),
      ...mockMeetings.map(m => ({
        ...m,
        type: 'meeting' as SearchResultType,
        icon: '🎥',
      })),
    ];
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      // Show recent items when no query
      return allResults.slice(0, 8);
    }

    const lowerQuery = query.toLowerCase();
    let filtered = allResults.filter(
      result =>
        result.title.toLowerCase().includes(lowerQuery) ||
        result.subtitle.toLowerCase().includes(lowerQuery)
    );

    if (activeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === activeFilter);
    }

    // Add highlight
    return filtered.map(result => ({
      ...result,
      highlight: result.title.toLowerCase().includes(lowerQuery)
        ? result.title
        : result.subtitle,
    }));
  }, [query, allResults, activeFilter]);

  const resultsByType = useMemo(() => {
    const grouped: Record<SearchResultType, SearchResult[]> = {
      message: [],
      contact: [],
      document: [],
      thread: [],
      meeting: [],
    };

    searchResults.forEach(result => {
      grouped[result.type].push(result);
    });

    return grouped;
  }, [searchResults]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setActiveFilter('all');
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    query,
    setQuery,
    isOpen,
    open,
    close,
    toggle,
    searchResults,
    resultsByType,
    activeFilter,
    setActiveFilter,
    totalResults: searchResults.length,
  };
}
