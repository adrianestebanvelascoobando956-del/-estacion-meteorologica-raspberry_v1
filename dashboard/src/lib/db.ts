import mysql from 'mysql2/promise';

export const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root', // Clave confirmada por el usuario
    database: 'iot_bd',
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
