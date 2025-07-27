import React from "react";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";

const TabNavigation = ({
  activeTab,
  setActiveTab,
  totalImages,
  hasSettingsErrors,
}) => {
  const tabs = [
    {
      id: "upload",
      label: "1. Upload Images",
      disabled: activeTab !== "upload" && totalImages > 0,
    },
    {
      id: "designStyle",
      label: "2. Design Style",
      disabled: activeTab === "upload" || totalImages === 0,
    },
    {
      id: "settings",
      label: "3. Settings",
      disabled: activeTab === "upload" || activeTab === "designStyle" || totalImages === 0,
    },
    {
      id: "design",
      label: "4. Design Layout",
      disabled:
        activeTab === "upload" ||
        activeTab === "designStyle" ||
        activeTab === "settings",
        // totalImages === 0 ||
        // hasSettingsErrors,
    },
  ];

  return (
    <Breadcrumb aria-label="Navigation tabs" className="bg-gray-50 dark:bg-gray-800 px-5 py-3">
      {tabs.map((tab) => (
        <BreadcrumbItem
          key={tab.id}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (!tab.disabled) {
              setActiveTab(tab.id);
            }
          }}
          className={
            tab.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }
        >
          {tab.label}
          {tab.id === "design" && totalImages > 0 && ` (${totalImages} images)`}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default TabNavigation;
