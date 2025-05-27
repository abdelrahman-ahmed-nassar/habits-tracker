#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 Starting Habits Tracker in Electron development mode...\n");

const rootDir = process.cwd();
const frontendDir = path.join(rootDir, "frontend");
const backendDir = path.join(rootDir, "backend");

// Ensure we're in the right directory
if (!fs.existsSync(frontendDir) || !fs.existsSync(backendDir)) {
  console.error(
    "❌ Please run this script from the habits-tracker root directory"
  );
  process.exit(1);
}

function startProcess(name, command, args, cwd, color = "\x1b[36m") {
  console.log(`${color}Starting ${name}...\x1b[0m`);

  const childProcess = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  childProcess.on("error", (error) => {
    console.error(`❌ ${name} failed to start:`, error.message);
  });

  childProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error(`❌ ${name} exited with code ${code}`);
    }
  });

  return childProcess;
}

async function waitForPort(port, timeout = 30000) {
  const start = Date.now();
  const net = require("net");

  while (Date.now() - start < timeout) {
    try {
      const socket = new net.Socket();
      const connected = await new Promise((resolve) => {
        socket.setTimeout(1000);
        socket.on("connect", () => {
          socket.destroy();
          resolve(true);
        });
        socket.on("timeout", () => {
          socket.destroy();
          resolve(false);
        });
        socket.on("error", () => {
          resolve(false);
        });
        socket.connect(port, "localhost");
      });

      if (connected) return true;
    } catch (error) {
      // Port not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function main() {
  const processes = [];

  // Start backend
  console.log("\x1b[32m📡 Starting Backend Server...\x1b[0m");
  const backendProcess = startProcess(
    "Backend Server",
    "npm",
    ["run", "dev"],
    backendDir,
    "\x1b[32m" // Green
  );
  processes.push(backendProcess);

  // Wait for backend to be ready
  console.log("\x1b[33m⏳ Waiting for backend to be ready...\x1b[0m");
  const backendReady = await waitForPort(5000);
  if (!backendReady) {
    console.log(
      "\x1b[31m⚠️  Backend took too long to start, continuing anyway...\x1b[0m"
    );
  } else {
    console.log("\x1b[32m✅ Backend is ready!\x1b[0m");
  }

  // Start frontend Vite dev server
  console.log("\x1b[34m🎨 Starting Frontend Dev Server...\x1b[0m");
  const frontendProcess = startProcess(
    "Frontend Dev Server",
    "npm",
    ["run", "dev"],
    frontendDir,
    "\x1b[34m" // Blue
  );
  processes.push(frontendProcess);

  // Wait for frontend to be ready
  console.log("\x1b[33m⏳ Waiting for frontend to be ready...\x1b[0m");
  const frontendReady = await waitForPort(5173);
  if (!frontendReady) {
    console.log(
      "\x1b[31m⚠️  Frontend took too long to start, continuing anyway...\x1b[0m"
    );
  } else {
    console.log("\x1b[32m✅ Frontend is ready!\x1b[0m");
  }

  // Start Electron
  console.log("\x1b[35m⚡ Starting Electron App...\x1b[0m");
  const electronProcess = startProcess(
    "Electron App",
    "npm",
    ["run", "electron"],
    frontendDir,
    "\x1b[35m" // Magenta
  );
  processes.push(electronProcess);

  // Handle cleanup
  function cleanup() {
    console.log("\n🛑 Shutting down all processes...");
    processes.forEach((proc) => {
      if (proc && !proc.killed) {
        proc.kill("SIGTERM");
      }
    });
    setTimeout(() => {
      processes.forEach((proc) => {
        if (proc && !proc.killed) {
          proc.kill("SIGKILL");
        }
      });
      process.exit(0);
    }, 3000);
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  electronProcess.on("exit", () => {
    console.log("📱 Electron closed, shutting down dev servers...");
    cleanup();
  });

  console.log("\n💡 Press Ctrl+C to stop all servers and close Electron\n");
  console.log("🌐 Frontend: http://localhost:5173");
  console.log("🔧 Backend: http://localhost:5000");
}

main().catch(console.error);
