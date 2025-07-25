const { Service } = require("node-windows");
const svc = new Service({
  name: "Guest Book App",
  description: "Guest Book app as a Windows service.",
  script: "C:\\Users\\SERVER\\guest-book\\server\\index.js",
});

svc.on("install", () => {
  svc.start();
});

svc.on("alreadyinstalled", () => {
  console.log("Service is already installed.");
});

svc.on("start", () => {
  console.log("Service started successfully.");
});

svc.on("stop", () => {
  console.log("Service stopped successfully.");
});

svc.on("uninstall", () => {
  console.log("Service uninstalled successfully.");
});

const command = process.argv[2];

if (command === "uninstall") {
  svc.uninstall();
  return;
}

svc.install();
