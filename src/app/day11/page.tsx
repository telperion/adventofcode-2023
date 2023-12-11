"use client"

const title = "Day 11: Cosmic Expansion"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'


// Account for galactic expansion...
function galacticExpansion(field: Array<string>, mult: number): Array<number> {
    var galacticMultiplier = Array<number>(field.length).fill(1)
    for (let r = 0; r < field.length; r++) {
        var emptyLine = ".".repeat(field[r].length)
        if (field[r] == emptyLine) {
            galacticMultiplier[r] = mult
        }
    }
    return galacticMultiplier
}

function flipRC(field: Array<string>): Array<string> {
    var newField = Array<string>(field[0]?.length || 0).fill("")
    field.forEach((l) => {
        for (let i = 0; i < l.length; i++) {
            newField[i] += l[i]
        }
    })
    return newField
}

type Galaxy = {
    r: number
    c: number
}

function calcTotalIntergalacticDistance(field: Array<string>, mult: number): number {
    // Account for galactic expansion...
    var geRow = galacticExpansion(field, mult)
    var flipField = flipRC(field)
    var geCol = galacticExpansion(flipField, mult)

    // Find galaxy coordinates
    var galaxyLocations: Array<Galaxy> = []
    for (let r = 0; r < field.length; r++) {
        for (let c = 0; c < field[r].length; c++) {
            if (field[r][c] == "#") {
                galaxyLocations.push({
                    r: r,
                    c: c
                })
            }
        }
    }

    console.log(geRow)
    console.log(geCol)

    // Per-pair calculation
    var totalDistance = 0
    for (let i = 0; i < galaxyLocations.length; i++) {
        for (let j = i + 1; j < galaxyLocations.length; j++) {
            var gs = galaxyLocations[i]
            var gf = galaxyLocations[j]
            var rs = (gs.r < gf.r) ? gs.r : gf.r
            var rf = gs.r + gf.r - rs
            var cs = (gs.c < gf.c) ? gs.c : gf.c
            var cf = gs.c + gf.c - cs
            var dist = geRow.slice(rs, rf).reduce((a, b) => (a + b), 0)
                     + geCol.slice(cs, cf).reduce((a, b) => (a + b), 0)
            totalDistance += dist
            // console.log(`${i+1} @ ${gs.r}, ${gs.c} to ${j+1} @ ${gf.r}, ${gf.c}: ${dist}`)
        }
    }

    return totalDistance
}


export default function Day11Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")
    const [debugDisplay, setDebugDisplay] = useState<string>("")

    useEffect(() => {
        var lines = data.split(/\r?\n/)
        lines.forEach((l) => (l.trim()))
        lines = lines.filter((l) => (l != ""))
        var debugAcc = ""

        /*************************************************************/
        // Part 1 begin

        var totalDistance1 = calcTotalIntergalacticDistance(lines, 2)
        setResult1(totalDistance1.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var totalDistance2 = calcTotalIntergalacticDistance(lines, 1000000)
        setResult2(totalDistance2.toString())
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
