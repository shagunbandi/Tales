import React, { useState, useEffect } from "react";
import { Button } from "flowbite-react";
import { HiX, HiCheck, HiRefresh } from "react-icons/hi";

const SimpleImageEditModal = ({ isOpen, onClose, onSave, image }) => {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (isOpen && image) {

      setScale(image.scale || 1);
      setOffsetX(image.cropOffsetX || 0);
      setOffsetY(image.cropOffsetY || 0);
    }
  }, [isOpen, image]);

  const handleSave = () => {

    onSave({
      scale,
      cropOffsetX: offsetX,
      cropOffsetY: offsetY,
    });
    onClose();
  };

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  if (!isOpen) {

    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80%",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
            Edit Image
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {image && (
          <div style={{ marginBottom: "20px" }}>
            <img
              src={image.originalSrc || image.src}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Scale: {scale.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Horizontal Offset: {offsetX}px
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={offsetX}
            onChange={(e) => setOffsetX(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Vertical Offset: {offsetY}px
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={offsetY}
            onChange={(e) => setOffsetY(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <Button color="gray" onClick={handleReset}>
            <HiRefresh className="mr-2 h-4 w-4" />
            Reset
          </Button>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button color="gray" onClick={onClose}>
              <HiX className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button color="blue" onClick={handleSave}>
              <HiCheck className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageEditModal;
