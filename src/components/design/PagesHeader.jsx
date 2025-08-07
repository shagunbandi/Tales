import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  Label,
  Spinner,
} from "flowbite-react";
import { HiSave, HiCheck } from "react-icons/hi";

const PagesHeader = ({
  isProcessing,
  availableImages,
  totalImages,
  onAutoArrange,
  onSaveAlbum,
  currentAlbumId,
  currentAlbumName,
  lastSaveTime,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState("");

  // Function to format last save time
  const formatLastSaveTime = (timestamp) => {
    if (!timestamp) return "";

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `saved ${minutes}m ago`;
    } else if (seconds > 0) {
      return `saved ${seconds}s ago`;
    } else {
      return "saved just now";
    }
  };

  // Update time display every minute
  useEffect(() => {
    if (lastSaveTime) {
      setTimeDisplay(formatLastSaveTime(lastSaveTime));

      const interval = setInterval(() => {
        setTimeDisplay(formatLastSaveTime(lastSaveTime));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    } else {
      setTimeDisplay("");
    }
  }, [lastSaveTime]);

  // Auto-fill album name when we have a current album
  React.useEffect(() => {
    if (currentAlbumName && !albumName) {
      setAlbumName(currentAlbumName);
    }
  }, [currentAlbumName, albumName]);

  const handleSaveAlbum = async () => {
    if (!albumName.trim()) return;

    setIsSaving(true);

    try {
      console.log(`Starting save operation for "${albumName}"...`);
      const startTime = Date.now();

      // Pass the current album ID to auto-overwrite existing albums
      const savedId = await onSaveAlbum(
        albumName,
        albumDescription,
        currentAlbumId,
      );

      const endTime = Date.now();
      console.log(`Save operation completed in ${endTime - startTime}ms`);

      if (savedId) {
        setShowSaveModal(false);
        // Don't clear the form if it's an existing album
        if (!currentAlbumId) {
          setAlbumName("");
          setAlbumDescription("");
        }
      } else {
        toast.error("Failed to save album");
      }
    } catch (error) {
      console.error(`Save operation failed:`, error);
      toast.error("Failed to save album");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick save function for existing albums
  const handleQuickSave = async () => {
    if (currentAlbumId && currentAlbumName) {
      setIsSaving(true);

      try {
        console.log("Starting update operation...");
        const startTime = Date.now();

        // Use progress toast for save operation
        const savedId = await onSaveAlbum(currentAlbumName, "", currentAlbumId);

        const endTime = Date.now();
        console.log(`Update operation completed in ${endTime - startTime}ms`);

        // The onSaveAlbum function already shows success/error toasts
        // We only show error if the operation returns null/undefined
        if (!savedId) {
          toast.error("Failed to update album");
        }
      } catch (error) {
        console.error("Update operation failed:", error);
        toast.error("Failed to update album");
      } finally {
        setIsSaving(false);
      }
    } else {
      setShowSaveModal(true);
    }
  };
  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                PDF Pages - Arrange your images on pages
              </h3>
              {timeDisplay && lastSaveTime && (
                <div className="mt-1 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <HiCheck className="h-3 w-3" />
                  <span>{timeDisplay}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {currentAlbumId ? (
            <>
              <Button
                onClick={handleQuickSave}
                disabled={totalImages === 0 || isProcessing || isSaving}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <HiSave className="mr-2 h-4 w-4" />
                )}
                {isSaving ? "Updating..." : `Update "${currentAlbumName}"`}
              </Button>
              <Button
                onClick={() => setShowSaveModal(true)}
                disabled={totalImages === 0 || isProcessing || isSaving}
                variant="outline"
                size="sm"
              >
                Save As New...
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowSaveModal(true)}
              disabled={totalImages === 0 || isProcessing || isSaving}
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
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleSaveAlbum}
                disabled={!albumName.trim() || isProcessing || isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing || isSaving ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <HiSave className="mr-2 h-4 w-4" />
                )}
                {isSaving ? "Saving..." : "Save Album"}
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
