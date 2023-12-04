"use client";

const title = "Day 1: Trebuchet?!"

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import FileDrop from '../refs/filedrop';

export default function Day01Component() {
    const [data, setData] = useState<string>("");
    const [result1, setResult1] = useState<string>("");
    const [result2, setResult2] = useState<string>("");

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        var digits: Array<{ line: string, first: number; last: number }> = [];
        var total: number = 0;

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

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

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
            for (let i = 0; i < s.length; i++)
            {
                digitMap.forEach((v, k) => {
                    //console.log(`${k}: ${v} - ${fi}, ${li}`)
                    if (f == -1 && s.substr(           i, k.length) == k)
                    {
                        f = v;
                    }
                    if (l == -1 && s.substr(s.length-i-1, k.length) == k)
                    {
                        l = v;
                    }
                })
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
            console.log(`first: ${element.first}, last: ${element.last} -> total: ${total} (line: ${element.line})`);
        })

        setResult2(total.toString());

        // Part 2 end
        /*************************************************************/
    }, [data])
    
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-6">
            <div className="flex text-3xl">{title}</div>
            <FileDrop passData={(d: string) => {setData(d)}} />
            <div className="flex basis-1/12 flex-row items-center justify-center w-3/4">
                <div className="min-w-fit p-6">Result 1:&nbsp;</div>
                <div className="grow text-right bg-lime-950 p-6">{result1}</div>
            </div>
            <div className="flex basis-1/12 flex-row items-center justify-center w-3/4">
                <div className="min-w-fit p-6">Result 2:&nbsp;</div>
                <div className="grow text-right bg-lime-950 p-6">{result2}</div>
            </div>
            <Link className="flex text-xl underline text-lime-500 hover:text-lime-200" href="/">Return home</Link>
        </div>
    )
}
