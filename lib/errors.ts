import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export function parseError(error: unknown): string {
  if (error instanceof Error) {
    if (process.env.NODE_ENV === "production") return "Unexpected server error";
    return error.message;
  }
  return "Unexpected server error";
}
