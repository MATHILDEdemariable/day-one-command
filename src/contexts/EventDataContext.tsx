
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { usePlanningItems } from '@/hooks/usePlanningItems';
import { usePeople } from '@/hooks/usePeople';
import { useVendors } from '@/hooks/useVendors';
import { useEvents } from '@/hooks/useEvents';
import { useDocuments } from '@/hooks/useDocuments';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';

interface EventDataContextType {
  tasks: any[];
  planningItems: any[];
  people: any[];
  vendors: any[];
  documents: any[];
  currentEvent: any;
  events: any[];
  loading: boolean;
  refreshData: () => void;
  getProgressStats: () => {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    criticalTasks: number;
  };
  getDaysUntilEvent: () => number;
  getDocumentStats: () => {
    totalDocuments: number;
    totalSize: number;
    categoriesCount: number;
    googleDriveCount: number;
    manualCount: number;
  };
}

const EventDataContext = createContext<EventDataContextType | undefined>(undefined);

export const EventDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentEventId } = useCurrentEvent();
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { planningItems } = usePlanningItems();
  const { people, loading: peopleLoading, loadPeople } = usePeople();
  const { vendors, loading: vendorsLoading, loadVendors } = useVendors();
  const { documents, loading: documentsLoading, loadDocuments, getStats: getDocumentStatsFromHook } = useDocuments();
  const { currentEvent, events, loading: eventsLoading } = useEvents();
  
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Auto-refresh data every 30 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loading = tasksLoading || peopleLoading || vendorsLoading || documentsLoading || eventsLoading;

  const refreshData = () => {
    refetchTasks();
    loadPeople();
    loadVendors();
    loadDocuments();
    setLastUpdate(Date.now());
  };

  const getProgressStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const criticalTasks = tasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    ).length;

    return {
      totalTasks,
      completedTasks,
      progressPercentage,
      criticalTasks
    };
  };

  const getDocumentStats = () => {
    return getDocumentStatsFromHook();
  };

  const getDaysUntilEvent = () => {
    if (!currentEvent?.event_date) return 0;
    
    const eventDate = new Date(currentEvent.event_date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const value = {
    tasks,
    planningItems,
    people,
    vendors,
    documents,
    currentEvent,
    events,
    loading,
    refreshData,
    getProgressStats,
    getDocumentStats,
    getDaysUntilEvent
  };

  return (
    <EventDataContext.Provider value={value}>
      {children}
    </EventDataContext.Provider>
  );
};

export const useEventData = () => {
  const context = useContext(EventDataContext);
  if (context === undefined) {
    throw new Error('useEventData must be used within an EventDataProvider');
  }
  return context;
};
