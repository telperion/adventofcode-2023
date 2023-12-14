"use client"

const title = "Day 14: Parabolic Reflector Dish"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = false
const LOOP_SENTINEL = 1000000000

enum TiltDirection {
    WEST = 0,
    SOUTH = 1,
    EAST = 2,
    NORTH = 3
}

function swap(base: string, index: number, replacement: string): string {
    return base.substring(0, index) + replacement + base.substring(index + replacement.length)
}

class Mirror {
    field: Array<string>

    constructor(f: Array<string> | null = null) {
        this.field = []

        if (f) {
            f.forEach((l) => {
                this.field.push(l.split("").join(""))
            })
        }
    }

    rotate(): Mirror {
        // HACK(ish): why doesn't this work when I try to store the results in the original field

        // Turns are clockwise 90 degrees.
        var m = new Mirror()
        this.field.forEach((l) => {
            m.field.push(l.split("").join(""))
        })

        m.field = new Array<string>(this.field.length).fill("")
        for (let l of this.field) {
            for (let i = 0; i < l.length; i++) {
                m.field[i] = l[i] + m.field[i]
            }
        }

        return m
    }

    tilt() {
        // To the west.
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

    score(): number {
        // To the west.
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

    toString(): string {
        return this.field.join("\n")
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

        var totalMirrorScore1 = 0
        mirrors.forEach((m) => {
            var v = new Mirror(m.field)

            // North in my algorithms is leftward lol
            v = v.rotate()
            v = v.rotate()
            v = v.rotate()
            v.tilt()
            console.log(`One turn: ${v.score()}\n\n<-- N\n${v}`)
            totalMirrorScore1 += v.score()
        })

        setResult1(totalMirrorScore1.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin        

        var totalMirrorScore2 = 0
        mirrors.forEach((m) => {
            var v = new Mirror(m.field)
            var alreadySeen = new Map<string, number>()

            // North in my algorithms is leftward lol
            v = v.rotate()
            v = v.rotate()
            v = v.rotate()
            console.log(v)
            for (let i = 1; i <= LOOP_SENTINEL; i++) {
                for (let j = 0; j < 4; j++) {
                    v.tilt()
                    v = v.rotate()
                    //console.log(`${i}.${j}:\n${v.field.join("\n")}`)
                }
                //console.log(`${i}: ${v.score()}\n${v}`)
                var vs = v.toString()
                if (alreadySeen.has(vs)) {
                    var lastSeen = alreadySeen.get(vs)!
                    console.log(`>>> ${i} == ${lastSeen}`)
                    // Fast-forward this mini-cycle
                    var miniCycle = i - lastSeen
                    i += miniCycle * Math.floor((LOOP_SENTINEL - i) / miniCycle)
                    console.log(`>>> Skipped forward to ${i}`)
                }
                else {
                    alreadySeen.set(vs, i)
                }
            }
            console.log(`${LOOP_SENTINEL} cycles: ${v.score()}\n\n<-- N\n${v}`)
            totalMirrorScore2 += v.score()
        })

        setResult2(totalMirrorScore2.toString())
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
