import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const month = searchParams.get('month'); // YYYY-MM

    try {
        let sql = 'SELECT * FROM lecturas';
        let params: any[] = [];

        if (month) {
            sql += ' WHERE DATE_FORMAT(fecha, "%Y-%m") = ?';
            params.push(month);
        }

        sql += ' ORDER BY fecha DESC LIMIT ?';
        params.push(limit);

        const rows = await query(sql, params);
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('❌ Error en API History:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
