import React from "react";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { HiHome } from "react-icons/hi";

const TabNavigation = ({
  activeTab,
  setActiveTab,
  totalImages,
  hasSettingsErrors,
  onGoToAlbums,
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
      data-testid="tab-breadcrumb"
    >
      {/* Home icon */}
      {onGoToAlbums && (
        <BreadcrumbItem
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onGoToAlbums();
          }}
          className="cursor-pointer"
          title="Go to My Albums"
          data-testid="nav-home"
        >
          <HiHome className="h-4 w-4" />
        </BreadcrumbItem>
      )}

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
          data-testid={`nav-${tab.id}`}
        >
          {tab.label}
          {tab.id === "design" && totalImages > 0 && ` (${totalImages} images)`}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default TabNavigation;
