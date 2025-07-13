import { createClient, subscribeToStream, createSubscribeRequest, sendSubscribeRequest } from "./client";
import { handleStreamEvents } from "./dataHandler";
import { ENDPOINT, TOKEN } from "./config";

async function main(): Promise<void> {
  console.log("let start");
  if (!ENDPOINT || !TOKEN) {
    console.log(ENDPOINT, TOKEN);
    console.log("Please provide Endpoint URL and Token in env file");
    return;
  }

  const client = await createClient();
  const stream = await subscribeToStream(client);
  const request = createSubscribeRequest();

  try {
    await sendSubscribeRequest(stream, request);
    console.log("Geyser connection established - watching new Pump mints. \n");
    await handleStreamEvents(stream);
  } catch (error: any) {
    console.error("Error in subscription process:", error);
    stream.end();
  }
}

main();