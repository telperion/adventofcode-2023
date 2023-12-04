"use client"

import Link from 'next/link'

const latestDay = 4;
const blankLead = 5;
var days: Array<string> = [];
for (let i = 1; i <= latestDay; i++)
{
  days.push(String(i).padStart(2, "0"));
}
var blanks: Array<int> = [];
for (let i = 1; i <= blankLead; i++)
{
  blanks.push(i);
}
 
export default function Navigation() {
  return (
    <main className="h-screen m-auto">
      <div className="w-screen text-center p-6">
        <p className="text-2xl">Advent of Code 2023</p>
        <p className="text-xl">Telperion&apos;s solutions</p>
      </div>
      <div className="w-5/6 mx-auto grid grid-cols-7 grid-flow-row-dense gap-6">
        {blanks.map((i) => (
            <div key={`blank-${i}`}className="rounded-md min-w-fit bg-slate-900 p-6"></div>
        ))}
        {days.map((d) => (
            <Link key={d} href={`/day${d}`} className="rounded-md min-w-fit text-center bg-slate-800 hover:bg-slate-500 p-6">Day {d}</Link>
        ))}
      </div>
    </main>
  )
}
