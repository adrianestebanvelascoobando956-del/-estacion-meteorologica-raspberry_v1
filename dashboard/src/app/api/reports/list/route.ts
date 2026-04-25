import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    
    try {
        if (!fs.existsSync(reportsDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(reportsDir);
        const reportFiles = files.map(file => {
            const stats = fs.statSync(path.join(reportsDir, file));
            return {
                name: file,
                url: `/reports/${file}`,
                date: stats.mtime,
                size: (stats.size / 1024).toFixed(2) + ' KB',
                type: file.endsWith('.xlsx') ? 'excel' : 'image'
            };
        }).sort((a, b) => b.date.getTime() - a.date.getTime());

        return NextResponse.json(reportFiles);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
