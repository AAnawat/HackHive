import sql from "../database/index.js";

export default async function queryTask() {

        const tasks = await sql`
            select * from sessions s
            where s.ended_at < NOW()
        `

        return tasks;

}