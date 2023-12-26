"use client"

const title = "Day 21: Step Counter"
const working = false

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

var verbose = false
const LOOP_SENTINEL = 1000000000

class Island {
    chart: Array<string>

    constructor(lines: Array<string> = []) {
        this.chart = []
        lines.forEach((l) => {
            this.chart.push(l.split("").join(""))
        })
    }

    walk(startIndex: number = 0): Array<Array<number>> {
        var res: Array<Array<number>> = []
        var startRow = -1
        var startCol = -1
        var startsFound = 0

        for (let r = 0; r < this.chart.length; r++) {
            var l = this.chart[r]
            var s = l.indexOf("S")
            res.push(l.split("").map((c) => (c == "S" ? 0 : Infinity)))
            if (s != -1) {
                if (startsFound == startIndex) {
                    startRow = r
                    startCol = s
                }
                startsFound++
            }
        }

        if (startRow == -1 || startCol == -1) {
            return res
        }

        var horizon: Array<Array<number>> = [[startRow, startCol]]
        for (let i = 0; i < LOOP_SENTINEL && horizon.length > 0; i++) {
            var v = horizon.shift()!
            for (let step of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
                var p = v[0] + step[0]
                var q = v[1] + step[1]
                if (p < 0 || p >= res.length) {
                    continue
                }
                if (q < 0 || q >= res[0].length) {
                    continue
                }
                if (this.chart[p][q] == "#") {
                    // Can't step here
                    continue
                }
                if (isFinite(res[p][q])) {
                    // Already stepped here
                    continue
                }
                res[p][q] = Math.min(res[v[0]][v[1]] + 1, res[p][q])
                horizon.push([p, q])
            }
        }

        console.log(res.map((l) => l.map((v) => (isFinite(v) ? v : "X").toString().padStart(3)).join(", ")).join("\n"))

        return res
    }

    satisfy(n: number, walked: Array<Array<number>> = [], startIndex: number = 0): number {
        var w = walked
        if (w.length == 0) {
            w = this.walk(startIndex)
        }
        return w.reduce((t, l) => (
            t + l.reduce((x, v) => (
                x + ((v <= n && (v % 2 == n % 2)) ? 1 : 0)
                ), 0)
            ), 0)
    }
}


export default function Day21Component() {
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

        var island = new Island(lines)
        var steps64 = island.satisfy(64)
        setResult1(steps64.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var lines3: Array<string> = []
        var startsFound = 0
        for (let i of [1, 2, 3]) {
            lines.forEach((l) => {
                lines3.push(l+l+l)
            })
        }
        var steps5000 = island.satisfy(5000, [], 4)
        setResult2(steps5000.toString())
        setDebugDisplay(debugAcc)

        // Part 2 end
        /*************************************************************/
    }, [data])
    
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-6">
            <div className={"flex text-3xl text-center" + (working ? "" : " line-through text-rose-500")}>{title}</div>
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
