const { Service } = require("node-windows");
const svc = new Service({
  name: "Guest Book App",
  description: "Guest Book app as a Windows service.",
  script: "C:\\Users\\SERVER\\guest-book\\server\\app.js",
});

svc.on("install", () => {
  svc.start();
});

svc.install();
