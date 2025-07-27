import React from "react";
import { Card, Button } from "flowbite-react";
import { DESIGN_STYLES, DESIGN_STYLE_LABELS, DESIGN_STYLE_DESCRIPTIONS } from "../constants.js";

const DesignStyleTab = ({ settings, onSettingsChange, onNext }) => {
  const handleDesignStyleChange = (designStyle) => {
    const newSettings = { ...settings, designStyle };
    
    // For full cover design, set gap and margin to 0
    if (designStyle === DESIGN_STYLES.FULL_COVER) {
      newSettings.imageGap = 0;
      newSettings.pageMargin = 0;
    }
    
    onSettingsChange(newSettings);
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

        <div className="space-y-4 mt-6">
          {Object.entries(DESIGN_STYLES).map(([key, value]) => (
            <div
              key={value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                settings.designStyle === value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
              onClick={() => handleDesignStyleChange(value)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    {DESIGN_STYLE_LABELS[value]}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {DESIGN_STYLE_DESCRIPTIONS[value]}
                  </p>
                </div>
                <div className="ml-4">
                  {settings.designStyle === value && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isFullCover && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Full Cover Mode:</strong> Images will cover the entire page without gaps or margins. 
              Gap and margin settings will be automatically set to zero.
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