import sql from '../database/index.js';

export default async function deleteSession(sessionId) {

        const result = await sql`
            delete from sessions
            where id in ${sql(sessionId)}
        `

        return result;

}