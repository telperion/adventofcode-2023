"use client";

import React, { DragEvent, useState } from 'react';

type FileDropProps = {
    passData: (d: string) => void;
}

const FileDrop: React.FC<FileDropProps> = (props) => {
    // https://claritydev.net/blog/react-typescript-drag-drop-file-upload-guide
    const [isOver, setIsOver] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [data, setData] = useState<string>("");
   
    // Define the event handlers
    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsOver(true);
    };
   
    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsOver(false);
    };
   
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsOver(false);
   
      // Fetch the files
      const droppedFiles = Array.from(event.dataTransfer.files);
      setFiles(droppedFiles);
   
      // Use FileReader to read file content
      droppedFiles.forEach((file) => {
        const reader = new FileReader();
   
        reader.onloadend = () => {
          // console.log(reader.result);
          setData(reader.result ? reader.result.toString() : "");
          props.passData(reader.result ? reader.result.toString() : "");
        };
   
        reader.onerror = () => {
          console.error('There was an issue reading the file.');
        };
   
        reader.readAsText(file, 'UTF-8');
        return reader;
      });
    };
        
    return (
        <div
            className="flex rounded-md p-6 basis-1/4 w-3/4 items-center justify-center bg-lime-900 hover:bg-lime-600"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div>Drag and drop the input data here</div>
        </div>
    )
}

export default FileDrop;
