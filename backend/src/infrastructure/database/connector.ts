import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import info from '../../config/dbConfig.js'
import * as schema from './schema'
import "dotenv/config";

let dbConnection
if (process.env.NODE_ENV === 'production') {
    dbConnection = drizzle(`postgresql://${info.username}:${info.password}@${info.host}:${info.port}/${info.database}?sslmode=no-verify`, {schema}) as NodePgDatabase<typeof schema>;
} else {
    dbConnection = drizzle(`postgresql://${info.username}:${info.password}@${info.host}:${info.port}/${info.database}`, {schema}) as NodePgDatabase<typeof schema>;
}
export default dbConnection