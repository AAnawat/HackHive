import type IUserDAO from "../../interfaces/DAO/userDAO";

export default class UserPasswordCheck {
    private encryptor: IEncryptor;
    private userDAO: IUserDAO;

    constructor(encryptor: IEncryptor, userDAO: IUserDAO) {
        this.encryptor = encryptor;
        this.userDAO = userDAO;
    }

    public async call(userID: number, password: string): Promise<boolean> {
        const user = await this.userDAO.findForAuth({ id: userID });
        if (!user) throw new Error("User not found");

        const isMatch = await this.encryptor.compare(password, user.password);
        return isMatch;
    }
}