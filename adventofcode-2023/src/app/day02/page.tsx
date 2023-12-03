"use client";

const title = "Day 2: Cube Conundrum"

import React, { useEffect, useState } from 'react';
import FileDrop from 'src/app/refs/filedrop';

export default function Day01Component() {
    const [data, setData] = useState<string>("");
    const [result1, setResult1] = useState<string>("");
    const [result2, setResult2] = useState<string>("");

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        var bagContents = new Map<string, number>([
            ["red", 12],
            ["green", 13],
            ["blue", 14]
        ])

        var totalIDCheck = 0;

        for (let s of data.split("\n"))
        {
            var gameRecord = s.match("Game (\\d+): (.*)")
            if (!gameRecord) { console.log(`Couldn't match ${s} to cube game format`); continue; }
            var gameIndex = parseInt(gameRecord[1])
            var gameValid = true;
            for (let d of gameRecord[2].split("; "))
            {
                for (let p of d.split(", "))
                {
                    var pull = p.match("(\\d+) (\\w+)")
                    if (!pull || pull.length < 3) { console.log(`Couldn't match ${p} to cube pull format`); continue; }
                    var bagHas = bagContents.get(pull[2]);
                    if (parseInt(pull[1]) > (bagHas ? bagHas : 0))
                    {
                        console.log(`${pull} exceeded the number of cubes in the bag. Game ${gameIndex} is invalid`)
                        gameValid = false;
                        break;
                    }
                }
                if (!gameValid) { break; }
            }
            if (gameValid)
            {
                console.log(`Game ${gameIndex} is valid`)
                totalIDCheck += gameIndex;
            }
        }

        setResult1(totalIDCheck.toString());

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        setResult2(totalIDCheck.toString());

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
