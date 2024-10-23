import { NextResponse } from 'next/server';
import { dbData } from '../constants';

export async function GET() {
    return NextResponse.json({ participants: dbData.participants });
  }