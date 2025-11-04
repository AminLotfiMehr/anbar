module.exports = {
  apps: [
    {
      name: "inventory-app",
      script: "bun",
      args: "run start",
      cwd: "/home/isaco/inventory-app",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
