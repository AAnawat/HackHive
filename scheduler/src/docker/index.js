import http from "node:http";

const socketPath = process.env.DOCKER_SOCKET
    || (process.platform === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock");

// Stop a problem container on the local Docker engine (CLOUD_PROVIDER=local)
export default function stopContainer(containerId) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            socketPath,
            path: `/containers/${containerId}/stop?t=2`,
            method: "POST",
        }, (res) => {
            res.resume();
            // 304 = already stopped, 404 = already removed
            if ([204, 304, 404].includes(res.statusCode)) resolve();
            else reject(new Error(`Docker stop ${containerId} failed with status ${res.statusCode}`));
        });
        req.on("error", reject);
        req.end();
    });
}
