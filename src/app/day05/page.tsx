"use client"

const title = "Day 5: If You Give A Seed A Fertilizer"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

type RangeMap = {
    dst: number,
    src: number,
    len: number
}

type AlmanacInstruction = {
    seed: number,
    soil?: number,
    fertilizer?: number
    water?: number,
    light?: number,
    temperature?: number,
    humidity?: number,
    location?: number
}
function instToString(inst: AlmanacInstruction) {
    return `${inst.seed} ${inst.soil || "X"} ${inst.fertilizer || "X"} ${inst.water || "X"} ${inst.light || "X"} ${inst.temperature || "X"} ${inst.humidity || "X"} ${inst.location || "X"}`
}

enum AlmanacPhase {
    SEED,
    SOIL,
    FERTILIZER,
    WATER,
    LIGHT,
    TEMPERATURE,
    HUMIDITY,
    LOCATION
}

function getThisPhase(phase: AlmanacPhase, inst: AlmanacInstruction): number {
    switch (phase) {
        case AlmanacPhase.LOCATION:     if (inst.location)      {return inst.location}
        case AlmanacPhase.HUMIDITY:     if (inst.humidity)      {return inst.humidity}
        case AlmanacPhase.TEMPERATURE:  if (inst.temperature)   {return inst.temperature}
        case AlmanacPhase.LIGHT:        if (inst.light)         {return inst.light}
        case AlmanacPhase.WATER:        if (inst.water)         {return inst.water}
        case AlmanacPhase.FERTILIZER:   if (inst.fertilizer)    {return inst.fertilizer}
        case AlmanacPhase.SOIL:         if (inst.soil)          {return inst.soil}
        default:                                                 return inst.seed
    }
}
function setThisPhase(phase: AlmanacPhase, inst: AlmanacInstruction, n: number): void {
    switch (phase) {
        case AlmanacPhase.LOCATION:     inst.location    = n; break
        case AlmanacPhase.HUMIDITY:     inst.humidity    = n; break
        case AlmanacPhase.TEMPERATURE:  inst.temperature = n; break
        case AlmanacPhase.LIGHT:        inst.light       = n; break
        case AlmanacPhase.WATER:        inst.water       = n; break
        case AlmanacPhase.FERTILIZER:   inst.fertilizer  = n; break
        case AlmanacPhase.SOIL:         inst.soil        = n; break
        default:                        inst.seed        = n
    }
}

const AlmanacHeadings = new Map<string, AlmanacPhase>([
    ["seed-to-soil",            AlmanacPhase.SOIL],
    ["soil-to-fertilizer",      AlmanacPhase.FERTILIZER],
    ["fertilizer-to-water",     AlmanacPhase.WATER],
    ["water-to-light",          AlmanacPhase.LIGHT],
    ["light-to-temperature",    AlmanacPhase.TEMPERATURE],
    ["temperature-to-humidity", AlmanacPhase.HUMIDITY],
    ["humidity-to-location",    AlmanacPhase.LOCATION]
])
const almanacTranslation = new Map<AlmanacPhase, string>()
AlmanacHeadings.forEach((v, k) => almanacTranslation.set(v, k))

function mapRange(n: number, range: RangeMap): number | null {
    if (n >= range.src && n < range.src + range.len)
    {
        return n + (range.dst - range.src)
    }
    else
    {
        return null
    }
}


export default function Day01Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin


        var seeds: Array<AlmanacInstruction> = []
        var almanac: AlmanacPhase = AlmanacPhase.SEED
        
        var lines = data.split("\n")
        lines.forEach( (l) => {
            // Run state machine
            AlmanacHeadings.forEach( (phase, heading) => {
                if (l.startsWith(heading))
                {
                    almanac = phase
                    console.log(l)
                }
            })
            
            // Collect seed list
            if (almanac == AlmanacPhase.SEED) {
                if (l.startsWith("seeds:")) {
                    l.substr(6)
                     .split(/\s+/)
                     .filter( (s) => (s != "") )
                     .forEach( (s) => {
                         seeds.push({
                             seed: parseInt(s)
                         })
                     })
                     return
                }
            }

            // Run maps as appropriate
            var mapMatch = l.match(/(\d+) (\d+) (\d+)/)
            if (mapMatch) {
                var range: RangeMap = {
                    dst: parseInt(mapMatch[1]),
                    src: parseInt(mapMatch[2]),
                    len: parseInt(mapMatch[3]),
                }
                console.log(`Range: ${range.dst} <-- ${range.src} (length ${range.len})`)
                seeds.forEach( (s) => {
                    console.log(`--- ${instToString(s)}`)
                    var n = getThisPhase(almanac - 1, s)
                    var d = mapRange(n, range)
                    if (d)
                    {
                        setThisPhase(almanac, s, d)
                        console.log(`--- Seed with ${almanacTranslation.get(almanac - 1)} ${n} gets ${almanacTranslation.get(almanac)} ${d}`)
                    }
                })
            }
        })
        
        var minLocation = Infinity;
        seeds.forEach( (s) => {
            var thisLocation = getThisPhase(AlmanacPhase.LOCATION, s)
            minLocation = (minLocation < thisLocation) ? minLocation : thisLocation
        })

        setResult1(minLocation.toString())

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        // setResult2(totalCopies.toString())

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
