import "dotenv/config"
import s3Config from "../config/s3Config";
import provider from "./cloudProvider";

const s3BasePath = `https://${s3Config.bucket}.s3.us-east-1.amazonaws.com/profile-pictures/`
const localBasePath = `${process.env.PUBLIC_API_URL || "http://localhost:8080"}/api/uploads/profile-pictures/`
const basePath = provider === "local" ? localBasePath : s3BasePath

export default {
    // Column default in the DB schema, kept fixed so migrations don't depend on the provider
    s3DefaultPath: `${s3BasePath}default.png`,
    defaultPath: `${basePath}default.png`,
    basePath: basePath,
    localDirectory: "uploads/profile-pictures",
}
