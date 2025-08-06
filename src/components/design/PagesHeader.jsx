import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button, Modal, TextInput, Textarea, Label, Spinner } from "flowbite-react";
import { HiSave } from "react-icons/hi";

const PagesHeader = ({ isProcessing, availableImages, totalImages, onAutoArrange, onSaveAlbum, currentAlbumId, currentAlbumName }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');

  // Auto-fill album name when we have a current album
  React.useEffect(() => {
    if (currentAlbumName && !albumName) {
      setAlbumName(currentAlbumName);
    }
  }, [currentAlbumName, albumName]);

  const handleSaveAlbum = async () => {
    if (!albumName.trim()) return;
    
    // Show saving toast with unique ID
    const operation = currentAlbumId ? 'update' : 'save';
    const message = currentAlbumId ? 'Updating album...' : 'Saving album...';
    const savingToast = toast.loading(message, { 
      duration: 0,
      id: `${operation}-${albumName}-${Date.now()}` 
    });
    
    try {
      console.log(`Starting ${operation} operation for "${albumName}"...`);
      const startTime = Date.now();
      
      // Pass the current album ID to auto-overwrite existing albums
      const savedId = await onSaveAlbum(albumName, albumDescription, currentAlbumId);
      
      const endTime = Date.now();
      console.log(`${operation} operation completed in ${endTime - startTime}ms`);
      
      // Dismiss our loading toast after a short delay
      setTimeout(() => {
        toast.dismiss(savingToast);
      }, 100);
      
      if (savedId) {
        setShowSaveModal(false);
        // Don't clear the form if it's an existing album
        if (!currentAlbumId) {
          setAlbumName('');
          setAlbumDescription('');
        }
      } else {
        toast.error('Failed to save album');
      }
    } catch (error) {
      console.error(`${operation} operation failed:`, error);
      toast.dismiss(savingToast);
      toast.error('Failed to save album');
    }
  };

  // Quick save function for existing albums
  const handleQuickSave = async () => {
    if (currentAlbumId && currentAlbumName) {
      // Show updating toast with a unique ID to prevent conflicts
      const updatingToast = toast.loading(`Updating "${currentAlbumName}"...`, { 
        duration: 0,
        id: `update-${currentAlbumId}` // Unique ID to prevent conflicts
      });
      
      try {
        console.log('Starting update operation...');
        const startTime = Date.now();
        
        const savedId = await onSaveAlbum(currentAlbumName, '', currentAlbumId);
        
        const endTime = Date.now();
        console.log(`Update operation completed in ${endTime - startTime}ms`);
        
        // Dismiss our loading toast after a short delay to ensure it shows
        setTimeout(() => {
          toast.dismiss(updatingToast);
        }, 100);
        
        // The onSaveAlbum function already shows success/error toasts
        // We only show error if the operation returns null/undefined
        if (!savedId) {
          toast.error('Failed to update album');
        }
      } catch (error) {
        console.error('Update operation failed:', error);
        toast.dismiss(updatingToast);
        toast.error('Failed to update album');
      }
    } else {
      setShowSaveModal(true);
    }
  };
  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            PDF Pages
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Arrange your images on pages
          </p>
        </div>
        <div className="flex gap-2">
          {currentAlbumId ? (
            <>
              <Button
                onClick={handleQuickSave}
                disabled={totalImages === 0 || isProcessing}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <HiSave className="mr-2 h-4 w-4" />
                Update "{currentAlbumName}"
              </Button>
              <Button
                onClick={() => setShowSaveModal(true)}
                disabled={totalImages === 0 || isProcessing}
                variant="outline"
                size="sm"
              >
                Save As New...
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowSaveModal(true)}
              disabled={totalImages === 0 || isProcessing}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <HiSave className="mr-2 h-4 w-4" />
              Save Album
            </Button>
          )}
          <Button
            color="gray"
            onClick={onAutoArrange}
            disabled={isProcessing || availableImages.length === 0}
            size="sm"
            className="self-start sm:self-auto"
          >
            {isProcessing ? "Auto-arranging..." : "Auto-arrange"}
          </Button>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700"></div>

      {/* Save Album Modal */}
      {showSaveModal && (
        <Modal
          show={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          size="md"
        >
          <div className="p-6">
            <div className="mb-4 flex items-center">
              <HiSave className="mr-2 h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Save Current Work as Album
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="albumName" value="Album Name *" />
                <TextInput
                  id="albumName"
                  type="text"
                  placeholder="Enter album name..."
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="albumDescription" value="Description (optional)" />
                <Textarea
                  id="albumDescription"
                  placeholder="Enter album description..."
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleSaveAlbum}
                disabled={!albumName.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? <Spinner size="sm" className="mr-2" /> : <HiSave className="mr-2 h-4 w-4" />}
                Save Album
              </Button>
              <Button color="gray" onClick={() => setShowSaveModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PagesHeader;
