/* eslint-disable no-unused-vars */
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on) {
      on("task", {
        resetDb() {
          return null;
        },
        seedUser(email) {
          return null;
        },
        seedProducts() {
          return null;
        },
      });
    },
  },
});
