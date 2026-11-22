import app from "./app.js";


const server = app.listen(3000, () => {
    console.log("App is listening on port 3000"); 
})

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);

  server.close((err) => {
    // runs when every connection has ended
    process.exit(err ? 1 : 0);
  });

  // safety net
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));