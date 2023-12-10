"use client"

const title = "Day 10: Pipe Maze"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

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
        var fillDistanceOps: Array<FillDistanceOperation> = []
        
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
                    case "S":   if (c > 0        && "-LF".includes(lines[r][c-1])) { fillDistanceOps.push({r: r,   c: c-1, fill: fill+1}) }
                                if (c < width-1  && "-J7".includes(lines[r][c+1])) { fillDistanceOps.push({r: r,   c: c+1, fill: fill+1}) }
                                if (r > 0        && "|7F".includes(lines[r-1][c])) { fillDistanceOps.push({r: r-1, c: c,   fill: fill+1}) }
                                if (r < height-1 && "|LJ".includes(lines[r+1][c])) { fillDistanceOps.push({r: r+1, c: c,   fill: fill+1}) }
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

        // Travel each row horizontally and look for pipe crossings.
        // Crossing a pipe that's part of the loop (landscape value finite)
        // means we flip parity between being inside or outside the loop.
        // If we cross a |, we flip for sure.
        // If we cross a L, we need to pair it with a 7 to engage a parity flip.
        // Same for      F                        and J.
        var groundLabeled = new Array<string>(lines.length).fill("")

        // I don't think the rules were super clear about this.
        // Is the animal living in a ground nest, or can the nest contain pipes?
        const onlyGround = false

        var startExits: number = 0
        if (animalCol > 0        && "-LF".includes(lines[animalRow][animalCol-1])) { startExits |= 1 }
        if (animalCol < width-1  && "-J7".includes(lines[animalRow][animalCol+1])) { startExits |= 2 }
        if (animalRow > 0        && "|7F".includes(lines[animalRow-1][animalCol])) { startExits |= 4 }
        if (animalRow < height-1 && "|LJ".includes(lines[animalRow+1][animalCol])) { startExits |= 8 }
        var startType: string = "???-?JL??7F?|???"[startExits]
        console.log(`Starting point replaced with ${startType}`)
        
        //var debugAcc = ""
        var totalInside = 0
        for (let r = 0; r < lines.length; r++) {
            var isInside: boolean = false
            var lastElbow: string = "X"

            for (let c = 0; c < lines[r].length; c++) {
                var t = lines[r][c]
                if (t == "S") {t = startType}
                if (onlyGround) {
                    if (t == ".") {
                        t = (isInside ? "I" : "O")
                    }
                }
                else {
                    if (landscape[r][c] == Infinity) {
                        t = (isInside ? "I" : "O")
                    }
                }
                var f = t
                if (landscape[r][c] != Infinity) {
                    switch (t) {
                        case "|": isInside = !isInside
                                break
                        case "F":
                        case "7": if ("LJ".includes(lastElbow)) {isInside = !isInside}
                                  lastElbow = (lastElbow == "X") ? t : "X"
                                  break
                        case "L":
                        case "J": if ("F7".includes(lastElbow)) {isInside = !isInside}
                                  lastElbow = (lastElbow == "X") ? t : "X"
                                  break
                    }
                }
                groundLabeled[r] += f
                if (f == "I") {totalInside++}
            }
            debugAcc += groundLabeled[r] + "\n"
        }

        setResult2(totalInside.toString())
        setDebugDisplay(debugAcc)

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
