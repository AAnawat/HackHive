import jwt from 'jsonwebtoken';
import type ITokenManager from "../../../interfaces/tokenManager"
import type User from "../../../entities/user";
import secrets from "../../../config/secrets";


class TokenManager implements ITokenManager {
    public async generate(data: User): Promise<string> {
        const token = jwt.sign(data, secrets.jwtSecret, { expiresIn: "3h" })
        return token
    }

    public async verify(token: string): Promise<User> {
        const decoded = jwt.verify(token, secrets.jwtSecret) as User
        return { id: decoded.id, username: decoded.username, gmail: decoded.gmail, pfp_path: decoded.pfp_path }
    }
}

export default new TokenManager();