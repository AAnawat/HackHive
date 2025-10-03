import dbConnection from "../infrastructure/database/connector";
import ProblemDAO from "../infrastructure/database/data-access/problemDAO";
import SolveDAO from "../infrastructure/database/data-access/solveDAO";
import UserDAO from "../infrastructure/database/data-access/userDAO";
import FlagDAO from "../infrastructure/database/data-access/flagDAO";

const userDAO = new UserDAO(dbConnection)
const problemDAO = new ProblemDAO(dbConnection)
const solveDAO = new SolveDAO(dbConnection)
const flagDAO = new FlagDAO()

export default {
    user: userDAO,
    problem: problemDAO,
    solve: solveDAO,
    flag: flagDAO
}