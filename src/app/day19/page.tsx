"use client"

const title = "Day 19: Aplenty"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

const verbose = true
const LOOP_SENTINEL = 1000

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
        return "{" + this.rules.map((r) => {
            if (r.comp == "") {
                return r.dest
            }
            else {
                return `${r.comp}${r.isLT ? "<" : ">"}${r.limit}:${r.dest}`
            }
        }).join(",") + "}"
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

        var lagoonArea2 = 0
        setResult2(lagoonArea2.toString())
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
