import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const results: any = await query(
            'SELECT * FROM lecturas ORDER BY id DESC LIMIT 1'
        );
        return NextResponse.json(results[0] || null);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
