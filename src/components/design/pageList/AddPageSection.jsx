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
        className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
      >
        +
      </Button>
    </div>
  );
};

export default AddPageSection;
