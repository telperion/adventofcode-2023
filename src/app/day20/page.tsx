"use client"

const title = "Day 20: Pulse Propagation"
const working = false

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

var verbose = false
const LOOP_SENTINEL = 1000000


class Counter {
    countL: number
    countH: number

    constructor() {
        this.countL = 0
        this.countH = 0
    }

    count(pulse: boolean) {
        if (pulse) {
            this.countH++
        }
        else {
            this.countL++
        }
    }
}


class Module {
    name: string
    moduleType: string
    in: Map<string, boolean>            // States of input cables
    state: boolean                      // State that is stored on a pulse event
    msg: boolean | null                 // State that is prepared for sending
    out: Array<Module>                  // Modules that receive state after a pulse event

    constructor(n: string = "") {
        this.name = n
        this.moduleType = ""
        this.in = new Map<string, boolean>()
        this.state = false
        this.msg = null
        this.out = []
    }

    inform(m: Module) {
        // If the module needs to know what its possible inputs are
    }

    receive(sender: string, pulse: boolean) {
        this.in.set(sender, pulse)
    }

    anyHigh() {
        return Array.from(this.in.values()).some((v)=>(v))
    }
    allHigh() {
        return Array.from(this.in.values()).every((v)=>(v))
    }

    clock() {
        // by default we are a button/broadcaster
        ////console.log(`${this.name}: ${Array.from(this.in.entries()).map((v)=>(v[0] + "=" + v[1])).join(", ")}`)
        this.msg = (this.in.size > 0) ? this.allHigh() : null
        this.state = false
        this.in.clear()
        ////console.log(`### state ${this.state}, msg ${this.msg}`)
    }

    send(c: Counter): Array<Module> {
        // by default we are a button/broadcaster
        if (this.msg != null) {
            this.out.forEach((m) => {
                if (verbose && m.name != "counter") {
                    console.log(`${this.moduleType}${this.name} -${this.msg ? "hi" : "lo"}-> ${m.moduleType}${m.name} [state: ${m.state}]`)
                }
                m.receive(this.name, this.msg!)
                c.count(this.msg!)
            }) 
            return this.out
        }
        else {
            return []
        }
    }

    toString() {
        return `${this.moduleType}${this.name} -> ${this.out.map((m) => (m.name)).join(", ")} [state: ${this.state}, msg: ${this.msg}]`
    }
}

class FlipFlop extends Module {
    state: boolean
    sending: boolean

    constructor(n: string = "") {
        super(n)
        this.moduleType = "%"
        this.state = false
        this.sending = false
    }

    clock() {
        // If a flip-flop module receives a high pulse,
        // it is ignored and nothing happens.
        // However, if a flip-flop module receives a low pulse,
        // it flips between on and off.
        // If it was off, it turns on and sends a high pulse.
        // If it was on, it turns off and sends a low pulse.
        ////console.log(`${this.name}: ${Array.from(this.in.entries()).map((v)=>(v[0] + "=" + v[1])).join(", ")}`)
        if (!this.allHigh()) {
            this.state = !this.state
            this.msg = this.state
        }
        else {
            // Preserve state
            this.msg = null
        }
        this.in.clear()
        ////console.log(`### state ${this.state}, msg ${this.msg}`)
    }
}

class Conjunction extends Module {
    state: boolean
    memory: Map<string, boolean>

    constructor(n: string = "") {
        super(n)
        this.moduleType = "&"
        this.state = false
        this.memory = new Map<string, boolean>()
    }

    inform(m: Module) {
        this.memory.set(m.name, false)
    }

    anyHigh() {
        return Array.from(this.memory.values()).some((v)=>(v))
    }
    allHigh() {
        return Array.from(this.memory.values()).every((v)=>(v))
    }

    clock() {
        // When a pulse is received, the conjunction module first
        // updates its memory for that input. Then,
        // if it remembers high pulses for all inputs, it sends a low pulse;
        // otherwise, it sends a high pulse.
        ////console.log(`${this.name}: ${Array.from(this.in.entries()).map((v)=>(v[0] + "=" + v[1])).join(", ")}`)
        this.in.forEach((v, n) => {
            this.memory.set(n, v)
        })
        if (this.in.size > 0) {
            if (verbose) {
                console.log(`&&& ${this.name}: [${Array.from(this.memory.entries()).map((v) => v[0] + ":" + v[1].toString()).join(", ")}]`)
            }
            this.state = !this.allHigh()
            this.msg = this.state
        }
        else {
            this.msg = null
        }
        this.in.clear()
        ////console.log(`### state ${this.state}, msg ${this.msg}`)
    }
}


export default function Day20Component() {
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

        var multiPulses = 1
        var modules = new Map<string, Module>()
        var broadcastModule = new Module("broadcaster")

        lines.forEach((l) => {
            var m = l.match(/(\S+) -> (.*)/)
            if (m) {
                var nameClip = m[1].substring(1)
                if (m[1] == "broadcaster") {
                    modules.set("broadcaster", broadcastModule)
                }
                else if (m[1][0] == "%") {
                    modules.set(nameClip, new FlipFlop(nameClip))
                }
                else if (m[1][0] == "&") {
                    modules.set(nameClip, new Conjunction(nameClip))
                }
            }
        })
        var buttonModule = new Module("button")
        modules.set("button", buttonModule)

        lines.forEach((l) => {
            var m = l.match(/[%&]?(\S+) -> (.*)/)
            if (m) {
                var node = modules.get(m[1])
                var o = m[2].split(", ")
                o.forEach((n) => {
                    if (!modules.has(n)) {
                        modules.set(n, new Module(n))
                    }
                    node?.out.push(modules.get(n)!)
                    modules.get(n)!.inform(node!)
                })
            }
        })
        buttonModule.out.push(broadcastModule)

        if (true) {
            for (let m of modules.values()) {
                console.log(m.toString())
            }
        }

        // test
        var totalCounter = new Counter()
        const N_REPS = 1000
        for (let reps = 0; reps < N_REPS; reps++) {
            buttonModule.in.set("human", false)
            var counter = new Counter()
            var k = reps+1
            while (k % 2 == 0 && k > 0) {
                k = k / 2
            }
            verbose = (k == 1)

            var moduleFront: Array<Module> = [buttonModule]
            for (let i = 0; i < LOOP_SENTINEL && moduleFront.length > 0; i++) {
                if (verbose) {
                    console.log(`${i}: [${moduleFront.map((v) => (v.name)).join(", ")}]`)
                    /*
                    modules.forEach((m) => {
                        console.log("--- " + m.toString())
                    })
                    */
                }

                var nextFront: Array<Module> = []
                modules.forEach((module, name) => {
                    module.clock()
                })
                ////console.log(`--- clocked`)

                modules.forEach((module, name) => {
                    var modified = module.send(counter)
                    nextFront.push(...modified)
                })
                moduleFront = nextFront.reduce((a: Array<Module>, v) => (a.includes(v) ? a : a.concat([v])), [])
            }
            console.log(`>>> ${reps+1}: ${counter.countL} lo, ${counter.countH} hi`)
            totalCounter.countL += counter.countL
            totalCounter.countH += counter.countH
        }
        
        setResult1((totalCounter.countL * totalCounter.countH).toString())
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
