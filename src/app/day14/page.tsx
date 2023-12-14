"use client"

const title = "Day 14: Parabolic Reflector Dish"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = false
const LOOP_SENTINEL = 1000000

enum TiltDirection {
    EAST,
    NORTH,
    WEST,
    SOUTH
}

function swap(base: string, index: number, replacement: string): string {
    return base.substring(0, index) + replacement + base.substring(index + replacement.length)
}

class Mirror {
    field: Array<string>
    flipped: boolean        // Across X = Y.

    constructor(f: Array<string> | null = null, td: TiltDirection = TiltDirection.NORTH) {
        this.field = []
        this.flipped = (td == TiltDirection.NORTH || td == TiltDirection.SOUTH)

        if (f) {
            this.fill(f)
        }
    }

    fill(lines: Array<string>) {
        this.field = []
        lines.forEach((l) => {
            if (this.flipped) {
                if (this.field.length == 0) {
                    this.field = new Array<string>(l.length).fill("")
                }
                for (let i = 0; i < l.length; i++) {
                    this.field[i] += l[i]
                }
            }
            else {
                this.field.push(l.split("").join(""))
            }
        })
    }

    tilt(direction: TiltDirection = TiltDirection.WEST) {
        var m = this.field

        if (m.length == 0) {
            return
        }
        var lastEmpty = Array<number>(m.length).fill(0)
        for (let i = 0; i < m.length; i++) {
            var row = m[i]
            for (let j = 0; j < row.length; j++) {
                if (row[j] == "O") {
                    var e = lastEmpty[i]
                    var c = row[e]
                    row = swap(row, j, c)
                    row = swap(row, e, "O")
                    e++
                    while (e < j && row[e] != ".") {
                        e++
                        console.log(`${row} : ${lastEmpty[i]} ${e}`)
                    }
                    lastEmpty[i] = e
                }
                else if (row[j] == "#") {
                    lastEmpty[i] = j+1
                }
            }
            m[i] = row
        }
    }

    score(direction: TiltDirection = TiltDirection.NORTH): number {
        var totalScore = 0
        for (let i = 0; i < this.field.length; i++) {
            for (let j = 0; j < this.field[i].length; j++) {
                if (this.field[i][j] == "O") {
                    totalScore += this.field.length - j
                }
            }
        }
        return totalScore
    }
}

export default function Day14Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")
    const [debugDisplay, setDebugDisplay] = useState<string>("")

    useEffect(() => {
        var lines = data.split(/\r?\n/)
        lines.forEach((l) => (l.trim()))
        // lines = lines.filter((l) => (l != ""))
        var debugAcc = ""

        /*************************************************************/
        // Part 1 begin

        var mirrors: Array<Mirror> = []
        var lastBlank = 0
        while (lastBlank != -1) {
            var nextBlank = lines.indexOf("", lastBlank+1)
            mirrors.push(new Mirror(lines.slice(
                (lastBlank == 0) ? 0 : lastBlank+1,
                (nextBlank == -1) ? lines.length : nextBlank
            )))
            lastBlank = nextBlank
        }

        var totalMirrorScore = 0
        mirrors.forEach((v) => {
            v.tilt()
            console.log(v.field)
            totalMirrorScore += v.score()
        })

        setResult1(totalMirrorScore.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        //setResult2(totalValleyReflection2.toString())
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
