import React, { useState } from "react";
import toast from "react-hot-toast";
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
} from "flowbite-react";
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
} from "react-icons/hi";
import { useAlbumStorage } from "../hooks/useAlbumStorage.js";

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
  setShowNavigation,
  setCurrentAlbumName,
  setCurrentAlbumId,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [duplicateName, setDuplicateName] = useState("");

  // Get sorted albums by modification date (most recent first)
  const sortedAlbums = getSortedAlbums("modified", "desc");

  const handleCreateNewAlbum = async () => {
    if (!albumName.trim()) return;

    // Set album info and navigate to design style
    setCurrentAlbumName(albumName);
    setCurrentAlbumId(null); // New album
    setShowCreateModal(false);
    setAlbumName("");
    setAlbumDescription("");
    setShowNavigation(true);
    setActiveTab("designStyle");

    toast.success(`🎨 Creating new album "${albumName}"!`);
  };

  const handleLoadAlbum = async (albumId) => {
    // Show loading toast
    const loadingToast = toast.loading("Loading album...", { duration: 0 });

    try {
      const album = await loadAlbumById(albumId);
      if (album) {
        toast.dismiss(loadingToast);
        toast.success(`📖 Album "${album.name}" loaded!`, { icon: "✅" });
        setShowNavigation(true);
        setActiveTab("design"); // Navigate to design tab after loading
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to load album");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to load album");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;

    // Show deleting toast
    const deletingToast = toast.loading(
      `Deleting album "${selectedAlbum.name}"...`,
      { duration: 0 },
    );

    try {
      const success = await deleteAlbum(selectedAlbum.id, selectedAlbum.name);
      toast.dismiss(deletingToast);

      if (success) {
        setShowDeleteModal(false);
        setSelectedAlbum(null);
        // Success toast is already handled by the deleteAlbum function
      } else {
        toast.error("Failed to delete album");
      }
    } catch (error) {
      toast.dismiss(deletingToast);
      toast.error("Failed to delete album");
    }
  };

  const handleDuplicateAlbum = async () => {
    if (!selectedAlbum || !duplicateName.trim()) return;

    // Show duplicating toast
    const duplicatingToast = toast.loading(
      `Creating duplicate of "${selectedAlbum.name}"...`,
      { duration: 0 },
    );

    try {
      const duplicatedId = await duplicateAlbum(
        selectedAlbum.id,
        duplicateName,
      );
      toast.dismiss(duplicatingToast);

      if (duplicatedId) {
        setShowDuplicateModal(false);
        setSelectedAlbum(null);
        setDuplicateName("");
        // Success toast is already handled by the duplicateAlbum function
      } else {
        toast.error("Failed to create duplicate album");
      }
    } catch (error) {
      toast.dismiss(duplicatingToast);
      toast.error("Failed to create duplicate album");
    }
  };

  const handleExportAlbum = async (albumId, albumName) => {
    // Show exporting toast
    const exportingToast = toast.loading(`Exporting album "${albumName}"...`, {
      duration: 0,
    });

    try {
      await exportAlbum(albumId);
      toast.dismiss(exportingToast);
      // Success toast is already handled by the exportAlbum function
    } catch (error) {
      toast.dismiss(exportingToast);
      toast.error("Failed to export album");
    }
  };

  const handleImportAlbum = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        // Show importing toast
        const importingToast = toast.loading(
          `Importing album from "${file.name}"...`,
          { duration: 0 },
        );

        try {
          const importedId = await importAlbum(file);
          toast.dismiss(importingToast);

          if (importedId) {
            await loadAllAlbums(); // Refresh the list
            // Success toast is already handled by the importAlbum function
          } else {
            toast.error("Failed to import album");
          }
        } catch (error) {
          toast.dismiss(importingToast);
          toast.error("Failed to import album");
        }
      }
    };
    input.click();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
            Load an existing album or create a new one
          </p>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create New Album Card */}
        <Card className="group border-2 border-dashed border-gray-300 transition-shadow hover:shadow-lg dark:border-gray-600">
          <div className="flex h-40 w-full items-center justify-center rounded-t-lg bg-gray-50 dark:bg-gray-800">
            <HiPlus className="h-12 w-12 text-gray-400" />
          </div>
          <div className="p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Album
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start a new photo album project
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <HiPlus className="mr-2 h-4 w-4" />
              Create Album
            </Button>
          </div>
        </Card>

        {/* Existing Albums */}
        {sortedAlbums.map((album) => (
          <Card
            key={album.id}
            className="group transition-shadow hover:shadow-lg"
          >
            {/* Thumbnail */}
            {album.thumbnail ? (
              <img
                src={album.thumbnail}
                alt={album.name}
                className="h-40 w-full rounded-t-lg object-cover"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center rounded-t-lg bg-gray-200 dark:bg-gray-700">
                <HiPhotograph className="h-12 w-12 text-gray-400" />
              </div>
            )}

            <div className="p-4">
              {/* Album Info */}
              <div className="mb-3">
                <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {album.name}
                </h3>
                {album.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
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
                <Button
                  onClick={() => {
                    setSelectedAlbum(album);
                    setShowDeleteModal(true);
                  }}
                  size="xs"
                  className="border-red-500 bg-red-500 text-white hover:border-red-600 hover:bg-red-600 dark:border-red-600 dark:bg-red-600 dark:hover:border-red-700 dark:hover:bg-red-700"
                  disabled={isLoading || isProcessing}
                >
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create New Album Modal */}
      {showCreateModal && (
        <Modal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          size="md"
        >
          <div className="p-6">
            <div className="mb-4 flex items-center">
              <HiPlus className="mr-2 h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Album
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
                <Label
                  htmlFor="albumDescription"
                  value="Description (optional)"
                />
                <Textarea
                  id="albumDescription"
                  placeholder="Enter album description..."
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Alert color="info">
                You'll be guided through selecting a design style, configuring
                settings, and adding images.
              </Alert>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleCreateNewAlbum}
                disabled={!albumName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <HiPlus className="mr-2 h-4 w-4" />
                Create & Continue
              </Button>
              <Button color="gray" onClick={() => setShowCreateModal(false)}>
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
                Are you sure you want to delete the album "{selectedAlbum?.name}
                "?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. All images and settings in this
                album will be permanently deleted.
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-2">
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
    </div>
  );
};

export default AlbumsTab;
