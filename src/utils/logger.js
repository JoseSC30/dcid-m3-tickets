export function log(level, message) {
  console.log(
    JSON.stringify({
      time: new Date().toISOString(),
      level,
      service: process.env.SERVICE,
      message,
    }),
  );
}
