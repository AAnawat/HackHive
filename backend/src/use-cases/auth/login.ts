import type IUserDAO from "../../interfaces/DAO/userDAO";
import type ITokenManager from "../../interfaces/tokenManager";

export default class Login {
    private userDAO: IUserDAO
    private encryptor: IEncryptor
    private tokenManager: ITokenManager

    constructor(userDAO: IUserDAO, encryptor: IEncryptor, tokenManager: ITokenManager) {
        this.userDAO = userDAO
        this.encryptor = encryptor
        this.tokenManager = tokenManager
    }


    async call(gmail: string, password: string): Promise<string> {
        const user = await this.userDAO.findForAuth({ gmail })
        if (!user) throw new Error("User not found")

        const passwordMatch = await this.encryptor.compare(password, user.password)
        if (!passwordMatch) throw new Error("Invalid password")
        
        const postTokenUser = { id: user.id, username: user.username, gmail: user.gmail, pfp_path: user.pfp_path }
        const token = await this.tokenManager.generate(postTokenUser)
        return token
    }
}