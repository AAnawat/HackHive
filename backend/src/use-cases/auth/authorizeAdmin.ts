export default class AuthorizeAdmin {
    public call(adminToken: string): boolean {
        return adminToken === process.env.ADMIN_TOKEN;
    }
}