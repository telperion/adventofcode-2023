"use client"

const title = "Day 18: Lavaduct Lagoon"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = true
const LOOP_SENTINEL = 1000

type DigStep = {
    dir: number,
    // dir & 0b10 = verticality
    // dir & 0b01 = rightward/downward
    len: number,
    color: string
}
const ds = (s: DigStep) => (`${"<>^v"[s.dir]} ${s.len} (#${s.color})`)

type Point = {
    row: number,
    col: number
}

type Segment = {
    a: Point,
    b: Point,
    color: string
}

class Lagoon {
    plan: Array<DigStep>
    verts: Array<Point>
    trench: Array<Segment>
    winding: boolean            // CCW (DRUL) = false, CW (RDLU) = true

    constructor() {
        this.plan = []
        this.verts = []
        this.trench = []
        this.winding = false
    }

    static dig(p: Array<DigStep>): Lagoon {
        var l = new Lagoon()
        var here: Point = {row: 0, col: 0}
        l.verts.push(here)
        for (let s of p) {
            l.plan.push(s)
            var there: Point = {row: here.row, col: here.col}
            var dist = ((s.dir & 0b01) == 1) ? s.len : -s.len
            if (s.dir & 0b10) {
                there.row += dist
            }
            else {
                there.col += dist
            }
            l.trench.push({a: here, b: there, color: s.color})
            l.verts.push(there)
            here = there
        }

        // Offset to counteract minimum row/col reached
        var minRow = l.verts.reduce((m, v) => (Math.min(m, v.row)), 0)
        var minCol = l.verts.reduce((m, v) => (Math.min(m, v.col)), 0)
        for (let v of l.verts) {
            v.row -= minRow
            v.col -= minCol
        }

        // Winding detection
        for (let t of l.trench) {
            if ((t.a.row == 0) && (t.b.row == 0)) {
                // Are top edge segments going left or right?
                l.winding = (t.b.col > t.a.col)
                break
            }
        }

        if (verbose) {
            for (let t of l.trench) {
                console.log(`@${t.a.row}R, ${t.a.col}C -> ${t.b.row}R, ${t.b.col}C (#${t.color})`)
            }
            console.log(`Winding ${l.winding ? "CW" : "CCW"}`)
        }

        return l
    }

    area(): number {
        var horizontalSteps = this.trench.filter((t) => (t.a.row == t.b.row))
        var rowEvents = horizontalSteps.reduce((a: Array<number>, t) => {
            if (!a.includes(t.a.row)) {
                a.push(t.a.row)
                a.push(t.a.row)
            }
            return a
        }, []).sort((a, b) => (a - b)).slice(1, -1)
        
        var totalInternalArea = 0

        for (let r = 1; r < rowEvents.length; r++) {
            var p = rowEvents[r-1]
            var q = rowEvents[r]

            var testRow = 0.5 * (p + q)
            var swathHeight = (p == q) ? 1 : (q - p - 1)
            var desc = `${r} (${p}~${q})`

            var segs = this.trench.filter((t) => {
                var lo = Math.min(t.a.row, t.b.row)
                var hi = Math.max(t.a.row, t.b.row)
                return (testRow >= lo && testRow <= hi)
            }).sort((ta, tb) => (ta.a.col + ta.b.col - tb.a.col - tb.b.col))

            var insideDir = undefined
            var inside = false
            var lastCol = 0
            var totalThisRow = 0
            for (let s of segs) {
                if (s.a.col == s.b.col) {
                    if (typeof insideDir == "undefined") {
                        // First vertical crossing.
                        insideDir = (s.b.row > s.a.row)
                        console.log(`${desc}: insideDir = ${insideDir} @${s.a.col}`)
                        inside = true
                    }

                    if (insideDir == (s.b.row > s.a.row)) {
                        // Stepping inside.
                        console.log(`${desc}:  inside  [${s.a.col}~`)
                        lastCol = s.a.col
                    }
                    else {
                        // Stepping outside.
                        var addArea = Math.max(s.a.col - lastCol - 1, 0) * swathHeight
                        console.log(`${desc}: contains [${lastCol}~${s.a.col}] +${addArea}`)
                        totalThisRow += addArea
                    }
                }
                else {
                    console.log(`${desc}:  border  [${s.a.col}~${s.b.col}]`)
                    lastCol = Math.max(s.a.col, s.b.col)
                }
            }
            console.log(`${desc}: total area ${totalThisRow}`)
            totalInternalArea += totalThisRow
        }

        var perimeter = this.trench.reduce((t, s) => (t + Math.abs(s.b.col + s.b.row - s.a.col - s.a.row)), 0)
        return totalInternalArea + perimeter
    }
}


export default function Day18Component() {
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

        var lagoonArea1 = 0
        var digPlan: Array<DigStep> = []
        lines.forEach((l) => {
            var m = l.match(/(\w) (\d+) (\S+)/)
            if (m) {
                digPlan.push({
                    dir: "LRUD".indexOf(m[1]),
                    len: parseInt(m[2]),
                    color: m[3].substring(2, 8)
                })
            }
        })
        var lagoon = Lagoon.dig(digPlan)
        lagoonArea1 = lagoon.area()
        setResult1(lagoonArea1.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var lagoonArea2 = 0
        var digPlan: Array<DigStep> = []
        lines.forEach((l) => {
            var m = l.match(/(\w) (\d+) (\S+)/)
            if (m) {
                digPlan.push({
                    dir: [1, 3, 0, 2][parseInt(m[3].substring(7, 8))],
                    len: parseInt(m[3].substring(2, 7), 16),
                    color: m[3].substring(2, 8)
                })
            }
        })
        var lagoon = Lagoon.dig(digPlan)
        lagoonArea2 = lagoon.area()
        setResult2(lagoonArea2.toString())
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
