import React, { useState } from "react";
import { Card, Button } from "flowbite-react";
import {
  DESIGN_STYLES,
  DESIGN_STYLE_LABELS,
  DESIGN_STYLE_DESCRIPTIONS,
} from "../constants.js";

const DesignStyleTab = ({ settings, onSettingsChange, onNext }) => {
  const handleDesignStyleChange = (designStyle) => {
    onSettingsChange({
      ...settings,
      designStyle,
    });
  };

  const isFullCover = settings.designStyle === DESIGN_STYLES.FULL_COVER;

  return (
    <div className="space-y-6 p-6">
      <Card>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Choose Design Style
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Select how you want your images to be arranged in the PDF.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {Object.entries(DESIGN_STYLES).map(([key, value]) => (
            <div
              key={value}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                settings.designStyle === value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
              onClick={() => handleDesignStyleChange(value)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    {DESIGN_STYLE_LABELS[value]}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {DESIGN_STYLE_DESCRIPTIONS[value]}
                  </p>
                </div>
                <div className="ml-4">
                  {settings.designStyle === value && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isFullCover && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Full Cover Mode:</strong> Images will cover the entire
              page without gaps or margins. Gap and margin settings will be
              automatically set to zero.
            </p>
          </div>
        )}

        <div className="flex flex-col items-start gap-2 pt-6">
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Next: Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DesignStyleTab;
