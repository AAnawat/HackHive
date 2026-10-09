import "dotenv/config"

export default {
    // Docker Desktop on Windows exposes a named pipe; Linux/macOS and containers use the unix socket
    socketPath: process.env.DOCKER_SOCKET
        || (process.platform === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock"),
    // task_definition "getting-start:1" -> image "hackhive-problem-getting-start"
    imagePrefix: process.env.DOCKER_PROBLEM_IMAGE_PREFIX || "hackhive-problem-",
    // Host the browser uses to reach published problem ports
    publicHost: process.env.DOCKER_PUBLIC_HOST || "localhost",
    problemPort: 1234,
    label: "hackhive.role",
}
