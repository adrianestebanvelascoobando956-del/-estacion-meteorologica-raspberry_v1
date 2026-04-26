import mysql from 'mysql2/promise';

export const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'c7R8*0!5#9%l%',
    database: process.env.DB_NAME || 'iot_bd',
};

export async function query(sql: string, params?: any[]) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [results] = await connection.query(sql, params);
        return results;
    } finally {
        await connection.end();
    }
}
