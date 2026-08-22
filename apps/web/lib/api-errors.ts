import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { SessionError } from "./session";

/** Maps the handful of error types route handlers throw into a JSON response. */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof SessionError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
