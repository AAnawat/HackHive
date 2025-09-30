import type IUserDAO from '../../interfaces/DAO/userDAO'
import type IPictureManager from '../../interfaces/pictureManager'
import pictureManagerConfig from '../../config/pictureManagerConfig'

export default class DeleteUser {
    private userDAO: IUserDAO
    private pictureManager: IPictureManager

    constructor(userDAO: IUserDAO, pictureManager: IPictureManager) {
        this.userDAO = userDAO
        this.pictureManager = pictureManager
    }


    async call(id: number): Promise<boolean> {
        const user = await this.userDAO.findOne({ id })
        if (user.pfp_path !== pictureManagerConfig.defaultPath) {
            await this.pictureManager.deletePicture(user.pfp_path.split('/').pop())
        }

        const deleteResult = await this.userDAO.delete(id)
        return !!deleteResult
    }
}