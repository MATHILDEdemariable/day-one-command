import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Folder } from 'lucide-react';
import { useEventData } from '@/contexts/EventDataContext';
import { convertToNavigableGoogleDriveUrl } from '@/utils/googleDriveUtils';
import { useIsMobile } from '@/hooks/use-mobile';

const CATEGORY_COLORS = {
  'Planning': 'bg-purple-100 text-purple-800',
  'Musique': 'bg-blue-100 text-blue-800',
  'Contrats': 'bg-green-100 text-green-800',
  'Légal': 'bg-red-100 text-red-800',
  'Photos': 'bg-yellow-100 text-yellow-800',
  'Factures': 'bg-orange-100 text-orange-800',
  'Listes': 'bg-indigo-100 text-indigo-800',
  'Communications': 'bg-pink-100 text-pink-800',
  'Other': 'bg-gray-100 text-gray-800'
};

const TYPE_ICONS = {
  'application/pdf': '📄',
  'image/': '🖼️',
  'audio/': '🎵',
  'video/': '🎥',
  'application/zip': '📦',
  'text/': '📝'
};

export const DocumentHub: React.FC = () => {
  const { documents, loading, currentEvent } = useEventData();
  const isMobile = useIsMobile();
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleDownload = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document?.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleView = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document?.google_drive_url) {
      window.open(document.google_drive_url, '_blank');
    } else if (document?.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const refreshIframe = () => {
    setIframeLoading(true);
    const iframe = document.getElementById('user-google-drive-iframe') as HTMLIFrameElement;
    if (iframe && currentEvent?.google_drive_url) {
      iframe.src = convertToNavigableGoogleDriveUrl(currentEvent.google_drive_url);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (fileType: string | null) => {
    if (!fileType) return '📄';
    for (const [type, icon] of Object.entries(TYPE_ICONS)) {
      if (fileType.includes(type)) return icon;
    }
    return '📄';
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-purple-600 text-sm">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  const highPriorityDocs = documents.filter(doc => 
    doc.category === 'Planning' || doc.category === 'Légal' || doc.category === 'Contrats'
  );
  const otherDocs = documents.filter(doc => 
    doc.category !== 'Planning' && doc.category !== 'Légal' && doc.category !== 'Contrats'
  );

  return (
    <div className="p-2 md:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents</h2>
        <Badge variant="secondary" className="text-xs">
          {documents.length} fichiers
        </Badge>
      </div>

      {/* Google Drive Integration for users */}
      {currentEvent?.google_drive_url && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-900 text-base md:text-lg">
                <Folder className="w-4 h-4 md:w-5 md:h-5" />
                Google Drive Partagé
              </CardTitle>
              <div className="flex gap-1 md:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshIframe}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  {!isMobile && <span className="ml-1">Actualiser</span>}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentEvent.google_drive_url, '_blank')}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="w-3 h-3" />
                  {!isMobile && <span className="ml-1">Ouvrir</span>}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {iframeLoading && (
                <div className="absolute inset-0 bg-blue-50 flex items-center justify-center rounded border border-blue-200">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-4 w-4 md:h-6 md:w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-blue-700 text-xs md:text-sm">Chargement...</p>
                  </div>
                </div>
              )}
              <iframe
                id="user-google-drive-iframe"
                src={convertToNavigableGoogleDriveUrl(currentEvent.google_drive_url)}
                width="100%"
                height={isMobile ? "300" : "400"}
                className="border border-blue-200 rounded"
                title="Google Drive Partagé"
                onLoad={handleIframeLoad}
                allow="fullscreen"
                style={{ minHeight: isMobile ? '300px' : '400px' }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-2">
              📁 Accédez directement aux documents partagés de l'événement
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Access - High Priority Documents */}
      {highPriorityDocs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm md:text-md font-medium text-purple-600 flex items-center gap-2">
            ⚡ Accès rapide
          </h3>
          {highPriorityDocs.map((document) => (
            <DocumentCard 
              key={document.id} 
              document={document} 
              onDownload={handleDownload}
              onView={handleView}
              isHighPriority={true}
              formatFileSize={formatFileSize}
              getTypeIcon={getTypeIcon}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {/* All Documents */}
      {otherDocs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm md:text-md font-medium text-gray-700">Autres documents</h3>
          {otherDocs.map((document) => (
            <DocumentCard 
              key={document.id} 
              document={document} 
              onDownload={handleDownload}
              onView={handleView}
              isHighPriority={false}
              formatFileSize={formatFileSize}
              getTypeIcon={getTypeIcon}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-6 md:py-8 text-gray-500">
          <p className="text-sm md:text-base">Aucun document trouvé</p>
          <p className="text-xs mt-2">Les documents ajoutés dans l'admin apparaîtront ici</p>
        </div>
      )}
    </div>
  );
};

interface DocumentCardProps {
  document: any;
  onDownload: (id: string) => void;
  onView: (id: string) => void;
  isHighPriority: boolean;
  formatFileSize: (bytes: number | null) => string;
  getTypeIcon: (fileType: string | null) => string;
  isMobile: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onDownload, 
  onView, 
  isHighPriority,
  formatFileSize,
  getTypeIcon,
  isMobile
}) => {
  const categoryColor = CATEGORY_COLORS[document.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other;
  const typeIcon = getTypeIcon(document.mime_type || document.file_type);

  return (
    <Card className={`hover:shadow-md transition-all ${isHighPriority ? 'border-l-4 border-l-purple-500 bg-purple-50' : ''}`}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="text-lg md:text-2xl">{typeIcon}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1">
              <h3 className="font-medium truncate text-sm md:text-base">{document.name}</h3>
              <div className="flex gap-1">
                {document.category && (
                  <Badge className={categoryColor} variant="secondary" size="sm">
                    {document.category}
                  </Badge>
                )}
                {document.source === 'google_drive' && (
                  <Badge variant="outline" className="text-xs">
                    🌥️ Drive
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 md:gap-4 text-xs text-gray-500 mb-2 md:mb-3">
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>par {document.uploaded_by}</span>
              <span>•</span>
              <span>{new Date(document.created_at).toLocaleDateString('fr-FR')}</span>
            </div>

            {document.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{document.description}</p>
            )}

            <div className={`flex gap-1 md:gap-2 ${isMobile ? 'flex-col' : ''}`}>
              <Button 
                size="sm" 
                onClick={() => onView(document.id)}
                className={`bg-purple-600 hover:bg-purple-700 text-xs ${isMobile ? 'w-full' : 'flex-1'}`}
              >
                👁️ Voir
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDownload(document.id)}
                className={`text-xs ${isMobile ? 'w-full' : 'flex-1'}`}
              >
                ⬇️ Télécharger
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentHub;
