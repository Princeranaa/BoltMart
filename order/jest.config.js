module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/tests/setup/env.js"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup/mongodb.js"],
};
