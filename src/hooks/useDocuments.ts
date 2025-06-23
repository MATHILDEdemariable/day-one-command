
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentEvent } from '@/contexts/CurrentEventContext';

export interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  mime_type: string | null;
  file_size: number | null;
  category: string | null;
  description: string | null;
  source: 'manual' | 'google_drive';
  google_drive_id: string | null;
  google_drive_url: string | null;
  preview_url: string | null;
  uploaded_by: string | null;
  is_shared: boolean | null;
  event_id: string | null;
  vendor_id: string | null;
  created_at: string;
}

export interface GoogleDriveConfig {
  id: string;
  event_id: string;
  folder_id: string;
  folder_url: string | null;
  access_token: string | null;
  refresh_token: string | null;
  is_connected: boolean | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useDocuments = () => {
  const { toast } = useToast();
  const { currentEventId } = useCurrentEvent();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [googleDriveConfig, setGoogleDriveConfig] = useState<GoogleDriveConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Charger les documents
  const loadDocuments = async () => {
    if (!currentEventId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('event_id', currentEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Conversion des données Supabase vers notre interface avec validation du type source
      const typedDocuments: Document[] = (data || []).map(doc => ({
        ...doc,
        source: (doc.source === 'google_drive' ? 'google_drive' : 'manual') as 'manual' | 'google_drive'
      }));
      
      setDocuments(typedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger la configuration Google Drive
  const loadGoogleDriveConfig = async () => {
    if (!currentEventId) return;
    
    try {
      const { data, error } = await supabase
        .from('google_drive_configs')
        .select('*')
        .eq('event_id', currentEventId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setGoogleDriveConfig(data || null);
    } catch (error) {
      console.error('Error loading Google Drive config:', error);
    }
  };

  // Upload manuel d'un document
  const uploadDocument = async (file: File, category: string, description?: string) => {
    if (!currentEventId) return;

    try {
      setLoading(true);
      
      // Upload vers Supabase Storage (pour l'instant simulation)
      const fileUrl = URL.createObjectURL(file);
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          event_id: currentEventId,
          name: file.name,
          file_url: fileUrl,
          file_type: file.type,
          mime_type: file.type,
          file_size: file.size,
          category,
          description,
          source: 'manual',
          uploaded_by: 'Admin',
          is_shared: true
        })
        .select()
        .single();

      if (error) throw error;
      
      // Conversion avec validation du type source
      const typedDocument: Document = {
        ...data,
        source: 'manual' as const
      };
      
      setDocuments(prev => [typedDocument, ...prev]);
      toast({
        title: 'Succès',
        description: 'Document uploadé avec succès',
      });
      
      return typedDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'uploader le document',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connecter Google Drive
  const connectGoogleDrive = async (folderId: string, folderUrl: string) => {
    if (!currentEventId) return;

    try {
      const { data, error } = await supabase
        .from('google_drive_configs')
        .upsert({
          event_id: currentEventId,
          folder_id: folderId,
          folder_url: folderUrl,
          is_connected: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setGoogleDriveConfig(data);
      toast({
        title: 'Succès',
        description: 'Google Drive connecté avec succès',
      });

      // Synchroniser automatiquement après la connexion
      await syncGoogleDrive();
    } catch (error) {
      console.error('Error connecting Google Drive:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de connecter Google Drive',
        variant: 'destructive',
      });
    }
  };

  // Synchroniser avec Google Drive
  const syncGoogleDrive = async () => {
    if (!googleDriveConfig?.is_connected) return;

    setSyncing(true);
    try {
      // Simulation de synchronisation - dans une vraie implémentation,
      // cela ferait des appels à l'API Google Drive
      const mockGoogleDriveFiles = [
        {
          id: 'gdrive_1',
          name: 'Contrat Mariage.pdf',
          mimeType: 'application/pdf',
          size: 2500000,
          webViewLink: 'https://drive.google.com/file/d/gdrive_1/view',
          downloadUrl: 'https://drive.google.com/uc?id=gdrive_1'
        },
        {
          id: 'gdrive_2',
          name: 'Photos Venue.zip',
          mimeType: 'application/zip',
          size: 15000000,
          webViewLink: 'https://drive.google.com/file/d/gdrive_2/view',
          downloadUrl: 'https://drive.google.com/uc?id=gdrive_2'
        }
      ];

      for (const file of mockGoogleDriveFiles) {
        // Vérifier si le fichier existe déjà
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id')
          .eq('google_drive_id', file.id)
          .eq('event_id', currentEventId)
          .single();

        if (!existingDoc) {
          const { data, error } = await supabase
            .from('documents')
            .insert({
              event_id: currentEventId,
              name: file.name,
              file_url: file.downloadUrl,
              file_type: file.mimeType,
              mime_type: file.mimeType,
              file_size: file.size,
              category: 'Contrats', // Catégorie par défaut
              source: 'google_drive',
              google_drive_id: file.id,
              google_drive_url: file.webViewLink,
              preview_url: file.webViewLink,
              uploaded_by: 'Google Drive',
              is_shared: true
            })
            .select()
            .single();

          if (error) throw error;
          
          // Conversion avec validation du type source
          const typedDocument: Document = {
            ...data,
            source: 'google_drive' as const
          };
          
          setDocuments(prev => [typedDocument, ...prev]);
        }
      }

      // Mettre à jour la date de dernière synchronisation
      const { error: updateError } = await supabase
        .from('google_drive_configs')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', googleDriveConfig.id);

      if (updateError) throw updateError;

      toast({
        title: 'Synchronisation réussie',
        description: `${mockGoogleDriveFiles.length} fichiers synchronisés depuis Google Drive`,
      });

    } catch (error) {
      console.error('Error syncing Google Drive:', error);
      toast({
        title: 'Erreur de synchronisation',
        description: 'Impossible de synchroniser avec Google Drive',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  // Supprimer un document
  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: 'Succès',
        description: 'Document supprimé avec succès',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le document',
        variant: 'destructive',
      });
    }
  };

  // Mettre à jour un document
  const updateDocument = async (documentId: string, updates: Partial<Omit<Document, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      
      // Conversion avec validation du type source
      const typedDocument: Document = {
        ...data,
        source: (data.source === 'google_drive' ? 'google_drive' : 'manual') as 'manual' | 'google_drive'
      };
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? typedDocument : doc
      ));
      
      toast({
        title: 'Succès',
        description: 'Document mis à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le document',
        variant: 'destructive',
      });
    }
  };

  // Statistiques
  const getStats = () => {
    const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
    const categories = [...new Set(documents.map(doc => doc.category).filter(Boolean))];
    const googleDriveCount = documents.filter(doc => doc.source === 'google_drive').length;
    const manualCount = documents.filter(doc => doc.source === 'manual').length;

    return {
      totalDocuments: documents.length,
      totalSize,
      categoriesCount: categories.length,
      googleDriveCount,
      manualCount,
      isGoogleDriveConnected: googleDriveConfig?.is_connected || false
    };
  };

  useEffect(() => {
    if (currentEventId) {
      loadDocuments();
      loadGoogleDriveConfig();
    }
  }, [currentEventId]);

  return {
    documents,
    googleDriveConfig,
    loading,
    syncing,
    loadDocuments,
    uploadDocument,
    connectGoogleDrive,
    syncGoogleDrive,
    deleteDocument,
    updateDocument,
    getStats
  };
};
