import type IUserDAO from '../../interfaces/DAO/userDAO'

export default class DeleteUser {
    private userDAO: IUserDAO

    constructor(userDAO: IUserDAO) {
        this.userDAO = userDAO
    }


    async call(id: number): Promise<boolean> {
        const deleteResult = await this.userDAO.delete(id)
        return !!deleteResult
    }
}