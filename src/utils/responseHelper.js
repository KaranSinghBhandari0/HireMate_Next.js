import { NextResponse } from 'next/server';

export function errorResponse(data = {}, status = 400) {
  return NextResponse.json(data, { status });
}

export function successResponse(data = {}, status = 200) {
  return NextResponse.json(data, { status });
}