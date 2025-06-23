
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Vendor {
  id: string;
  name: string;
  service_type: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  contract_status: string | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorDocument {
  id: string;
  vendor_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export const useVendors = () => {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prestataires',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les documents',
        variant: 'destructive',
      });
    }
  };

  const addVendor = async (newVendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert(newVendor)
        .select()
        .single();

      if (error) throw error;
      
      setVendors(prev => [data, ...prev]);
      toast({
        title: 'Succès',
        description: 'Prestataire ajouté avec succès',
      });
      
      return data;
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le prestataire',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setVendors(prev => prev.map(vendor => 
        vendor.id === id ? { ...vendor, ...data } : vendor
      ));
      
      toast({
        title: 'Succès',
        description: 'Prestataire mis à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le prestataire',
        variant: 'destructive',
      });
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setVendors(prev => prev.filter(vendor => vendor.id !== id));
      toast({
        title: 'Succès',
        description: 'Prestataire supprimé avec succès',
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le prestataire',
        variant: 'destructive',
      });
    }
  };

  const uploadDocument = async (vendorId: string, file: File, category: string) => {
    try {
      // Simulate file upload - in real app, upload to Supabase storage
      const fileUrl = URL.createObjectURL(file);
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          vendor_id: vendorId,
          name: file.name,
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          category,
          uploaded_by: 'User'
        })
        .select()
        .single();

      if (error) throw error;
      
      setDocuments(prev => [data, ...prev]);
      toast({
        title: 'Succès',
        description: 'Document uploadé avec succès',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'uploader le document',
        variant: 'destructive',
      });
    }
  };

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

  return {
    vendors,
    documents,
    loading,
    loadVendors,
    loadDocuments,
    addVendor,
    updateVendor,
    deleteVendor,
    uploadDocument,
    deleteDocument
  };
};
