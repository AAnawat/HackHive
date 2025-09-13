import dbConnection from "../infrastructure/database/connector";
import UserDAO from "../infrastructure/database/data-access/userDAO";

const userDAO = new UserDAO(dbConnection)

export default {
    user: userDAO
}