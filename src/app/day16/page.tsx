"use client"

const title = "Day 16: The Floor Will Be Lava"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = false
const LOOP_SENTINEL = 1000000

class Beam {
    row: number
    col: number
    dir: number
    // dir & 0b10 = verticality
    // dir & 0b01 = rightward/downward

    constructor(r: number, c: number, d: number) {
        this.row = r
        this.col = c
        this.dir = d
    }

    step() {
        this.row += (this.dir & 0b10) ? ((this.dir & 0b01) ? 1 : -1) : 0
        this.col += (this.dir & 0b10) ? 0 : ((this.dir & 0b01) ? 1 : -1)
    }

    toString(): string {
        return `${"<>^v"[this.dir]} @${this.row}R, ${this.col}C`
    }
}

class Grid {
    field: Array<string>
    energy: Array<string>
    beams: Array<Beam>

    constructor(f: Array<string> = []) {
        this.field  = new Array<string>()
        this.energy = new Array<string>()
        for (let l of f) {
            this.field.push(l.split("").join(""))
            this.energy.push(l.split("").map((c) => (".")).join(""))
        }
        this.beams = new Array<Beam>()
    }

    inbounds(r: number, c: number) {
        return (r >= 0 && r < this.field.length) && (c >= 0 && c < this.field[0]?.length || 0)
    }

    totalEnergy(): number {
        return this.energy.reduce((total, l) => (
            total + l.split("").reduce((t, c) => (
                t + (c == "#" ? 1 : 0)
            ), 0)
        ), 0)
    }

    step(): void {
        // Change direction if necessary.
        for (let i = this.beams.length - 1; i >= 0; i--) {
            var b = this.beams[i]
            var x = this.field[b.row] ? this.field[b.row][b.col] : undefined

            switch(x) {
                // If the beam encounters empty space (.),
                // it continues in the same direction.
                case ".":
                    break

                // If the beam encounters a mirror (/ or \),
                // the beam is reflected 90 degrees depending on the angle of the mirror.
                // For instance, a rightward-moving beam that encounters a / mirror would
                // continue upward in the mirror's column, while a rightward-moving beam
                // that encounters a \ mirror would continue downward from the mirror's column.
                case "/":
                    b.dir = [0b11, 0b10, 0b01, 0b00][b.dir]
                    break
                case "\\":
                    b.dir = [0b10, 0b11, 0b00, 0b01][b.dir]
                    break
                
                // If the beam encounters the pointy end of a splitter (| or -),
                // the beam passes through the splitter as if the splitter were empty space.
                // For instance, a rightward-moving beam that encounters a - splitter would
                // continue in the same direction.
                
                // If the beam encounters the flat side of a splitter (| or -),
                // the beam is split into two beams going in each of the two directions
                // the splitter's pointy ends are pointing.
                // For instance, a rightward-moving beam that encounters a | splitter would
                // split into two beams: one that continues upward from the splitter's column
                // and one that continues downward from the splitter's column.
                case "|":
                case "-":
                    var passthrough: boolean = (x == "-") == ((b.dir & 0b10) == 0)
                    if (!passthrough) {
                        b.dir = (b.dir ^ 0b10)
                        this.beams.push(new Beam(b.row, b.col, b.dir ^ 0b01))
                    }
            }
        }

        // Travel and mark new beam locations.
        for (let i = this.beams.length - 1; i >= 0; i--) {
            var b = this.beams[i]

            b.step()
            if (!this.inbounds(b.row, b.col)) {
                // :crab: beam is gone :crab: 
                this.beams.splice(i, 1)
            }
            else {
                this.energy[b.row] = this.energy[b.row].substr(0, b.col) + "#" + this.energy[b.row].substr(b.col+1)
            }
        }

        if (verbose) {
            this.beams.forEach((b) => {
                console.log(b.toString())
            })
            console.log(this.energy.join("\n"))
        }
    }

    cast(entry: Beam): number {
        var seen = Array<string>()
        this.beams.push(entry)
        for (let i = 0; i < LOOP_SENTINEL && this.beams.length > 0; i++) {
            this.step()

            // Memo reduction
            for (let i = this.beams.length - 1; i >= 0; i--) {
                var bs = this.beams[i].toString()
                if (seen.indexOf(bs) != -1) {
                    this.beams.splice(i, 1)
                }
                else {
                    seen.push(bs)
                }
            }
        }
        return this.totalEnergy()
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

        var totalEnergized = 0
        if (lines.length > 0) {
            var heating = new Grid(lines)
            totalEnergized = heating.cast(new Beam(0, -1, 0b01))
        }
        setResult1(totalEnergized.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var maxEnergized = 0
        var edgeEntries = Array<Beam>()
        if (lines.length > 0) {
            for (let r = 0; r < lines.length; r++) {
                // Horizontal entries
                edgeEntries.push(new Beam(r, -1,              0b01))
                edgeEntries.push(new Beam(r, lines[0].length, 0b00))
            }
            for (let c = 0; c < lines[0].length; c++) {
                // Horizontal entries
                edgeEntries.push(new Beam(-1,           c, 0b11))
                edgeEntries.push(new Beam(lines.length, c, 0b10))
            }
            edgeEntries.forEach((b) => {
                var heating = new Grid(lines)
                var energized = heating.cast(new Beam(b.row, b.col, b.dir))
                console.log(`${b}: ${energized}`)
                maxEnergized = Math.max(maxEnergized, energized)
            })
        }

        setResult2(maxEnergized.toString())
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
