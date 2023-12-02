"use client";

import React, { DragEvent, useEffect, useState } from 'react';

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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60px',
                width: '300px',
                border: '1px dotted',
                backgroundColor: isOver ? 'lightgray' : 'darkgray',
            }}
        >
            Drag and drop the input data here
        </div>
    )
}

export default function Day01Component() {
    const [data, setData] = useState<string>("");
    const [result1, setResult1] = useState<string>("");
    const [result2, setResult2] = useState<string>("");

    useEffect(() => {
        var digits: Array<{ line: string, first: number; last: number }> = [];
        var total: number = 0;

        // console.log(data.split("\n"))

        for (let s of data.split("\n"))
        {
            var f = -1;
            var l = -1;
            for (let c of s) {
                var x = parseInt(c);
                if (!isNaN(x)) {
                    if (f < 0) { f = x; }
                                 l = x;
                }
            }
            if (f >= 0 && l >= 0)
            {
                digits.push({
                    line: s,
                    first: f,
                    last: l
                })
            }
        }

        digits.forEach(element => {
            total += (element.first * 10) + (element.last);
            console.log(`first: ${element.first}, last: ${element.last} -> total: ${total}`);
        })

        setResult1(total.toString());

        digits = [];
        total = 0;

        const digitMap = new Map([
            ["zero",  0],
            ["one",   1],
            ["two",   2],
            ["three", 3],
            ["four",  4],
            ["five",  5],
            ["six",   6],
            ["seven", 7],
            ["eight", 8],
            ["nine",  9],
            ["0", 0],
            ["1", 1],
            ["2", 2],
            ["3", 3],
            ["4", 4],
            ["5", 5],
            ["6", 6],
            ["7", 7],
            ["8", 8],
            ["9", 9]
        ]);
        console.log(digitMap);

        for (let s of data.split("\n"))
        {
            var f = -1;
            var l = -1;
            digitMap.forEach((v, k) => {
                let fi = s.indexOf(k), li = s.lastIndexOf(k);
                //console.log(`${k}: ${v} - ${fi}, ${li}`)
                if ((fi != -1) && ((fi < f) || (f == -1)))
                {
                    f = v;
                }
                if ((li != -1) && ((li > l) || (l == -1)))
                {
                    l = v;
                }
            })
            if (f >= 0 && l >= 0)
            {
                digits.push({
                    line: s,
                    first: f,
                    last: l
                })
            }
        }

        digits.forEach(element => {
            total += (element.first * 10) + (element.last);
            console.log(`first: ${element.first}, last: ${element.last} -> total: ${total} (line: ${element.line})`);
        })

        setResult2(total.toString());



    }, [data])
    
    return (
        <>
            <FileDrop passData={(d: string) => {setData(d)}} />
            <div>
                <h1>Result 1: {result1}</h1>
            </div>
            <div>
                <h1>Result 2: {result2}</h1>
            </div>
        </>
    )
}
