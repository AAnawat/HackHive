import type IUserDAO from "../../interfaces/DAO/userDAO";
import type IPictureManager from "../../interfaces/pictureManager";
import type { IValidator } from "../../interfaces/validator";
import pictureManagerConfig from "../../config/pictureManagerConfig";


export default class UpdateUser {
    private userDAO: IUserDAO
    private validator: IValidator
    private encryptor: IEncryptor
    private pictureManager: IPictureManager

    constructor(userDAO: IUserDAO, validator: IValidator, encryptor: IEncryptor, pictureManager: IPictureManager) {
        this.userDAO = userDAO
        this.validator = validator
        this.encryptor = encryptor
        this.pictureManager = pictureManager
    }


    async call(id: number, packet: any, password: string): Promise<Boolean> {
        if (password) {
            var hashedPassword = await this.encryptor.hash(password)
        }
        const validating: any = {}
        if (packet.username) validating.username = packet.username
        if (packet.gmail) validating.gmail = packet.gmail
        if (password) validating.password = hashedPassword
        if (packet.profile_pic) {
            const image: File = packet.profile_pic
            const randomName = this.randomName(id, image)
            if (await this.pictureManager.savePicture(image, randomName)) {
                validating.pfp_path = pictureManagerConfig.basePath + randomName
            } else throw new Error("Failed to save profile picture")

            const user = await this.userDAO.findOne({ id })
            if (!(user.pfp_path === pictureManagerConfig.defaultPath)) {
                await this.pictureManager.deletePicture(user.pfp_path.split('/').pop())
            }
        }

        const validationResult = this.validator.validate(validating)
        if (validationResult.error) throw new Error("Invalid input data")

        const updateResult = await this.userDAO.update(id, validationResult.data, password ? validationResult.data.password : undefined)
        return !!updateResult
    }

    private randomName(id:number, image: File): string {
        const extension = image.name.split('.').pop()
        const name = `${Date.now()}_user${id}.${extension}`
        return name
    }
}