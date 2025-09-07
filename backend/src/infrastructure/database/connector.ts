import { drizzle } from 'drizzle-orm/node-postgres';
import info from '../../config/dbConfig.js'

const dbConnection = drizzle(`postgresql://${info.username}:${info.password}@${info.host}:${info.port}/${info.database}`);
export default dbConnection