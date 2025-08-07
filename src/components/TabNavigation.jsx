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
      id: "designStyle",
      label: "Design Style",
      disabled:
        activeTab !== "designStyle" &&
        activeTab !== "settings" &&
        activeTab !== "design",
    },
    {
      id: "settings",
      label: "Settings",
      disabled: activeTab !== "settings" && activeTab !== "design",
    },
    {
      id: "design",
      label: "Design Layout",
      disabled: activeTab !== "design",
    },
  ];

  return (
    <Breadcrumb
      aria-label="Navigation tabs"
      className="bg-gray-50 px-5 py-3 dark:bg-gray-800"
    >
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
            tab.disabled
              ? "cursor-not-allowed opacity-50"
              : activeTab === tab.id
                ? "cursor-pointer font-semibold text-gray-900 dark:text-white"
                : "cursor-pointer"
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
