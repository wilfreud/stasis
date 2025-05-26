import { Request, Response, NextFunction } from "express";

// Benchmark middleware
const benchmarkMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const timeInMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    console.log(
      `➡️ ${req.method} ${req.url} took ${timeInMs}ms (${parseInt(timeInMs) / 1000}s)`,
    );
  });

  next();
};

export default benchmarkMiddleware;
