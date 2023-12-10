"use client"

const title = "Day 10: Pipe Maze"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'
import internal from 'stream'
import { isStringObject } from 'util/types'
import { debug } from 'console'

export default function Day09Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")
    const [debugDisplay, setDebugDisplay] = useState<string>("")

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        var lines = data.split("\n")
        lines.forEach((l) => (l.trim()))
        lines = lines.filter((l) => (l != ""))

        var farthestDistance = -1
        var animalRow: number = -1
        var animalCol: number = -1

        var landscape: Array<Array<number>> = []
        var width = lines[0]?.trim().length || 0
        var height = lines.length
        for (let r = 0; r < height; r++) {
            landscape.push(new Array<number>(width).fill(Infinity))
            var foundAnimal = lines[r].indexOf("S")
            if (foundAnimal != -1) {
                animalRow = r
                animalCol = foundAnimal
            }
        }
        console.log(`${width}W x ${height}H`)

        type FillDistanceOperation = {
            r: number
            c: number
            fill: number
        }
        var fillDistanceOps: Stack<FillDistanceOperation> = []
        
        function fillDistanceMemo(r: number, c: number, fill: number) {
            if ((r < 0) || (r >= height)) {
                return
            }
            if ((c < 0) || (c >= width)) {
                return
            }

            if (lines[r][c] != "." && landscape[r][c] > fill)
            {
                landscape[r][c] = fill
            
                /*
                console.log(`[ ${lines[r][c]} @ ${c}, ${r} -> ${fill} vs. ${landscape[r][c]}` )
                landscape.forEach((l) => {
                    console.log(l.map((v) => (v == Infinity ? "XXX" : v.toString().padStart(v.toString().length, " "))).join(", "))
                })
                console.log("]")
                */

                switch (lines[r][c])
                {
                    case "S":   if (c > 0        && ["-", "L", "F"].includes(lines[r][c-1])) { fillDistanceOps.push({r: r,   c: c-1, fill: fill+1}) }
                                if (c < width-1  && ["-", "J", "7"].includes(lines[r][c+1])) { fillDistanceOps.push({r: r,   c: c+1, fill: fill+1}) }
                                if (r > 0        && ["|", "7", "F"].includes(lines[r-1][c])) { fillDistanceOps.push({r: r-1, c: c,   fill: fill+1}) }
                                if (r < height-1 && ["|", "L", "J"].includes(lines[r+1][c])) { fillDistanceOps.push({r: r+1, c: c,   fill: fill+1}) }
                                break
                    case "|":   fillDistanceOps.push({r: r-1, c: c,   fill: fill+1})
                                fillDistanceOps.push({r: r+1, c: c,   fill: fill+1})
                                break
                    case "-":   fillDistanceOps.push({r: r,   c: c-1, fill: fill+1})
                                fillDistanceOps.push({r: r,   c: c+1, fill: fill+1})
                                break
                    case "L":   fillDistanceOps.push({r: r-1, c: c,   fill: fill+1})
                                fillDistanceOps.push({r: r,   c: c+1, fill: fill+1})
                                break
                    case "J":   fillDistanceOps.push({r: r-1, c: c,   fill: fill+1})
                                fillDistanceOps.push({r: r,   c: c-1, fill: fill+1})
                                break
                    case "7":   fillDistanceOps.push({r: r+1, c: c,   fill: fill+1})
                                fillDistanceOps.push({r: r,   c: c-1, fill: fill+1})
                                break
                    case "F":   fillDistanceOps.push({r: r+1, c: c,   fill: fill+1})
                                fillDistanceOps.push({r: r,   c: c+1, fill: fill+1})
                                break
                }
            }
        }
        if (animalRow != -1 && animalCol != -1) {
            fillDistanceOps.push({r: animalRow, c: animalCol, fill: 0})
        }
        for (let i = 0; i < 1000000000 && fillDistanceOps.length > 0; i++)
        {
            var op = fillDistanceOps.shift()
            fillDistanceMemo(op.r, op.c, op.fill)

            if (i % 100 == 0) {
                console.log(fillDistanceOps.map((f: FillDistanceOperation) => (`${f.c}, ${f.r} -> ${f.fill}`)))
            }
        }

        console.log("[")
        var debugAcc = ""
        var testLoopness = new Map<number, number>()
        landscape.forEach((l) => {
            var thisLine = l.map((v) => (v == Infinity ? "-100" : v.toString().padStart(4, " "))).join(", ")
            console.log(thisLine)
            debugAcc += thisLine + "\n"

            l.forEach((v) => {testLoopness.set(v, 1 + (testLoopness.get(v) || 0))})
        })
        console.log("]")

        var maxDistance = landscape.reduce(
            (acc, v) => Math.max(acc, v.map((x) => (x == Infinity ? -1 : x)).reduce(
                (a, b) => Math.max(a, b)
            , 0))
        , 0)

        testLoopness.forEach((v, k) => {
            if (v != 2) {
                console.log(`A distance of ${k} occurred ${v} times in the loop`)
            }
        })

        setResult1(maxDistance.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin
        var totalContinuations: number = 0

        lines.forEach( (l) => {
            var seq: Array<number> = l.split(/\s+/)
                                      .filter((v) => (v != ""))
                                      .map((v) => (parseInt(v)))
            if (seq.length < 2) {
                return
            }
            seq = seq.reverse()
            var c: number = seq[seq.length-1] + continueSequence(seq)
            console.log(`${seq}: ${c}`)
            totalContinuations += c
        })

        setResult2(totalContinuations.toString())

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
            <div className="hidden flex basis-1/2 flex-row items-center justify-center w-3/4">
                <div className="min-w-fit p-6">Debug:&nbsp;</div>
                <div className="grow text-right bg-lime-950 p-6 font-mono text-xs whitespace-pre">{debugDisplay}</div>
            </div>
            <Link className="flex text-xl underline text-lime-500 hover:text-lime-200" href="/">Return home</Link>
        </div>
    )
}
