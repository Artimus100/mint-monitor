import Client from "@triton-one/yellowstone-grpc";
import { ClientDuplexStream } from "@grpc/grpc-js";
import { SubscribeRequest, SubscribeUpdate } from "@triton-one/yellowstone-grpc";
import { ENDPOINT, TOKEN, COMMITMENT, FILTER_CONFIG } from "./config";

export async function createClient(): Promise<Client> {
  return new Client(ENDPOINT, TOKEN || undefined, undefined);
}

export async function subscribeToStream(client: Client): Promise<ClientDuplexStream<SubscribeRequest, SubscribeUpdate>> {
  return await client.subscribe();
}

export function createSubscribeRequest(): SubscribeRequest {
  return {
    accounts: {},
    slots: {},
    transactions: {
      pumpFun: {
        accountInclude: FILTER_CONFIG.programIds,
        accountExclude: [],
        accountRequired: [],
      },
    },
    transactionsStatus: {},
    entry: {},
    blocks: {},
    blocksMeta: {},
    commitment: COMMITMENT as unknown as import("@triton-one/yellowstone-grpc").CommitmentLevel,
    accountsDataSlice: [],
    ping: undefined,
  };
}

export async function sendSubscribeRequest(
  stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>,
  request: SubscribeRequest
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.write(request, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}