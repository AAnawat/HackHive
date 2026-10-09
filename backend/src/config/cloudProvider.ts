import "dotenv/config"

// "aws" runs problems on ECS and stores pictures on S3.
// "local" runs problems on the local Docker engine and stores pictures on disk.
const provider = process.env.CLOUD_PROVIDER === "local" ? "local" : "aws";

export default provider as "aws" | "local"
