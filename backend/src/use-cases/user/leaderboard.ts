import type IUserDAO from "../../interfaces/DAO/userDAO";

export interface LeaderboardEntry {
    id: number;
    username: string;
    totalScore: number;
    problemsSolved: number;
}

export default class GetLeaderboard {
    private userDAO: IUserDAO;

    constructor(userDAO: IUserDAO) {
        this.userDAO = userDAO;
    }

    async call(limit: number = 50): Promise<LeaderboardEntry[]> {
        return await this.userDAO.getLeaderboard(limit);
    }
}

