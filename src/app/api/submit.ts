// app/api/submit/route.ts
import { adminDb } from "@/config/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, age } = await req.json();
    await adminDb.collection("users").add({ name, age });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json({ error: "Error saving data" }, { status: 500 });
  }
}
