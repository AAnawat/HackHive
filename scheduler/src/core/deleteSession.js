import sql from '../database/index.js';

export default async function deleteSession(sessionId) {

        const result = await sql`
            delete from sessions s
            where s.id = ${sql(sessionId)}
        `

        return result;

}