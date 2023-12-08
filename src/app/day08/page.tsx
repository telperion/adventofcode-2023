"use client"

const title = "Day 8: Haunted Wasteland"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'
import internal from 'stream'
import { isStringObject } from 'util/types'

class Node {
    l: string
    r: string

    constructor(l: string, r: string) {
        this.l = l
        this.r = r
    }
}

class GhostCycle {
    path: Array<string>
    crossings: Map<string, Array<number>>
    cycleStart: number
    cycleLength: number

    constructor(startingNode: string) {
        this.path = [startingNode]
        this.crossings = new Map<string, Array<number>>([[startingNode, [0]]])
        this.cycleStart = -1
        this.cycleLength = -1
    }

    append(currentNode: string, stepIndex: number, turnsLength: number): boolean
    {
        // Cycle detection
        if (this.cycleStart >= 0 || this.cycleLength >= 0)
        {
            return true
        }

        if (!this.crossings.has(currentNode))
        {
            this.crossings.set(currentNode, [])
        }

        var crossed = this.crossings.get(currentNode)

        var cycleDetected = false
        var nc = -1
        for (nc of crossed!) {
            if ((stepIndex - nc) % turnsLength == 0) {
                console.log(`--- >>> True cycle detected from ${nc} to ${stepIndex}`)
                cycleDetected = true
                break
            }
        }
        if (!cycleDetected) {
            this.path.push(currentNode)
            this.crossings.get(currentNode)?.push(stepIndex)
        }
        else
        {
            this.cycleStart = nc
            this.cycleLength = stepIndex - nc
        }

        return cycleDetected
    }

    findAllEnds(limit: number): Array<number>
    {
        var ends: Array<number> = []

        for (let i = 0; i < this.path.length; i++)
        {
            if (this.path[i][2] == "Z")
            {
                ends.push(i)
                if (this.cycleStart <= i)
                {
                    for (let j = 1; i + j*this.cycleLength < limit; j++)
                    ends.push(i + j*this.cycleLength)
                }
            }
        }

        return ends.sort((l, r) => (l < r ? -1 : 1))
    }
}

export default function Day08Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        var lines = data.split("\n")

        var network = new Map<string, Node>()
        var turns = lines[0].split("").filter( (c) => (c == "L" || c == "R"))

        lines.forEach( (l) => {
            var nodeMatch = l.match(/(\w+) = \((\w+), (\w+)\)/)
            if (nodeMatch && nodeMatch.length == 4)
            {
                network.set(nodeMatch[1], new Node(nodeMatch[2], nodeMatch[3]))
            }
        })

        var i = 0
        var currentLocation = "AAA"
        if (network.size > 0)
        {
            while (currentLocation != "ZZZ" && i < 1000000000)
            {
                var lastLocation = currentLocation
                var thisTurn = turns[i % turns.length]
                var currentNode = network.get(currentLocation)
                if (!currentNode)
                {
                    throw new Error(`Couldn't find the node ${currentLocation} in the network!`)
                }
                if (thisTurn == "L") { currentLocation = currentNode.l }
                else                 { currentLocation = currentNode.r }
                console.log(`${thisTurn}: ${lastLocation} -> ${currentLocation}`)
                i++
            }
        }

        setResult1(i.toString())

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        // Record the length of each ghost path, but only walk it until it begins a cycle.
        var ghostStarts = Array.from(network.keys()).filter( (k) => (k[2] == "A") )
        var ghostLoops = new Map<string, GhostCycle>()
        var ghostEnds = new Array<Array<number>>()

        ghostStarts.forEach( (startingNode) => {
            ghostLoops.set(startingNode, new GhostCycle(startingNode))
            console.log(`Starting from ${startingNode}:`)

            var i = 0
            var currentLocation = startingNode
            if (network.size > 0) {
                while (i < 1000000) {
                    var lastLocation = currentLocation
                    var thisTurn = turns[i % turns.length]
                    var currentNode = network.get(currentLocation)
                    if (!currentNode) {
                        throw new Error(`Couldn't find the node ${currentLocation} in the network!`)
                    }
                    if (thisTurn == "L") { currentLocation = currentNode.l }
                    else                 { currentLocation = currentNode.r }
                    console.log(`--- ${i}   ${thisTurn}: ${lastLocation} -> ${currentLocation}`)
                    i++

                    // Cycle detection
                    if (ghostLoops.get(startingNode)?.append(currentLocation, i, turns.length))
                    {
                        break
                    }
                }
            }
        })

        ghostLoops.forEach( (gc, startingNode) => {
            var gcEnds = gc.findAllEnds(1000000000000)
            console.log(gc.path)
            console.log(gcEnds)
            ghostEnds.push(gcEnds)
        })
        ghostEnds.sort((l, r) => (l.length < r.length ? -1 : 1))

        var validEndStep = -1
        if (ghostEnds.length > 0) {
            for (let endStep of ghostEnds[0]) {
                var notMissing = true
                for (let i = 1; i < ghostEnds.length; i++) {
                    if (!ghostEnds[i].includes(endStep))
                    {
                        notMissing = false
                        break
                    }
                }
                if (notMissing) {
                    validEndStep = endStep
                    console.log(`${validEndStep} has all ghosts standing on a potential end node`)
                    break
                }
            }
        }

        setResult2(validEndStep.toString())

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
