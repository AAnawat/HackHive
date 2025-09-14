import type Login from "../use-cases/auth/login";

export default class AuthController {
    private loginUseCase: Login;

    constructor(login: Login) {
        this.loginUseCase = login;
    }


    public async login(gmail: string, password: string): Promise<string> {
        try {

            const token = await this.loginUseCase.call(gmail, password);
            return token;
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Login failed");
        }
    }
}