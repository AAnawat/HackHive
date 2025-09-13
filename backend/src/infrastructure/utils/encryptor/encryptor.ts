import * as bcrypt from "bcrypt";


export default class Encryptor implements IEncryptor {
    private saltRounds: number
    
    constructor(saltRounds: number = 10) {
        this.saltRounds = saltRounds
    }


    public async hash(password: string): Promise<string> {
        const hashedPassword = await bcrypt.hash(password, this.saltRounds)
        return hashedPassword
    }

    public async compare(password: string, hashedPassword: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(password, hashedPassword)
        return isMatch
    }
}