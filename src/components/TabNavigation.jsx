import React from "react";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";

const TabNavigation = ({
  activeTab,
  setActiveTab,
  totalImages,
  hasSettingsErrors,
}) => {
  const tabs = [
    { id: "upload", label: "1. Upload Images", disabled: totalImages > 0 },
    { id: "settings", label: "2. Settings", disabled: totalImages === 0 },
    {
      id: "design",
      label: "3. Design Layout",
      disabled: totalImages === 0 || hasSettingsErrors,
    },
  ];

  return (
    <Breadcrumb aria-label="Navigation tabs" className="bg-gray-50 px-5 py-3">
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
        >
          {tab.label}
          {tab.id === "design" && totalImages > 0 && ` (${totalImages} images)`}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default TabNavigation;
