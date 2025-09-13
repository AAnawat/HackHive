import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import info from '../../config/dbConfig.js'
import * as schema from './schema'

const dbConnection = drizzle(`postgresql://${info.username}:${info.password}@${info.host}:${info.port}/${info.database}`) as NodePgDatabase<typeof schema>;
export default dbConnection