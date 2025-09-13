import type Login from "../use-cases/auth/login";

export default class AuthController {
    private loginUseCase: Login;

    constructor(login: Login) {
        this.loginUseCase = login;
    }


    public async login(email: string, password: string): Promise<string> {
        try {

            const token = await this.loginUseCase.call(email, password);
            return token;
            
        } catch (error) {
            throw new Error("Login failed");
        }
    }
}