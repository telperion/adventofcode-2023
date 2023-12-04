"use client"

const title = "Day 4: Scratchcards"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'

export default function Day01Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        type ScratchType = {
            index: number,
            winners: Array<number>,
            choices: Array<number>,
            matches: Array<number>,
            score: number,
            copies: number
        };

        var scratches: Array<ScratchType> = []

        var lines = data.split("\n")
        lines.forEach( (l) => {
            var cardMatch = l.match(/Card\s+(\d+):(.*)\|(.*)/)
            if (!cardMatch || cardMatch.length < 4)
            {
                console.log(`"${l}" doesn't match the scratcher format`)
                return;
            }

            var index = parseInt(cardMatch[1])
            var winners: Array<number> = []
            cardMatch[2].split(/\s+/).forEach( (s) => {if (s != "") {winners.push(parseInt(s))}} )
            var choices: Array<number> = []
            cardMatch[3].split(/\s+/).forEach( (s) => {if (s != "") {choices.push(parseInt(s))}} )
            var matches: Array<number> = []
            winners.forEach( (w) => {if (choices.includes(w)) {matches.push(w)}} )
            var newScratch: ScratchType = {
                index: index,
                winners: winners,
                choices: choices,
                matches: matches,
                score: (matches.length == 0) ? 0 : 2**(matches.length-1),
                copies: 1
            }
            console.log(`${index}: ${matches} = ${newScratch.score}`)
            scratches.push(newScratch)
        })
        
        var totalScore = 0;
        scratches.forEach( (scratch) => {
            totalScore += scratch.score
        })

        setResult1(totalScore.toString())

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        for (let i = 0; i < scratches.length; i++)
        {
            console.log(`${scratches[i].copies} copies of card ${i+1} matched ${scratches[i].matches.length}!`)
            for(let cascade = 1; cascade <= scratches[i].matches.length; cascade++)
            {
                console.log(`>>> Won ${scratches[i].copies} more copies of card ${i + cascade + 1}!`)
                scratches[i + cascade].copies += scratches[i].copies
            }
        }
        
        var totalCopies = 0;
        scratches.forEach( (scratch) => {
            totalCopies += scratch.copies
        })

        setResult2(totalCopies.toString())

        // Part 2 end
        /*************************************************************/
    }, [data])
    
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-6">
            <div className="flex text-3xl">{title}</div>
            <FileDrop passData={(d: string) => {setData(d)}} />
            <div className="flex basis-1/12 flex-row items-center justify-center w-3/4">
                <div className="min-w-fit p-6">Result 1:&nbsp;</div>
                <div className="grow text-right bg-slate-900 p-6">{result1}</div>
            </div>
            <div className="flex basis-1/12 flex-row items-center justify-center w-3/4">
                <div className="min-w-fit p-6">Result 2:&nbsp;</div>
                <div className="grow text-right bg-slate-900 p-6">{result2}</div>
            </div>
            <Link className="flex text-xl underline text-slate-400 hover:text-slate-100" href="/">Return home</Link>
        </div>
    )
}
