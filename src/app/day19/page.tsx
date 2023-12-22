"use client"

const title = "Day 19: Aplenty"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = true
const LOOP_SENTINEL = 100000

class Rating {
    params: Map<string, number>

    constructor(l: string = "") {
        var m = l.match(/{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/)
        if (m) {
            this.params = new Map<string, number>([
                ["x", parseInt(m[1])],
                ["m", parseInt(m[2])],
                ["a", parseInt(m[3])],
                ["s", parseInt(m[4])]
            ])
        }
        else {
            this.params = new Map<string, number>()
        }
    }

    toString(): string {
        return "{" + Array.from(this.params.entries()).map((e) => `${e[0]}=${e[1].toString()}`).join(",") + "}"
    }

    value(): number {
        return Array.from(this.params.values()).reduce((v, e) => (v + e), 0)
    }
}

const f = (r: Rating): number => 0

type FilterSpec = {
    comp: string,
    isLT: boolean,
    limit: number,
    dest: string
}

const fsString = (r: FilterSpec) => {
    if (r.comp == "") {
        return r.dest
    }
    else {
        return `${r.comp}${r.isLT ? "<" : ">"}${r.limit}:${r.dest}`
    }
}

class Workflow {
    rules: Array<FilterSpec>

    constructor(l: string = "") {
        this.rules = []
        var m = l.match(/(.*){(.+)}/)
        if (m) {
            var name = m[1]
            var ruleString = m[2].split(",")
            for (let r of ruleString) {
                var mm = r.match(/(\w)([<>])(\d+):([a-zA-Z]+)/)
                if (mm) {
                    this.rules.push({
                        comp: mm[1],
                        isLT: (mm[2] == "<"),
                        limit: parseInt(mm[3]),
                        dest: mm[4]
                    })
                }
                else {
                    this.rules.push({
                        comp: "",
                        isLT: false,
                        limit: 0,
                        dest: r
                    })
                }
            }
        }
    }

    toString(): string {
        return "{" + this.rules.map((r) => (fsString(r))).join(",") + "}"
    }
}

class Range {
    min: Map<string, number>
    max: Map<string, number>

    constructor() {
        this.min = new Map<string, number>()
        this.max = new Map<string, number>()
        for (let p of "xmas".split("")) {
            this.min.set(p, 1)
            this.max.set(p, 4001)           // Non-inclusive
        }
    }

    copy(): Range {
        var r = new Range()
        for (let p of "xmas".split("")) {
            r.min.set(p, this.min.get(p)!)
            r.max.set(p, this.max.get(p)!)
        }
        return r
    }

    toString(): string {
        return "{" + Array.from(this.min.keys()).map((k) => 
            `${k}=${this.min.get(k)!.toString().padStart(4)}~${(this.max.get(k)!-1).toString().padStart(4)}`
        ).join(", ") + "}"
    }

    split(p: string, v: number): Array<Range> {
        var lh = this.copy()
        var rh = this.copy()
        if ("xmas".includes(p)) {
            lh.max.set(p, Math.min(lh.max.get(p)!, Math.max(lh.min.get(p)!, v)))
            rh.min.set(p, Math.max(rh.min.get(p)!, Math.min(rh.max.get(p)!, v)))
        }
        return [lh, rh]
    }

    combos(): number {
        return Array.from(this.min.keys()).reduce(
            (t, k) => (t * Math.max(this.max.get(k)! - this.min.get(k)!, 0)), 1
        )
    }
}

class Swath {
    workflow: string
    range: Range

    constructor(wf: string, r: Range) {
        this.workflow = wf
        this.range = r
    }

    toString(): string {
        return `${this.workflow}: ${this.range.toString()}`
    }
}

class Sorter {
    workflows: Map<string, Workflow>

    constructor(lines: Array<string>) {
        this.workflows = new Map<string, Workflow>()

        lines.forEach((l) => {
            var m = l.match(/(.*){(.+)}/)
            if (m) {
                this.workflows.set(m[1], new Workflow(l))
            }
        })
    }

    flow(part: Rating): string {
        var path: Array<string> = ["in"]
        var lastFlow: string = "in"
        for (let i = 0; i < LOOP_SENTINEL && !["A", "R"].includes(lastFlow); i++) {
            for (let w of this.workflows) {
                if (w[0] == lastFlow) {
                    for (let r of w[1].rules) {
                        if (r.comp != "") {
                            var p = part.params.get(r.comp) || 0
                            if (r.isLT ? (p < r.limit) : (p > r.limit)) {
                                lastFlow = r.dest
                                break
                            }
                        }
                        else {
                            lastFlow = r.dest
                        }
                    }
                    break
                }
            }
            path.push(lastFlow)
        }
        console.log(`${part.toString()}: ${path.join(" -> ")}`)
        return lastFlow
    }

    accepted(part: Rating): boolean {
        return (this.flow(part) == "A")
    }

    walk(): number {
        var totalAccepted = 0
        var totalRejected = 0

        var swaths: Array<Swath> = [new Swath("in", new Range())]
        for (let i = 0; i < LOOP_SENTINEL && swaths.length > 0; i++) {
            var currentSwath = swaths.shift()!
            if (currentSwath.workflow == "A") {
                var combos = currentSwath.range.combos()
                totalAccepted += combos
                console.log(`${currentSwath.toString()} accepted (+${combos})`)
                continue
            }
            else if (currentSwath.workflow == "R") {
                var combos = currentSwath.range.combos()
                totalRejected += combos
                console.log(`${currentSwath.toString()} rejected (-${combos})`)
                continue
            }
            
            var wf = this.workflows.get(currentSwath.workflow)
            if (!wf) {
                console.log("Undefined workflow?")
                break
            }

            for (let r of wf.rules) {
                if (r.comp == "") {
                    console.log(`${currentSwath.workflow} ${fsString(r)} falls thru\n<-> ${currentSwath.range.toString()} :::(${currentSwath.range.combos().toString().padStart(16)})`)
                    currentSwath.workflow = r.dest
                    swaths.push(currentSwath)
                }
                else {
                    var splitRanges = currentSwath.range.split(r.comp, r.limit + (r.isLT ? 0 : 1))  // Non-inclusive max
                    console.log(`${currentSwath.workflow} ${fsString(r)} splits\n<-- ${splitRanges[0].toString()} :::(${splitRanges[0].combos().toString().padStart(16)})\n--> ${splitRanges[1].toString()} :::(${splitRanges[1].combos().toString().padStart(16)})`)
                    if (r.isLT) {
                        swaths.push(new Swath(r.dest, splitRanges[0]))
                        currentSwath.range = splitRanges[1]
                    }
                    else {
                        swaths.push(new Swath(r.dest, splitRanges[1]))
                        currentSwath.range = splitRanges[0]
                    }
                }
            }

            /*
            console.log(`${i}:`)
            swaths.forEach((s) => {
                console.log("--- " + s.toString())
            })
            */
        }

        console.log(`${totalAccepted} accepted + ${totalRejected} rejected = ${totalAccepted + totalRejected}`)

        return totalAccepted
    }

    toString(): string {
        return Array.from(this.workflows.entries()).map((wf) => (`${wf[0]}${wf[1].toString()}`)).join("\n")
    }
}


export default function Day18Component() {
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

        var totalRating = 0

        var ruleSplit = -1
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() == "") {
                ruleSplit = i
                break
            }
        }

        var sorter = new Sorter(lines.slice(0, ruleSplit))
        var partList = new Array<Rating>()
        lines.slice(ruleSplit+1).filter((l) => (l != "")).forEach((l) => {
            partList.push(new Rating(l))
        })
        console.log(`${sorter.workflows.size} workflows, ${partList.length} parts`)
        console.log(sorter.toString() + "\n\n" + partList.reduce((s, p) => (s + p.toString() + "\n"), ""))

        var partsAccepted = partList.filter((p) => sorter.accepted(p))

        totalRating = partsAccepted.reduce((t, p) => (t + p.value()), 0)
        setResult1(totalRating.toString())
        setDebugDisplay(debugAcc)

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        var totalCombinations = sorter.walk()
        setResult2(totalCombinations.toString())
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
