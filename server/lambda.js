import serverless from "serverless-http";
import app, { connectDB } from "./index.js";

let handler;

export const lambdaHandler = async (event, context) => {
  // Keep the connection alive across invocations
  context.callbackWaitsForEmptyEventLoop = false;

  // Connect to MongoDB (reuses existing connection)
  await connectDB();

  // Lazily create the serverless handler
  if (!handler) {
    handler = serverless(app);
  }

  return handler(event, context);
};
