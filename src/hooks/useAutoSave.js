import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * Hook for auto-saving album data every minute
 */
export const useAutoSave = ({
  pages,
  availableImages,
  saveCurrentAsAlbum,
  enabled = false,
  intervalMs = 60000, // 1 minute
  currentAlbumId = null,
  currentAlbumName = "Auto-saved Album",
}) => {
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const intervalRef = useRef(null);
  const lastDataRef = useRef(null);

  const hasChanges = useCallback(() => {
    const currentData = {
      pages: pages.length,
      availableImages: availableImages.length,
      // Simple hash of page contents for change detection
      pagesHash: pages.map((page) => ({
        id: page.id,
        imageCount: page.images.length,
        color: page.color,
      })),
    };

    const lastData = lastDataRef.current;
    if (!lastData) return true;

    // Check for changes
    if (currentData.pages !== lastData.pages) return true;
    if (currentData.availableImages !== lastData.availableImages) return true;

    // Check page changes
    if (currentData.pagesHash.length !== lastData.pagesHash.length) return true;

    for (let i = 0; i < currentData.pagesHash.length; i++) {
      const current = currentData.pagesHash[i];
      const last = lastData.pagesHash[i];
      if (
        !last ||
        current.id !== last.id ||
        current.imageCount !== last.imageCount ||
        current.color !== last.color
      ) {
        return true;
      }
    }

    return false;
  }, [pages, availableImages]);

  const performAutoSave = useCallback(async () => {
    if (!enabled || isAutoSaving || pages.length === 0 || !hasChanges()) {
      return;
    }

    setIsAutoSaving(true);
    try {
      const albumName = currentAlbumName || "Auto-saved Album";
      const savedId = await saveCurrentAsAlbum(
        albumName,
        "Automatically saved work",
        currentAlbumId,
      );

      if (savedId) {
        setLastSaveTime(Date.now());

        // Update last data reference
        lastDataRef.current = {
          pages: pages.length,
          availableImages: availableImages.length,
          pagesHash: pages.map((page) => ({
            id: page.id,
            imageCount: page.images.length,
            color: page.color,
          })),
        };

        // Show subtle success toast
        toast.success("🤖 Auto-saved your work", {
          duration: 2000,
          style: {
            background: "#10b981",
            color: "#ffffff",
            fontSize: "13px",
          },
          icon: "💾",
        });
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Don't show error toast for auto-save failures to avoid noise
    } finally {
      setIsAutoSaving(false);
    }
  }, [
    enabled,
    isAutoSaving,
    pages,
    availableImages,
    hasChanges,
    saveCurrentAsAlbum,
    currentAlbumId,
    currentAlbumName,
  ]);

  // Start auto-save interval
  useEffect(() => {
    if (enabled && pages.length > 0) {
      intervalRef.current = setInterval(performAutoSave, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [enabled, intervalMs, performAutoSave, pages.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const enableAutoSave = useCallback(() => {
    if (!intervalRef.current && pages.length > 0) {
      intervalRef.current = setInterval(performAutoSave, intervalMs);
    }
  }, [performAutoSave, intervalMs, pages.length]);

  const disableAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const manualSave = useCallback(async () => {
    await performAutoSave();
  }, [performAutoSave]);

  return {
    lastSaveTime,
    isAutoSaving,
    enableAutoSave,
    disableAutoSave,
    manualSave,
    hasUnsavedChanges: hasChanges(),
  };
};
