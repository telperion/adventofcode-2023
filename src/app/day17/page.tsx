"use client"

const title = "Day 17: Clumsy Crucible"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = true
const LOOP_SENTINEL = 1000

class CrucibleStep {
    row: number
    col: number
    dir: number
    lin: number
    // dir & 0b10 = verticality
    // dir & 0b01 = rightward/downward

    constructor(r: number, c: number, d: number, l: number = 0) {
        this.row = r
        this.col = c
        this.dir = d
        this.lin = l
    }

    static copy(o: CrucibleStep) {
        return new CrucibleStep(o.row, o.col, o.dir, o.lin)
    }

    step() {
        this.row += (this.dir & 0b10) ? ((this.dir & 0b01) ? 1 : -1) : 0
        this.col += (this.dir & 0b10) ? 0 : ((this.dir & 0b01) ? 1 : -1)
        this.lin += 1
    }

    toString(): string {
        return `@${this.row.toString().padStart(3)}R, ${this.col.toString().padStart(3)}C ${"<>^v"[this.dir]} -${this.lin.toString().padStart(2)}`
    }
}

class CruciblePath {
    path: Array<CrucibleStep>
    cost: number

    constructor(p: Array<CrucibleStep> = [], c: number = 0) {
        this.path = new Array<CrucibleStep>()
        for (let s of p) {
            this.path.push(s)
        }
        this.cost = c
    }

    toString(): string {
        var str = this.cost.toString() + "\n"
        this.path.forEach((s) => {
            str += `>>> ${s}\n`
        })
        return str
    }
}

class Grid {
    field: Array<Array<number>>
    paths: Array<CruciblePath>
    memos: Map<string, number>
    bests: Map<string, CruciblePath>
    ultra: boolean

    constructor(f: Array<string> = [], u: boolean = false) {
        this.field  = new Array<Array<number>>()
        for (let l of f) {
            this.field.push(l.split("").map((c) => (parseInt(c))))
        }
        this.paths = new Array<CruciblePath>()
        this.memos = new Map<string, number>()
        this.bests = new Map<string, CruciblePath>()
        this.ultra = u
    }

    inbounds(r: number, c: number) {
        return (r >= 0 && r < this.field.length) && (c >= 0 && c < this.field[0]?.length || 0)
    }

    step(): void {
        // Assess new cost and step if it's worth it.
        for (let i = this.paths.length - 1; i >= 0; i--) {
            var p = this.paths[i]
            this.paths.splice(i, 1)

            if (p.path.length == 0) {
                // :crab: path was never here :crab:
                continue
            }

            var s = CrucibleStep.copy(p.path[p.path.length-1])
            s.step()

            if (!this.inbounds(s.row, s.col)) {
                // :crab: path is gone :crab: 
                // TODO: this may be an end condition
                continue
            }

            var x = this.field[s.row][s.col]!
            p.path.push(s)
            p.cost += x

            var sHash = s.toString()
            var bestCost = this.memos.get(sHash) || Infinity

            if (bestCost <= p.cost) {
                // :crab: path is too expensive :crab:
                continue
            }
            
            this.memos.set(sHash, p.cost)
            this.bests.set(sHash, new CruciblePath(p.path, p.cost))

            // Next steps?
            if (s.lin < (this.ultra ? 10 : 3)) {
                // Forward only if we haven't traveled N-in-a-row
                this.paths.push(p)
            }
            if (s.lin >= (this.ultra ? 4 : 0)) {
                for (let lr of [0, 1]) {
                    // Examine left turn and right turn.
                    var turnPath = new CruciblePath(p.path, p.cost)
                    var nextStep = CrucibleStep.copy(turnPath.path.pop()!)
                    nextStep.dir = nextStep.dir ^ 0b10 ^ lr     // verticality swap, need both of +/-
                    nextStep.lin = 0
                    turnPath.path.push(nextStep)
                    this.paths.push(turnPath)
                }
            }
        }

        if (verbose) {
            console.log(`${this.paths.length} paths active`)
            /*
            this.paths.forEach((p) => {
                console.log(p.toString())
            })
            */
        }
    }

    cast(entry: CrucibleStep, exit: CrucibleStep): number {
        for (let d = 0; d < 4; d++) {
            var s = CrucibleStep.copy(entry)
            s.dir = d
            this.paths.push(new CruciblePath([s]))
        }

        for (let i = 0; i < LOOP_SENTINEL && this.paths.length > 0; i++) {
            this.step()
        }

        if (verbose) {
            Array.from(this.memos.keys())
                .filter((s) => (
                    s.substring(0, 11) == exit.toString().substring(0, 11)
                ))
                .sort((a, b) => (a > b ? 1 : -1))
                .forEach((s) => {
                    console.log(`${s}: ${this.memos.get(s)}`)
                })
        }

        /*
        var exitPath = Array.from(this.bests.values())
            .filter((p) => (
                p.path[p.path.length-1].row == exit.row &&
                p.path[p.path.length-1].col == exit.col
            ))
            .sort((a, b) => (a.cost - b.cost))
        */
        var exitPath = Array.from(this.memos.keys())
            .filter((s) => (
                s.substring(0, 11) == exit.toString().substring(0, 11)
            ))
            .filter((s) => (
                parseInt(s.substring(15, 17).trim()) >= (this.ultra ? 4 : 0)
            ))
            .sort((a, b) => (this.memos.get(a)! - this.memos.get(b)!))
        console.log(exitPath)
        if (exitPath.length == 0) {
            console.log(`No path reaches ${exit}`)
            return Infinity
        }
        else {
            console.log(`Best path that reaches ${exit}:\n${this.bests.get(exitPath[0].toString())}`)
            return this.memos.get(exitPath[0]) || Infinity
        }
    }
}


export default function Day16Component() {
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

        var minHeatLoss1 = 0
        if (lines.length > 0) {
            var heating = new Grid(lines, false)
            minHeatLoss1 = heating.cast(
                new CrucibleStep(0, 0, 0b01, 0),
                new CrucibleStep(lines.length-1, lines[0].length-1, 0b01)
            )
        }
        setResult1(minHeatLoss1.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var minHeatLoss2 = 0
        if (lines.length > 0) {
            var heating = new Grid(lines, true)
            minHeatLoss2 = heating.cast(
                new CrucibleStep(0, 0, 0b01, 0),
                new CrucibleStep(lines.length-1, lines[0].length-1, 0b01)
            )
        }
        setResult2(minHeatLoss2.toString())
        setDebugDisplay(debugAcc)

        // Part 2 end
        /*************************************************************/
    }, [data])
    
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-6">
            <div className="flex text-3xl text-center">{title}</div>
            <div className="flex text-md text-center">(it's very slow sorry)</div>
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
