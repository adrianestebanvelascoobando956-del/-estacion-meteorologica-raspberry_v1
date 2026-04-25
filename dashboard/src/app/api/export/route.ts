import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
    return new Promise((resolve) => {
        const scriptPath = path.join(process.cwd(), '..', 'weather_analysis.py');
        
        exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
            if (stdout) console.log(`Python Output: ${stdout}`);
            if (stderr) console.error(`Python Stderr: ${stderr}`);
            
            if (error) {
                console.error(`❌ Fallo en ejecución de Python: ${error}`);
                resolve(NextResponse.json({ error: error.message, details: stderr }, { status: 500 }));
                return;
            }
            resolve(NextResponse.json({ message: 'Análisis completado', output: stdout }));
        });
    });
}
