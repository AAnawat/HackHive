import { eq } from "drizzle-orm";
import type IFlagDAO from "../../../interfaces/DAO/flagDAO";
import { connector } from "../connector";
import { flagsTable } from "../schema";

export default class FlagDAO implements IFlagDAO {
    async getByProblemId(problemId: number): Promise<{ flag_value: string; is_case_sensitive: boolean } | undefined> {
        const db = connector.getDB();
        const result = await db.select({
            flag_value: flagsTable.flag_value,
            is_case_sensitive: flagsTable.is_case_sensitive
        }).from(flagsTable).where(eq(flagsTable.problem_id, problemId)).limit(1);
        
        return result[0];
    }
}

