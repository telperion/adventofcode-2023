"use client"

const title = "Day 12: Hot Springs"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'


class SpringRow {
    info: string
    groups: Array<number>
    subsets: Array<SpringRow>
    evaluated: boolean
    ways: number

    constructor(i: string, g: Array<number>) {
        this.info = i
        this.groups = g
        this.subsets = []
        this.evaluated = false
        this.ways = 0
    }

    eval(verbose: boolean = false): boolean {
        if (this.evaluated) {
            return true
        }
        // An empty spring string evaluates to either 0 or 1 ways
        // depending on whether there are remaining groups.
        if (this.info == "") {
            this.evaluated = true
            this.ways = (this.groups.length == 0) ? 1 : 0
            if (verbose) {console.log(`"${this}" --> ${this.ways} (base case)`)}
        }
        // If all subsets have been evaluated, we can evaluate
        else if (this.subsets.map((s) => (s.evaluated))
                             .reduce((a, b) => (a && b), true)) {
            this.evaluated = true
            this.ways = this.subsets.map((s) => (s.ways))
                                    .reduce((a, b) => (a + b), 0)
            if (verbose) {console.log(`"${this}" --> ${this.ways} (evaluated)`)}
        }
        if (!this.evaluated) {
            if (verbose) {console.log(`"${this}" --> couldn't evaluate!`)}
        }
        return this.evaluated
    }

    toString(): string {
        return this.info + " " + this.groups.map((v) => (v.toString())).join(",")
    }
}


export default function Day12Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")
    const [debugDisplay, setDebugDisplay] = useState<string>("")

    useEffect(() => {
        var lines = data.split(/\r?\n/)
        lines.forEach((l) => (l.trim()))
        lines = lines.filter((l) => (l != ""))
        var debugAcc = ""
        var verbose = false

        /*************************************************************/
        // Part 1 begin

        var rows: Array<SpringRow> = []
        lines.forEach((l) => {
            var data = l.split(" ")
            if (data.length == 2) {
                rows.push(new SpringRow(
                    data[0],
                    Array.from(data[1].split(",").map((v) => (parseInt(v))))
                ))
            }
            else {
                console.log(`"${l}" doesn't resolve to a spring row`)
            }
        })

        var alreadySeen = new Map<string, SpringRow>()
        var rowResults = new Array<number>()
        var totalRowResults = 0

        rows.forEach((sr) => {
            var subRowStack = new Array<SpringRow>()
            var subsetFront = new Array<SpringRow>()
            var totalThisRow = 0

            // Traverse tree of subset tests top-down and build stack of operations.
            subsetFront.push(sr)
            for (let i = 0; i < 100 && subsetFront.length > 0; i++) {
                var srTest: SpringRow = subsetFront[0]
                subsetFront.splice(0, 1)
                var subsetTest: Array<SpringRow> = []
                
                // Next space is, or could be, empty
                if(".?".includes(srTest.info[0])) {
                    subsetTest.push(new SpringRow(
                        srTest.info.substr(1),              // Copy the remaining spaces (one consumed)
                        [...srTest.groups]                  // Copy all remaining groups (none consumed)
                    ))
                    if (verbose) {console.log(`${srTest}: testing after skipping empty space`)}
                }
                // Next space is, or could be, the beginning of a group
                if (srTest.groups.length > 0) {
                    // Need to make sure the whole group is present.
                    // Could be some combo of # and ?
                    // Must be followed by either a . or ?
                    var canMakeGroup = true
                    
                    for (let i = 0; i < srTest.groups[0]; i++) {
                        if (!"#?".includes(srTest.info[i])) {
                            canMakeGroup = false
                        }
                    }
                    var groupClosed = (srTest.info.length == srTest.groups[0]) || ".?".includes(srTest.info[srTest.groups[0]])
                    canMakeGroup &&= groupClosed
                    
                    if (canMakeGroup) {
                        subsetTest.push(new SpringRow(
                            srTest.info.substr(srTest.groups[0]+1), // Copy the remaining spaces (length of group consumed + empty space after)
                            [...srTest.groups.slice(1)]             // Copy all remaining groups (one consumed)
                        ))

                        if (verbose) {console.log(`${srTest}: testing after skipping group of ${srTest.groups[0]}`)}
                    }
                    else {
                        if (verbose) {console.log(`${srTest}: couldn't make groups`)}
                    }
                }
                
                // Alias any subset conditions we've already seen.
                for (let ss of subsetTest) {
                    var ssAlias = ss
                    if (alreadySeen.has(ss.toString())) {
                        // No sense re-evaluating this subset.
                        ssAlias = alreadySeen.get(ss.toString())!
                        if (verbose) {console.log(`${srTest}: already seen`)}
                    }
                    else {
                        // Need to chase this subset.
                        alreadySeen.set(ss.toString(), ss)
                        subsetFront.push(ssAlias)
                        if (verbose) {console.log(`${srTest}: first time seeing`)}
                    }
                    srTest.subsets.push(ssAlias)
                }
                subRowStack.push(srTest)
            }

            console.log(subRowStack)

            // Evaluate tree nodes without recursion.
            subRowStack.reverse().forEach((srTest) => {srTest.eval(verbose)})
            
            rowResults.push(sr.ways)
            totalRowResults += sr.ways
            console.log(`>>> ${sr}: ${sr.ways} ways to match`)
            debugAcc += `${sr}: ${sr.ways} ways to match\n`
        })

        setResult1(totalRowResults.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        //setResult2(totalDistance2.toString())
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
