import React from "react";
import { Button } from "flowbite-react";

const AddPageSection = ({ onAddPage, position, title }) => {
  return (
    <div className="flex justify-center p-2">
      <Button
        size="sm"
        color="light"
        onClick={onAddPage}
        title={title}
        className="flex h-8 w-8 items-center justify-center rounded-full p-0"
      >
        +
      </Button>
    </div>
  );
};

export default AddPageSection;
