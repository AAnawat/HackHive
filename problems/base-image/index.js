import { App } from "uWebSockets.js";
import { Server } from "socket.io";
import { spawn } from "node-pty";
import os from "os";

const app = new App();
const io = new Server({
    cors: "*",
});
var shell = os.platform() === "win32" ? "powershell.exe" : "bash";

io.attachApp(app);

io.on("connection", (socket) => {
    console.log("Someone connected");

    const ptyProcess = spawn(shell, [], {
        name: "xterm-color",
        env: {
            ...process.env,
            HOME: "/home/player",
            USER: "player",
            LOGNAME: "player",
            SHELL: "/bin/bash",
        },
        cwd: "/home/player",
        uid: 1000,
        gid: 1000,
    });

    socket.on("key", (packet) => {
        const data = JSON.parse(packet.toString());

        if (data.type === "onkey") {
            ptyProcess.write(data.key);
        }
    });

    ptyProcess.onData((data) => {
        socket.emit("data", data);
    });

    socket.on("disconnect", () => {
        ptyProcess.kill();
    });
});

app.get("/health", (res, req) => {
    res.writeStatus("200 OK").end(JSON.stringify({ status: "ok" }));
});

app.listen(1234, (token) => {
    if (!token) {
        console.warn("port already in use");
    }
});
