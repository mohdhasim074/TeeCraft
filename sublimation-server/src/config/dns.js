import dns from "node:dns/promises";

export function configureDns() {
  if (process.env.NODE_ENV === "development") {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    console.log("Development DNS resolvers configured.");
  }
}
