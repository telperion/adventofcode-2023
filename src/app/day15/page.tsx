"use client"

const title = "Day 15: Lens Library"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = false
const LOOP_SENTINEL = 1000000000

class Lens {
    label: string
    focalLength: number

    constructor(l: string, f: number) {
        this.label = l
        this.focalLength = f
    }

    toString() {
        return `[${this.label} ${this.focalLength}]`
    }
}
class ReindeerHashMap {
    hashmap: Map<number, Array<Lens>>

    constructor() {
        this.hashmap = new Map<number, Array<Lens>>()
    }

    static hash(label: string) {
        return label.split("").reduce((h: number, c: string) => {
            return ((h + c.charCodeAt(0)) * 17) % 256
        }, 0)
    }

    append(lens: Lens) {
        // If the operation character is an equals sign (=), 
        // it will be followed by a number indicating the focal length
        // of the lens that needs to go into the relevant box;
        // be sure to use the label maker to mark the lens with
        // the label given in the beginning of the step so you can
        // find it later. There are two possible situations:

        var h = ReindeerHashMap.hash(lens.label)
        var boxContents: Array<Lens> = this.hashmap.get(h) || []
        var labelIndex = boxContents.map((l) => (l.label)).indexOf(lens.label)
        if (labelIndex != -1) {
            // If there is already a lens in the box with the same label,
            // replace the old lens with the new lens:
            // remove the old lens and put the new lens in its place,
            // not moving any other lenses in the box.
            console.log(`${lens} replaces ${boxContents[labelIndex]} in box ${h}`)
            boxContents[labelIndex] = lens
        }
        else {
            // If there is not already a lens in the box with the same label,
            // add the lens to the box immediately behind any lenses already in the box.
            // Don't move any of the other lenses when you do this.
            // If there aren't any lenses in the box,
            // the new lens goes all the way to the front of the box.
            boxContents.push(lens)
            console.log(`${lens} added into box ${h}`)
        }
        this.hashmap.set(h, boxContents)
    }

    remove(label: string) {
        // If the operation character is a dash (-),
        // go to the relevant box and remove the lens with
        // the given label if it is present in the box.
        // Then, move any remaining lenses as far forward in
        // the box as they can go without changing their order,
        // filling any space made by removing the indicated lens.
        // (If no lens in that box has the given label, nothing happens.)
        var h = ReindeerHashMap.hash(label)
        var boxContents: Array<Lens> = this.hashmap.get(h) || []
        var labelIndex = boxContents.map((l) => (l.label)).indexOf(label)
        if (labelIndex != -1) {
            boxContents.splice(labelIndex, 1)
            console.log(`${label} removed from box ${h}`)
        }
        else {
            console.log(`${label} already not in box ${h}`)
        }
        this.hashmap.set(h, boxContents)
    }

    op(info: string) {
        var lensParts = info.match(/(\w+)([=-])(\d*)/)
        if (lensParts && lensParts.length == 4) {
            if (lensParts[2] == "=") {
                this.append(new Lens(lensParts[1], parseInt(lensParts[3])))
            }
            else if (lensParts[2] == "-") {
                this.remove(lensParts[1])
            }
        }
    }

    sum(): number {
        var totalFocalCharacteristics = 0
        for (let k of this.hashmap.entries()) {
            for (let i = 0; i < k[1].length; i++) {
                totalFocalCharacteristics += (k[0] + 1) * (i + 1) * k[1][i].focalLength
            }
        }
        return totalFocalCharacteristics
    }

    toString(): string {
        var lensStack = ""
        for (let k of this.hashmap.entries()) {
            lensStack += `Box ${k[0]}: ${k[1].map((l) => (l.toString())).join(" ")}\n`
        }
        return lensStack
    }
}


export default function Day15Component() {
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

        var steps = lines.join("").split(",")

        var totalHash = 0
        steps.forEach((s) => {totalHash += ReindeerHashMap.hash(s)})
        setResult1(totalHash.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var lensLibrary = new ReindeerHashMap()
        steps.forEach((s) => {lensLibrary.op(s)})
        console.log(lensLibrary.toString())

        setResult2(lensLibrary.sum().toString())
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
