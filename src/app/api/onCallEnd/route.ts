// src/app/api/onCallEnd/route.ts
import { NextResponse } from "next/server";
import { deductCallQuota } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { studentId, minutes } = await req.json();

    if (!studentId || !minutes) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const newQuota = await deductCallQuota(studentId, minutes);

    return NextResponse.json({ success: true, newQuota });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
