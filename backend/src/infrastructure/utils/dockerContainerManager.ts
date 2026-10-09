import http from "node:http";
import type IContainerManager from "../../interfaces/containerManager";
import dockerConfig from "../../config/dockerConfig";

// Runs problem containers on the local Docker engine instead of AWS ECS.
// Talks to the Docker Engine API directly over its socket / named pipe.
export default class DockerContainerManager implements IContainerManager {

    public async createContainer(taskDefinition: string, environment: Record<string, string>): Promise<string> {
        const family = taskDefinition.split(":")[0];
        const port = `${dockerConfig.problemPort}/tcp`;

        const created = await this.request("POST", "/containers/create", {
            Image: `${dockerConfig.imagePrefix}${family}`,
            Env: Object.entries(environment).map(([name, value]) => `${name}=${value}`),
            Labels: { [dockerConfig.label]: "problem" },
            ExposedPorts: { [port]: {} },
            HostConfig: {
                // Empty HostPort lets Docker pick a free port, so several sessions can run at once
                PortBindings: { [port]: [{ HostPort: "" }] },
                AutoRemove: true,
            },
        });

        await this.request("POST", `/containers/${created.Id}/start`);
        return created.Id;
    }

    public async waitContainer(containerId: string): Promise<void> {
        const deadline = Date.now() + 60_000;
        while (Date.now() < deadline) {
            const info = await this.request("GET", `/containers/${containerId}/json`);
            if (info.State?.Running) return;
            if (info.State?.Status === "exited" || info.State?.Status === "dead")
                throw new Error("Container exited before becoming ready");
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        throw new Error("Timed out waiting for container");
    }

    public async getContainerAddress(containerId: string): Promise<string> {
        const info = await this.request("GET", `/containers/${containerId}/json`);
        const hostPort = info.NetworkSettings?.Ports?.[`${dockerConfig.problemPort}/tcp`]?.[0]?.HostPort;
        if (!hostPort)
            throw new Error("Failed to get container port");

        return `${dockerConfig.publicHost}:${hostPort}`;
    }

    public async deleteContainer(containerId: string, reason: string): Promise<void> {
        console.log(`Stopping container ${containerId}: ${reason}`);
        try {
            await this.request("POST", `/containers/${containerId}/stop?t=2`);
        } catch (error) {
            // Already stopped (304) or already removed (404) is fine
            if (!(error instanceof DockerApiError && (error.status === 304 || error.status === 404)))
                throw error;
        }
    }

    private request(method: string, path: string, body?: unknown): Promise<any> {
        const payload = body === undefined ? undefined : JSON.stringify(body);

        return new Promise((resolve, reject) => {
            const req = http.request({
                socketPath: dockerConfig.socketPath,
                path,
                method,
                headers: payload
                    ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
                    : {},
            }, (res) => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    const status = res.statusCode ?? 500;
                    if (status >= 300) {
                        let message = data;
                        try { message = JSON.parse(data).message ?? data } catch {}
                        return reject(new DockerApiError(status, `Docker API ${method} ${path} failed (${status}): ${message}`));
                    }
                    try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) }
                });
            });
            req.on("error", reject);
            if (payload) req.write(payload);
            req.end();
        });
    }
}

class DockerApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}
