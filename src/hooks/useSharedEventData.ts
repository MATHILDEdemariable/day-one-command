
import { useEventData } from '@/contexts/EventDataContext';
import { useTimelineItems } from '@/hooks/useTimelineItems';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';

export const useSharedEventData = () => {
  const {
    tasks,
    planningItems,
    people,
    vendors,
    loading,
    refreshData,
    getProgressStats,
    getDaysUntilEvent
  } = useEventData();

  const { timelineItems, loadTimelineItems } = useTimelineItems();
  const { currentEventId } = useCurrentEvent();

  // Debug: Log pour vérifier la cohérence des données
  console.log('useSharedEventData - Data check:');
  console.log('Current event ID:', currentEventId);
  console.log('Tasks from EventDataContext:', tasks);
  console.log('People from EventDataContext:', people);
  console.log('Vendors from EventDataContext:', vendors);
  console.log('Timeline items from useTimelineItems:', timelineItems);
  console.log('Loading state:', loading);

  // Strict filtering par event_id pour toutes les données - SANS FILTRE DE STATUT
  const eventFilteredTasks = tasks.filter(task => task.event_id === currentEventId);
  const eventFilteredPeople = people.filter(person => person.event_id === currentEventId);
  const eventFilteredVendors = vendors.filter(vendor => vendor.event_id === currentEventId);
  const eventFilteredPlanningItems = planningItems.filter(item => item.event_id === currentEventId);

  console.log('useSharedEventData - Event filtered data (no status filters):');
  console.log('Filtered tasks:', eventFilteredTasks);
  console.log('Filtered people:', eventFilteredPeople);
  console.log('Filtered vendors:', eventFilteredVendors);
  console.log('Filtered planning items:', eventFilteredPlanningItems);

  // Refresh complet avec timeline items
  const enhancedRefreshData = async () => {
    console.log('Enhanced refresh data triggered');
    try {
      await Promise.all([
        refreshData(),
        loadTimelineItems()
      ]);
      console.log('Enhanced refresh completed');
    } catch (error) {
      console.error('Error in enhanced refresh:', error);
    }
  };

  // Fonctions utilitaires pour les données partagées
  const getCriticalTasks = () => {
    return eventFilteredTasks.filter(task => 
      task.priority === 'high' && task.status !== 'completed'
    ).slice(0, 5); // Top 5 tâches critiques
  };

  const getUpcomingPlanningItems = () => {
    return eventFilteredPlanningItems.slice(0, 3); // Prochaines 3 étapes
  };

  // Suppression des filtres de statut dans les résumés
  const getTeamSummary = () => {
    const total = eventFilteredPeople.length;
    const confirmed = eventFilteredPeople.filter(p => p.confirmation_status === 'confirmed').length;
    const pending = total - confirmed;
    
    console.log('Team summary (no status filtering for access):', { total, confirmed, pending });
    return { confirmed, pending, total };
  };

  const getVendorsSummary = () => {
    const total = eventFilteredVendors.length;
    const confirmed = eventFilteredVendors.filter(v => v.contract_status === 'signed').length;
    const pending = total - confirmed;
    
    console.log('Vendors summary (no status filtering for access):', { total, confirmed, pending });
    return { confirmed, pending, total };
  };

  const getTimelineStats = () => {
    // Limiter aux éléments de l'événement actuel
    const filteredTimelineItems = timelineItems.filter(item => item.event_id === currentEventId);
    
    const totalSteps = filteredTimelineItems.length;
    const completedSteps = filteredTimelineItems.filter(item => item.status === 'completed').length;
    const criticalSteps = filteredTimelineItems.filter(item => item.priority === 'high' && item.status !== 'completed').length;
    const delayedSteps = filteredTimelineItems.filter(item => item.status === 'delayed').length;
    
    const stats = {
      totalSteps,
      completedSteps,
      criticalSteps,
      delayedSteps,
      progressPercentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    };
    
    console.log('Timeline stats:', stats);
    return stats;
  };

  const getDocumentStats = () => {
    // Pour l'instant, on simule les stats des documents
    // Plus tard, cela sera connecté aux vrais documents
    return {
      totalDocuments: 18,
      pendingDocuments: 3,
      approvedDocuments: 15
    };
  };

  const getRecentActivity = () => {
    const activities = [];
    
    // Activités récentes des tâches terminées
    const recentCompletedTasks = eventFilteredTasks
      .filter(task => task.status === 'completed' && task.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 2);
    
    recentCompletedTasks.forEach(task => {
      activities.push({
        type: 'task_completed',
        title: `Tâche "${task.title}" marquée comme terminée`,
        time: task.completed_at!,
        color: 'green'
      });
    });

    // Activités récentes des timeline items - uniquement de l'événement actuel
    const filteredTimelineItems = timelineItems.filter(item => item.event_id === currentEventId);
    const recentTimelineItems = filteredTimelineItems
      .filter(item => item.status === 'completed')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 2);
    
    recentTimelineItems.forEach(item => {
      activities.push({
        type: 'timeline_completed',
        title: `Étape "${item.title}" terminée`,
        time: item.updated_at,
        color: 'blue'
      });
    });

    const finalActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
    
    console.log('Recent activities:', finalActivities);
    return finalActivities;
  };

  return {
    // Données filtrées par event_id UNIQUEMENT - accès pour tous les participants
    tasks: eventFilteredTasks,
    planningItems: eventFilteredPlanningItems,
    timelineItems: timelineItems.filter(item => item.event_id === currentEventId),
    people: eventFilteredPeople, // TOUS les participants de l'événement
    vendors: eventFilteredVendors, // TOUS les prestataires de l'événement
    loading,
    
    // Actions - utiliser la version enrichie pour les timeline items
    refreshData: enhancedRefreshData,
    
    // Statistiques et calculs
    getProgressStats,
    getDaysUntilEvent,
    getCriticalTasks,
    getUpcomingPlanningItems,
    getTeamSummary,
    getVendorsSummary,
    getTimelineStats,
    getDocumentStats,
    getRecentActivity
  };
};
