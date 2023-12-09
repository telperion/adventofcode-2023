"use client"

const title = "Day 9: Mirage Maintenance"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'
import internal from 'stream'
import { isStringObject } from 'util/types'

function continueSequence(seq: Array<number>): number {
    var diffs: Array<number> = []
    for (let i = 1; i < seq.length; i++) {
        diffs.push(seq[i] - seq[i-1])
    }
    if (diffs.length == 0) {
        throw new Error(`Sequence didn't reduce to a single propagated difference`)
    }
    var firstValue = diffs[0]
    var allTheSameValue = true
    for (let v of diffs) {
        if (v != firstValue) {
            allTheSameValue = false
            break
        }
    }   
    console.log(diffs)

    if (allTheSameValue) {
        return firstValue
    }
    else {
        return diffs[diffs.length-1] + continueSequence(diffs)
    }
}

export default function Day09Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        var lines = data.split("\n")
        var totalContinuations: number = 0

        lines.forEach( (l) => {
            var seq: Array<number> = l.split(/\s+/)
                                      .filter((v) => (v != ""))
                                      .map((v) => (parseInt(v)))
            if (seq.length < 2) {
                return
            }
            var c: number = seq[seq.length-1] + continueSequence(seq)
            console.log(`${seq}: ${c}`)
            totalContinuations += c
        })

        setResult1(totalContinuations.toString())

        // Part 1 end
        /*************************************************************/
        // Part 2 begin
        var totalContinuations: number = 0

        lines.forEach( (l) => {
            var seq: Array<number> = l.split(/\s+/)
                                      .filter((v) => (v != ""))
                                      .map((v) => (parseInt(v)))
            if (seq.length < 2) {
                return
            }
            seq = seq.reverse()
            var c: number = seq[seq.length-1] + continueSequence(seq)
            console.log(`${seq}: ${c}`)
            totalContinuations += c
        })

        setResult2(totalContinuations.toString())

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
            <Link className="flex text-xl underline text-lime-500 hover:text-lime-200" href="/">Return home</Link>
        </div>
    )
}
