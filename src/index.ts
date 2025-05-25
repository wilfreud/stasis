import express, { Request, Response } from "express";

// Create a new express application instance
const app = express();

// Set the network port
const port = 7070;

// Define the root path with a greeting message
app.get("/", (_: Request, res: Response) => {
  res.json({
    message: "Playwright based PDF generator",
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
