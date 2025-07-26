import React from "react";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";

const AddPageSection = ({ onAddPage, position, title }) => {
  return (
    <div className="flex justify-center py-1">
      <Button
        size="sm"
        color="light"
        onClick={onAddPage}
        title={title}
        className="flex h-8 w-8 items-center justify-center rounded-full p-0"
      >
        <HiPlus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AddPageSection;
