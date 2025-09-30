import s3Config from "../config/s3Config";

export default {
    defaultPath: `https://${s3Config.bucket}.s3.us-east-1.amazonaws.com/profile-pictures/default.png`,
    basePath: `https://${s3Config.bucket}.s3.us-east-1.amazonaws.com/profile-pictures/`
}