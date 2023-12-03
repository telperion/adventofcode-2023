"use client"

import Link from 'next/link'

const latestDay = 3;
var days: Array<string> = [];
for (let i = 1; i <= latestDay; i++)
{
  days.push(String(i).padStart(2, "0"));
}
 
export default function Navigation() {
  return (
    <main className="h-screen flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p className="text-2xl">Advent of Code 2023</p>
        <p className="text-xl">Telperion&apos;s solutions</p>
      </div>
      {days.map((d) => (
          <Link key={d} href={`/day${d}`} className="rounded-md min-w-fit bg-slate-900 hover:bg-slate-600 p-6">Day {d}</Link>
      ))}
    </main>
  )
}
