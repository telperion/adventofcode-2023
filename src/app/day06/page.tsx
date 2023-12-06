"use client"

const title = "Day 6: Wait For It"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

function boatDistance(raceTime: number, heldTime: number): number
{
    // For each millisecond the button is held down, the button will move
    // that many millimeters per millisecond for the rest of the race time.
    return heldTime*(raceTime - heldTime)
}

function numOptionsToBeatRecord(raceTime: number, record: number): number
{
    // Take the inverse of the boat distance function wrt held time.
    // The two results are the beginning and end of the range that will
    // beat the record.
    // Just return the number of integers in that range.
    var loTime = (raceTime - Math.sqrt(raceTime * raceTime - 4 * record)) * 0.5
    var hiTime = (raceTime + Math.sqrt(raceTime * raceTime - 4 * record)) * 0.5
    console.log(`${raceTime} race time with ${record} record: ${loTime} (${boatDistance(raceTime, loTime)}) ~ ${hiTime} (${boatDistance(raceTime, hiTime)})`)
    return Math.ceil(hiTime) - Math.floor(loTime) - 1
}


export default function Day01Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        var lines = data.split("\n")
        var raceTimes  = new Array<number>()
        var records    = new Array<number>()
        var waysToBeat = new Array<number>()
        if (lines.length >= 2) {
            lines[0].substr(9)
                    .split(/\s+/)
                    .filter( (s) => {return (s != "")})
                    .forEach( (s) => {raceTimes.push(parseInt(s))} )
            lines[1].substr(9)
                    .split(/\s+/)
                    .filter( (s) => {return (s != "")})
                    .forEach( (s) => {records.push(parseInt(s))} )
            for (let i = 0; i < raceTimes.length; i++)
            {
                waysToBeat.push(numOptionsToBeatRecord(raceTimes[i], records[i]))
            }
            console.log(waysToBeat)
        }

        var totalWaysToBeat = 1
        waysToBeat.forEach( (w) => {
            totalWaysToBeat *= w
        })

        setResult1(totalWaysToBeat.toString())

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var lines = data.split("\n")
        var raceTimes  = new Array<number>()
        var records    = new Array<number>()
        var waysToBeat = new Array<number>()
        if (lines.length >= 2) {
            raceTimes.push(parseInt(
                lines[0].substr(9)
                        .split(/\s+/)
                        .filter( (s) => {return (s != "")})
                        .join("")
            ))
            records.push(parseInt(
                lines[1].substr(9)
                        .split(/\s+/)
                        .filter( (s) => {return (s != "")})
                        .join("")
            ))
            for (let i = 0; i < raceTimes.length; i++)
            {
                waysToBeat.push(numOptionsToBeatRecord(raceTimes[i], records[i]))
            }
            console.log(waysToBeat)
        }

        var totalWaysToBeat = 1
        waysToBeat.forEach( (w) => {
            totalWaysToBeat *= w
        })

        setResult2(totalWaysToBeat.toString())

        // Part 2 end
        /*************************************************************/
    }, [data])
    
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-6">
            <div className="flex text-3xl text-center">{title}</div>
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
