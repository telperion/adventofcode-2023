"use client"

const title = "Day 25: Snowverload"
const working = false

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'
import { kill } from 'process'

var verbose = false
const LOOP_SENTINEL = 1000000


class Wiring {
    connections: Map<string, Array<string>>
    bdc: Map<string, Array<string>>

    constructor(lines: Array<string> = []) {
        this.connections = new Map<string, Array<string>>()
        this.bdc = new Map<string, Array<string>>()

        lines.forEach((l) => {
            var m = l.match(/(\w+):(.*)/)
            if (m) {
                var node = m[1]
                var cx = m[2].trim().split(" ")
                this.connections.set(node, cx)

                var nc = this.bdc.get(node) || []
                nc.push(...cx)
                this.bdc.set(node, nc)
                for (let c of cx) {
                    var nc = this.bdc.get(c) || []
                    nc.push(node)
                    this.bdc.set(c, nc)
                }
            }
        })
    }

    toString(): string {
        var s = ""
        for (let v of this.connections.entries()) {
            s += v[0] + ": " + v[1].join(" ") + "\n"
        }
        return s
    }

    toStringBDC(): string {
        var s = ""
        for (let v of this.bdc.entries()) {
            s += v[0] + ": " + v[1].join(" ") + "\n"
        }
        return s
    }

    copy(): Wiring {
        return new Wiring(this.toString().split("\n"))
    }

    severDirectional(a: string, b: string, whichRep: boolean): boolean {
        var severOn = whichRep ? this.connections : this.bdc

        var found = false
        var aConn = severOn.get(a)
        if (aConn) {
            var bIndex = aConn.indexOf(b)
            if (bIndex != -1) {
                aConn.splice(bIndex, 1)
                severOn.set(a, aConn)
                found = true
            }
        }
        return found
    }

    sever(a: string, b: string) {
        this.severDirectional(a, b, false)
        this.severDirectional(b, a, false)
        this.severDirectional(a, b, true)
        this.severDirectional(b, a, true)
    }

    findGroups(): Array<Array<string>> {
        var groups = new Array<Array<string>>()
        var untouched = Array.from(this.bdc.keys())
        while (untouched.length > 0) {
            var net = new Array<string>()
            var neighbors = new Array<string>()
            var start = untouched.pop()!

            net.push(start)
            neighbors.push(...this.bdc.get(start)!)

            while (neighbors.length > 0) {
                neighbors = neighbors.reduce((a: Array<string>, v) => {if (!a.includes(v)) {a.push(v)} return a}, [])
                // console.log(`[${net.join(", ")}] ...[${neighbors.join(", ")}]`)
                var n = neighbors.pop()!
                if (!net.includes(n)) {
                    net.push(n)
                    neighbors.push(...(this.bdc.get(n) || []))
                }
                var i = untouched.indexOf(n)
                if (i != -1) {
                    untouched.splice(i, 1)
                }
            }
            groups.push(net)
        }
        return groups
    }
}


class SeverCheck extends Wiring {
    nSevered: number

    constructor(s: SeverCheck | Wiring | Array<string>) {
        if (s instanceof SeverCheck) {
            super(s.toString().split("\n"))
            this.nSevered = s.nSevered
        }
        else if (s instanceof Wiring) {
            super(s.toString().split("\n"))
            this.nSevered = 0
        }
        else {
            super(s)
            this.nSevered = 0
        }
    }

    sever(a: string, b: string) {
        super.sever(a, b)
        this.nSevered++
    }

    copy(): SeverCheck {
        return new SeverCheck(this)
    }

    memoString(): string {
        return this.nSevered.toString() + "...\n" + this.toString()
    }
}


export default function Day25Component() {
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

        var severLimit = 3
        var diagram = new Wiring(lines)
        console.log(diagram.toStringBDC())

        var severAttempts: Array<SeverCheck> = [new SeverCheck(diagram)]
        var severMemo: Array<string> = []
        var severSuccess = null
        
        for (let i = 0; i < LOOP_SENTINEL && severAttempts.length > 0; i++) {
            var attempt = severAttempts.shift()!
            if (attempt.nSevered == severLimit) {
                var groups = attempt.findGroups()
                if (groups.length == 2) {
                    severSuccess = groups
                    break
                }
            }
            else {
                Array.from(attempt.connections.entries()).forEach((v) => {
                    for (let n of v[1]) {
                        var sv = attempt.copy()
                        sv.sever(v[0], n)
                        var svMemo = sv.memoString()
                        if (!severMemo.includes(svMemo)) {
                            severAttempts.push(sv)
                            severMemo.push(svMemo)
                        }
                    }
                })
            }
            //console.log(severAttempts.map((sv) => ("--- " + sv.memoString())).join("\n"))
        }

        var sizeProduct = severSuccess ? severSuccess.reduce((p, v) => (p * v.length), 1) : 0
        setResult1(sizeProduct.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var totalCombinations = 0
        setResult2(totalCombinations.toString())
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
