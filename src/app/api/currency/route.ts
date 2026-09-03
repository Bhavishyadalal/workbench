import { NextRequest, NextResponse } from "next/server";

export const revalidate = 3600; // cache for 1 hour

export async function GET(req: NextRequest) {
  const base = req.nextUrl.searchParams.get("base") || "USD";

  try {
    const res = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      base: data.base,
      date: data.date,
      rates: data.rates,
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't fetch live exchange rates right now. Try again shortly." },
      { status: 502 }
    );
  }
}
