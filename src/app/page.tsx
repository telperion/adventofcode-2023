"use client"

import Link from 'next/link'

const latestDay = 18
const blankLead = 5
var days: Array<string> = [];
for (let i = 1; i <= latestDay; i++)
{
  days.push(String(i).padStart(2, "0"))
}
var blanks: Array<number> = []
for (let i = 1; i <= blankLead; i++)
{
  blanks.push(i)
}
 
export default function Navigation() {
  return (
    <main className="h-screen m-auto">
      <div className="w-screen text-center p-6">
        <p className="text-2xl">Advent of Code 2023</p>
        <Link className="text-xl text-lime-500 hover:text-lime-200" href="https://github.com/telperion/adventofcode-2023">Telperion&apos;s solutions</Link>
      </div>
      <div className="w-5/6 mx-auto grid grid-cols-7 grid-flow-row-dense gap-6">
        {blanks.map((i) => (
            <div key={`blank-${i}`}className="rounded-md min-w-fit bg-lime-950 p-2"></div>
        ))}
        {days.map((d) => (
            <Link key={d} href={`/day${d}`} className="rounded-md min-w-fit text-center bg-lime-900 hover:bg-lime-600 p-2"><span className="hidden md:inline">Day </span>{d}</Link>
        ))}
      </div>
    </main>
  )
}
