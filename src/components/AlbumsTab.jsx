import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Button,
  Card,
  Modal,
  TextInput,
  Textarea,
  Alert,
  Badge,
  Dropdown,
  Spinner,
  Label,
} from 'flowbite-react';
import {
  HiPlus,
  HiSave,
  HiDownload,
  HiUpload,
  HiTrash,
  HiDuplicate,
  HiSearch,
  HiSortAscending,
  HiSortDescending,
  HiFolder,
  HiDocumentText,
  HiCalendar,
  HiPhotograph,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { useAlbumStorage } from '../hooks/useAlbumStorage.js';

const AlbumsTab = ({
  // From useImageManagement hook
  saveCurrentAsAlbum,
  loadAlbumById,
  clearCurrentWork,
  getCurrentAlbumData,
  totalImages,
  isProcessing,
  // Navigation
  setActiveTab,
}) => {
  const {
    albums,
    isLoading,
    isInitialized,
    saveAlbum,
    loadAlbum,
    deleteAlbum,
    duplicateAlbum,
    loadAllAlbums,
    searchAlbums,
    getSortedAlbums,
    exportAlbum,
    importAlbum,
  } = useAlbumStorage();

  // UI State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('modified');
  const [sortDirection, setSortDirection] = useState('desc');
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [duplicateName, setDuplicateName] = useState('');

  // Get filtered and sorted albums
  const searchResults = searchQuery ? searchAlbums(searchQuery) : albums;
  const sortedAlbums = getSortedAlbums(sortBy, sortDirection).filter(album =>
    !searchQuery || searchResults.find(result => result.id === album.id)
  );

  const handleSaveCurrentAlbum = async () => {
    if (!albumName.trim()) return;

    // Show saving toast
    const savingToast = toast.loading('Saving album...', { duration: 0 });
    
    try {
      const savedId = await saveCurrentAsAlbum(albumName, albumDescription);
      toast.dismiss(savingToast);
      
      if (savedId) {
        setShowSaveModal(false);
        setAlbumName('');
        setAlbumDescription('');
        await loadAllAlbums(); // Refresh the list
      } else {
        toast.error('Failed to save album');
      }
    } catch (error) {
      toast.dismiss(savingToast);
      toast.error('Failed to save album');
    }
  };

  const handleLoadAlbum = async (albumId) => {
    // Show loading toast
    const loadingToast = toast.loading('Loading album...', { duration: 0 });
    
    try {
      const album = await loadAlbumById(albumId);
      if (album) {
        toast.dismiss(loadingToast);
        toast.success(`📖 Album "${album.name}" loaded!`, { icon: '✅' });
        setActiveTab('design'); // Navigate to design tab after loading
      } else {
        toast.dismiss(loadingToast);
        toast.error('Failed to load album');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to load album');
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;

    // Show deleting toast
    const deletingToast = toast.loading(`Deleting album "${selectedAlbum.name}"...`, { duration: 0 });
    
    try {
      const success = await deleteAlbum(selectedAlbum.id, selectedAlbum.name);
      toast.dismiss(deletingToast);
      
      if (success) {
        setShowDeleteModal(false);
        setSelectedAlbum(null);
        // Success toast is already handled by the deleteAlbum function
      } else {
        toast.error('Failed to delete album');
      }
    } catch (error) {
      toast.dismiss(deletingToast);
      toast.error('Failed to delete album');
    }
  };

  const handleDuplicateAlbum = async () => {
    if (!selectedAlbum || !duplicateName.trim()) return;

    // Show duplicating toast
    const duplicatingToast = toast.loading(`Creating duplicate of "${selectedAlbum.name}"...`, { duration: 0 });
    
    try {
      const duplicatedId = await duplicateAlbum(selectedAlbum.id, duplicateName);
      toast.dismiss(duplicatingToast);
      
      if (duplicatedId) {
        setShowDuplicateModal(false);
        setSelectedAlbum(null);
        setDuplicateName('');
        // Success toast is already handled by the duplicateAlbum function
      } else {
        toast.error('Failed to create duplicate album');
      }
    } catch (error) {
      toast.dismiss(duplicatingToast);
      toast.error('Failed to create duplicate album');
    }
  };

  const handleExportAlbum = async (albumId, albumName) => {
    // Show exporting toast
    const exportingToast = toast.loading(`Exporting album "${albumName}"...`, { duration: 0 });
    
    try {
      await exportAlbum(albumId);
      toast.dismiss(exportingToast);
      // Success toast is already handled by the exportAlbum function
    } catch (error) {
      toast.dismiss(exportingToast);
      toast.error('Failed to export album');
    }
  };

  const handleImportAlbum = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        // Show importing toast
        const importingToast = toast.loading(`Importing album from "${file.name}"...`, { duration: 0 });
        
        try {
          const importedId = await importAlbum(file);
          toast.dismiss(importingToast);
          
          if (importedId) {
            await loadAllAlbums(); // Refresh the list
            // Success toast is already handled by the importAlbum function
          } else {
            toast.error('Failed to import album');
          }
        } catch (error) {
          toast.dismiss(importingToast);
          toast.error('Failed to import album');
        }
      }
    };
    input.click();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your albums...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            <HiFolder className="mr-2 inline-block" />
            My Albums
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your saved image albums
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowSaveModal(true)}
            disabled={totalImages === 0 || isProcessing}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <HiSave className="mr-2 h-4 w-4" />
            Save Current Work
          </Button>
          <Button
            onClick={handleImportAlbum}
            variant="outline"
            size="sm"
          >
            <HiUpload className="mr-2 h-4 w-4" />
            Import Album
          </Button>
          {totalImages > 0 && (
            <Button
              onClick={clearCurrentWork}
              color="gray"
              size="sm"
            >
              Clear Work Area
            </Button>
          )}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <TextInput
            type="text"
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Dropdown
            label={`Sort by ${sortBy === 'name' ? 'Name' : sortBy === 'created' ? 'Created' : sortBy === 'totalImages' ? 'Images' : 'Modified'}`}
            size="sm"
            color="gray"
          >
            <Dropdown.Item onClick={() => setSortBy('modified')}>
              <HiCalendar className="mr-2 h-4 w-4" />
              Modified
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('created')}>
              <HiCalendar className="mr-2 h-4 w-4" />
              Created
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('name')}>
              <HiDocumentText className="mr-2 h-4 w-4" />
              Name
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setSortBy('totalImages')}>
              <HiPhotograph className="mr-2 h-4 w-4" />
              Image Count
            </Dropdown.Item>
          </Dropdown>

          <Button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            color="gray"
            size="sm"
          >
            {sortDirection === 'asc' ? <HiSortAscending className="h-4 w-4" /> : <HiSortDescending className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Albums Grid */}
      {sortedAlbums.length === 0 ? (
        <div className="text-center py-12">
          {searchQuery ? (
            <div>
              <HiSearch className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                No albums found
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                No albums match your search for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div>
              <HiFolder className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                No albums yet
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Create your first album by saving your current work
              </p>
              <Button
                onClick={() => setActiveTab('upload')}
                className="mt-4"
                size="sm"
              >
                Start Creating
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedAlbums.map((album) => (
            <Card key={album.id} className="group hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              {album.thumbnail ? (
                <img
                  src={album.thumbnail}
                  alt={album.name}
                  className="h-40 w-full rounded-t-lg object-cover"
                />
              ) : (
                <div className="h-40 w-full rounded-t-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <HiPhotograph className="h-12 w-12 text-gray-400" />
                </div>
              )}

              <div className="p-4">
                {/* Album Info */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {album.name}
                  </h3>
                  {album.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                      {album.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className="mb-4 space-y-1">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <HiPhotograph className="mr-1 h-3 w-3" />
                    {album.totalImages || 0} images
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <HiCalendar className="mr-1 h-3 w-3" />
                    {formatDate(album.modified)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleLoadAlbum(album.id)}
                    size="xs"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || isProcessing}
                  >
                    Load
                  </Button>

                  <Dropdown
                    placement="bottom-end"
                    renderTrigger={() => (
                      <Button size="xs" color="gray">
                        ⋯
                      </Button>
                    )}
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedAlbum(album);
                          setDuplicateName(`${album.name} Copy`);
                          setShowDuplicateModal(true);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        <HiDuplicate className="mr-2 h-4 w-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleExportAlbum(album.id, album.name)}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        <HiDownload className="mr-2 h-4 w-4" />
                        Export
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-600"></div>
                      <button
                        onClick={() => {
                          setSelectedAlbum(album);
                          setShowDeleteModal(true);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-500 dark:hover:bg-gray-600"
                      >
                        <HiTrash className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </Dropdown>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Save Modal */}
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
              {totalImages > 0 && (
                <Alert color="info">
                  This album will contain {totalImages} images across {getCurrentAlbumData().pages?.length || 0} pages.
                </Alert>
              )}
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleSaveCurrentAlbum}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          size="md"
        >
          <div className="p-6">
            <div className="mb-4 flex items-center">
              <HiOutlineExclamationCircle className="mr-2 h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Album
              </h3>
            </div>
            
            <div className="text-center">
              <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete the album "{selectedAlbum?.name}"?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. All images and settings in this album will be permanently deleted.
              </p>
            </div>
            
            <div className="mt-6 flex gap-2 justify-center">
              <Button
                color="failure"
                onClick={handleDeleteAlbum}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                Yes, Delete
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <Modal
          show={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          size="md"
        >
          <div className="p-6">
            <div className="mb-4 flex items-center">
              <HiDuplicate className="mr-2 h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Duplicate Album
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="duplicateName" value="New Album Name *" />
                <TextInput
                  id="duplicateName"
                  type="text"
                  placeholder="Enter name for the duplicate..."
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  className="mt-1"
                  autoFocus
                />
              </div>
              <Alert color="info">
                This will create an exact copy of "{selectedAlbum?.name}" with all images and settings.
              </Alert>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleDuplicateAlbum}
                disabled={!duplicateName.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <Spinner size="sm" className="mr-2" /> : <HiDuplicate className="mr-2 h-4 w-4" />}
                Create Duplicate
              </Button>
              <Button color="gray" onClick={() => setShowDuplicateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AlbumsTab;