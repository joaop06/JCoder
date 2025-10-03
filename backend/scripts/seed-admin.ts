import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

config();

async function main() {
    const {
        DATABASE_NAME,
        DATABASE_USER,
        DATABASE_PASSWORD,
        BACKEND_DATABASE_PORT = '3306',
        DATABASE_INITIAL_USERNAME_ADMIN,
        DATABASE_INITIAL_PASSWORD_ADMIN,
        BACKEND_DATABASE_HOST = 'localhost',
    } = process.env;

    if (!DATABASE_INITIAL_USERNAME_ADMIN || !DATABASE_INITIAL_PASSWORD_ADMIN) return;

    const conn = await mysql.createConnection({
        host: BACKEND_DATABASE_HOST,
        port: Number(BACKEND_DATABASE_PORT),
        user: DATABASE_USER,
        password: DATABASE_PASSWORD,
        database: DATABASE_NAME,
    });

    try {
        const [rows] = await conn.execute(
            'SELECT id FROM `users` WHERE `email` = ? LIMIT 1',
            [DATABASE_INITIAL_USERNAME_ADMIN]
        );
        const exists = Array.isArray(rows) && rows.length > 0;
        if (exists) return;

        let passwordToStore = DATABASE_INITIAL_PASSWORD_ADMIN;

        try {
            // Tenta usar bcrypt se disponível
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            passwordToStore = await bcrypt.hash(DATABASE_INITIAL_PASSWORD_ADMIN, 10);
        } catch {
            // Se bcrypt não estiver disponível, segue com a senha em claro
        }

        await conn.execute(
            'INSERT INTO `users` (`email`, `password`, `role`) VALUES (?, ?, ?)',
            [DATABASE_INITIAL_USERNAME_ADMIN, passwordToStore, 'admin']
        );
    } finally {
        await conn.end();
    }
}

main().catch(() => {
    // Evita derrubar o backend caso o seed falhe
});