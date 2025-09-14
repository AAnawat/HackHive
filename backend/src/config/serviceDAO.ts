import dbConnection from "../infrastructure/database/connector";
import ProblemDAO from "../infrastructure/database/data-access/problemDAO";
import UserDAO from "../infrastructure/database/data-access/userDAO";

const userDAO = new UserDAO(dbConnection)
const problemDAO = new ProblemDAO(dbConnection)

export default {
    user: userDAO,
    problem: problemDAO
}