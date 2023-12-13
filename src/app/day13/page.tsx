"use client"

const title = "Day 13: Point of Incidence"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = false
const LOOP_SENTINEL = 1000000

class Valley {
    field: Array<string>
    fieldFlip: Array<string>

    constructor(f: Array<string> | null = null) {
        this.field = []
        this.fieldFlip = []

        if (f) {
            this.fill(f)
        }

        // console.log(this.fieldFlip)
    }

    fill(lines: Array<string>) {
        this.field = []
        this.fieldFlip = []
        lines.forEach((l) => {
            this.field.push(l.split("").join(""))
            if (this.fieldFlip.length == 0) {
                this.fieldFlip = new Array<string>(l.length).fill("")
            }
            for (let i = 0; i < l.length; i++) {
                this.fieldFlip[i] += l[i]
            }
        })
    }

    testSymmetry(horizontal: boolean): number {
        var oriented = horizontal ? this.field : this.fieldFlip
        console.log(oriented)

        for (let i = 1; i < oriented.length; i++) {
            var matching = true
            for (let j = 0; i + j < oriented.length && i - j - 1 >= 0; j++) {
                if (oriented[i + j] != oriented[i - j - 1]) {
                    matching = false
                    break
                }
            }
            if (matching) {
                console.log(`>>> symmetry across ${i}`)
                return i
            }
        }
        console.log(`!!! no symmetry found`)
        return 0
    }
}

export default function Day13Component() {
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

        var valleys: Array<Valley> = []
        var lastBlank = 0
        while (lastBlank != -1) {
            var nextBlank = lines.indexOf("", lastBlank+1)
            valleys.push(new Valley(lines.slice(
                (lastBlank == 0) ? 0 : lastBlank+1,
                (nextBlank == -1) ? lines.length : nextBlank
            )))
            lastBlank = nextBlank
        }

        var totalValleyReflection = 0
        valleys.forEach((v) => {
            totalValleyReflection += v.testSymmetry(false)
            totalValleyReflection += v.testSymmetry(true) * 100
        })

        setResult1(totalValleyReflection.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        //setResult2(totalRowResults2.toString())
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
