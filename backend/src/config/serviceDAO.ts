import dbConnection from "../infrastructure/database/connector";
import ProblemDAO from "../infrastructure/database/data-access/problemDAO";
import SessionDAO from "../infrastructure/database/data-access/sessionDAO";
import SolveDAO from "../infrastructure/database/data-access/solveDAO";
import UserDAO from "../infrastructure/database/data-access/userDAO";

const userDAO = new UserDAO(dbConnection)
const problemDAO = new ProblemDAO(dbConnection)
const solveDAO = new SolveDAO(dbConnection)
const sessionDAO = new SessionDAO(dbConnection)

export default {
    user: userDAO,
    problem: problemDAO,
    solve: solveDAO,
    session: sessionDAO
}