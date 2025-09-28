import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import "dotenv/config";


const dbConnection = drizzle(process.env.DATABASE_URL!, { schema });

async function main() {
    
	await dbConnection.execute('TRUNCATE "users", "categories", "problems", "solvedRecords", "hints", "usersLikeProblems", "problemsToCategories" RESTART IDENTITY CASCADE');
}
main();