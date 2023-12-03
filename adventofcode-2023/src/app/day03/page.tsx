"use client";

const title = "Day 3: Gear Ratios"

import { listeners } from 'process';
import React, { useEffect, useState } from 'react';
import FileDrop from 'src/app/refs/filedrop';

export default function Day01Component() {
    const [data, setData] = useState<string>("");
    const [result1, setResult1] = useState<string>("");
    const [result2, setResult2] = useState<string>("");

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        type PartType = {
            x: number,
            y: number,
            part: string,
            isPart: boolean
        };

        var potentialParts: Array<PartType> = [];
        var parts: Array<PartType> = [];

        var lines = data.split("\n")
        lines.forEach( (l, y) => {
            var newPart: PartType | null = null;
            l.split("").forEach( (c, x) => {
                if (c >= "0" && c <= "9")
                {
                    if (!newPart)
                    {
                        newPart = {
                            x: x,
                            y: y,
                            part: "",
                            isPart: false
                        };
                    }
                    newPart.part += c;
                }
                else
                {
                    if (newPart)
                    {
                        potentialParts.push(newPart);
                        newPart = null;
                    }
                }
            })
            if (newPart)
            {
                potentialParts.push(newPart);
                newPart = null;
            }
        })
        console.log(potentialParts.length)

        lines.forEach( (l, y) => {
            l.split("").forEach( (c, x) => {
                if (c >= "0" && c <= "9") {}
                else if (c != ".")
                {
                    // Adjacency requirement
                    for (let i = potentialParts.length - 1; i >= 0; i--) {
                        var part = potentialParts[i];
                        var dx = x - part.x;
                        var dy = y - part.y;
                        if (dy >= -1 && dy <= 1)
                        {
                            // On the same or adjacent line
                            if (dx >= -1 && dx <= part.part.length)
                            {
                                // Within one column of beginning-to-end range of part number
                                part.isPart = true;
                                potentialParts.splice(i, 1);
                                parts.push(part);
                                console.log(`Part (${part.x}~${part.x+part.part.length-1}, ${part.y}: ${part.part}) confirmed by symbol "${c}" at (${x}, ${y})`)
                            }
                        }
                    }
                }
            })
        })

        var totalPartNumbers = 0;
        parts.forEach( (part) => {
            totalPartNumbers += parseInt(part.part);
        })
        potentialParts.forEach( (part) => {
            console.log(`Not a part: (${part.x}~${part.x+part.part.length-1}, ${part.y}: ${part.part})`)
        })
        console.log(parts.length)
        console.log(potentialParts.length)
        

        setResult1(totalPartNumbers.toString());

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        type GearType = {
            x: number,
            y: number,
            teeth: Array<string>,
            ratio: number
        };

        var gears: Array<GearType> = [];
        var gearParts: Array<PartType> = [];

        var lines = data.split("\n")
        lines.forEach( (l, y) => {
            var newPart: PartType | null = null;
            l.split("").forEach( (c, x) => {
                if (c >= "0" && c <= "9")
                {
                    if (!newPart)
                    {
                        newPart = {
                            x: x,
                            y: y,
                            part: "",
                            isPart: false
                        };
                    }
                    newPart.part += c;
                }
                else
                {
                    if (newPart)
                    {
                        gearParts.push(newPart);
                        newPart = null;
                    }
                }
            })
            if (newPart)
            {
                gearParts.push(newPart);
                newPart = null;
            }
        })
        console.log(gearParts.length)

        lines.forEach( (l, y) => {
            l.split("").forEach( (c, x) => {
                if (c == "*")
                {
                    var potentialGear: GearType = {
                        x: x,
                        y: y,
                        teeth: [],
                        ratio: 0
                    }

                    // Adjacency requirement
                    for (let i = gearParts.length - 1; i >= 0; i--) {
                        var part = gearParts[i];
                        var dx = x - part.x;
                        var dy = y - part.y;
                        if (dy >= -1 && dy <= 1)
                        {
                            // On the same or adjacent line
                            if (dx >= -1 && dx <= part.part.length)
                            {
                                // Within one column of beginning-to-end range of part number
                                potentialGear.teeth.push(part.part);
                            }
                        }
                    }

                    if (potentialGear.teeth.length == 2)
                    {
                        potentialGear.ratio = parseInt(potentialGear.teeth[0]) * parseInt(potentialGear.teeth[1]);
                        console.log(`Gear located at ${x}, ${y} (teeth: ${potentialGear.teeth[0]} * ${potentialGear.teeth[1]} = ${potentialGear.ratio})`)
                        gears.push(potentialGear);
                    }
                }
            })
        })

        var totalGearRatios = 0;
        gears.forEach( (gear) => {
            totalGearRatios += gear.ratio;
        })        

        setResult2(totalGearRatios.toString());

        // Part 2 end
        /*************************************************************/
    }, [data])
    
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-6">
            <div className="flex text-3xl">{title}</div>
            <FileDrop passData={(d: string) => {setData(d)}} />
            <div className="flex basis-1/12 flex-row items-center justify-center w-3/4">
                <div className="min-w-fit p-6">Result 1:&nbsp;</div>
                <div className="grow text-right bg-slate-900 p-6">{result1}</div>
            </div>
            <div className="flex basis-1/12 flex-row items-center justify-center w-3/4">
                <div className="min-w-fit p-6">Result 2:&nbsp;</div>
                <div className="grow text-right bg-slate-900 p-6">{result2}</div>
            </div>
        </div>
    )
}
