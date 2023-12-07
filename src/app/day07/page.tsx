"use client"

const title = "Day 7: Camel Cards"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FileDrop from '../refs/filedrop'
import internal from 'stream'

enum HandType {
    HIGHCARD = 0,
    ONEPAIR,
    TWOPAIR,
    THREEOFAKIND,
    FULLHOUSE,
    FOUROFAKIND,
    FIVEOFAKIND
}

const cardValue = "23456789TJQKA"

class CamelHand {
    hand: string
    bid: number
    handType: HandType

    static analyzeHand(s: string): HandType {
        var counts = new Map<string, number>()
        s.split("").forEach( (c) => {
            var v = counts.get(c)
            counts.set(c, (v ? v : 0) + 1)
        })
        var freqs = Array.from(counts.keys()).sort((l, r) => (counts.get(r)! - counts.get(l)!))
        console.log(freqs)
        if (counts.get(freqs[0]) == 5)      { return HandType.FIVEOFAKIND  }
        else if (counts.get(freqs[0]) == 4) { return HandType.FOUROFAKIND  }
        else if (counts.get(freqs[0]) == 3) {
            if (counts.get(freqs[1]) == 2)  { return HandType.FULLHOUSE    }
            else                            { return HandType.THREEOFAKIND }
        }
        else if (counts.get(freqs[0]) == 2) {
            if (counts.get(freqs[1]) == 2)  { return HandType.TWOPAIR      }
            else                            { return HandType.ONEPAIR      }
        }
        else                                { return HandType.HIGHCARD     }
    }

    constructor(h: string, b: number) {
        this.hand = h
        this.bid = b
        this.handType = CamelHand.analyzeHand(h)
    }

    static compare(l: CamelHand, r: CamelHand) {
        if      (l.handType < r.handType) {return -1}
        else if (l.handType > r.handType) {return  1}
        else // Same hand type - compare card-by-card
        {
            for (let i = 0; i < l.hand.length; i++)
            {
                // TODO: map ordering of cards
                var cl = cardValue.indexOf(l.hand[i])
                var cr = cardValue.indexOf(r.hand[i])
                if      (cl < cr) {return -1}
                else if (cl > cr) {return  1}
            }
            // Same exact hand
            return 0
        }
    }

    toString(): string {
        return `${this.hand} for ${this.bid} (type ${this.handType})`
    }
}


export default function Day07Component() {
    const [data, setData] = useState<string>("")
    const [result1, setResult1] = useState<string>("")
    const [result2, setResult2] = useState<string>("")

    useEffect(() => {
        /*************************************************************/
        // Part 1 begin

        var lines = data.split("\n")
        var hands = Array<CamelHand>()

        lines.forEach( (l) => {
            if (l.trim() != "")
            {
                var hand = l.substr(0, 5)
                var bid = parseInt(l.substr(6))
                hands.push(new CamelHand(hand, bid))
            }
        })

        hands = hands.sort(CamelHand.compare)
        var totalWinnings = 0
        for (let i = 0; i < hands.length; i++)
        {
            console.log(hands[i].toString())
            totalWinnings += hands[i].bid * (i+1)
        }

        setResult1(totalWinnings.toString())

        // Part 1 end
        /*************************************************************/
        // Part 2 begin

        // setResult2(totalWaysToBeat.toString())

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
