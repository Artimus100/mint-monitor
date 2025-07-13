import { SubscribeRequest, SubscribeUpdate } from "@triton-one/yellowstone-grpc";
import { ClientDuplexStream } from "@grpc/grpc-js";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import axios from "axios";
import { FILTER_CONFIG, ACCOUNTS_TO_INCLUDE } from "./config";

interface CompiledInstruction {
  programIdIndex: number;
  accounts: Uint8Array;
  data: Uint8Array;
}

interface Message {
  header: any;
  accountKeys: Uint8Array[];
  recentBlockhash: Uint8Array;
  instructions: CompiledInstruction[];
  versioned: boolean;
  addressTableLookups: any[];
}

export async function handleStreamEvents(
  stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.on("data", handleData);
    stream.on("error", (error: Error) => {
      console.error("Stream error:", error);
      reject(error);
      stream.end();
    });
    stream.on("end", () => {
      console.log("Stream ended");
      resolve();
    });
    stream.on("close", () => {
      console.log("Stream closed");
      resolve();
    });
  });
}

async function handleData(data: SubscribeUpdate): Promise<void> {
  const transaction = data.transaction?.transaction;
  const message = transaction?.transaction?.message;

  if (!transaction || !message) {
    return;
  }

  const matchingInstruction = message.instructions.find(matchesInstructionDiscriminator);

  if (!matchingInstruction) {
    return;
  }

  const formattedSignature = convertSignature(transaction.signature);
  const formattedData = await formatData(
    message,
    formattedSignature.base58,
    data?.transaction?.slot || ""
  );

  if (formattedData) {
    console.log("===============================================new mint detected !===============================================");
    console.log(formattedData);
    console.log("\n");
  }
}

async function formatData(
  message: Message,
  signature: string,
  slot: string
): Promise<Record<string, any> | undefined> {
  const matchingInstruction = message.instructions.find(matchesInstructionDiscriminator);

  if (!matchingInstruction) {
    return undefined;
  }

  const accountKeys = message.accountKeys;
  const includeAccounts = ACCOUNTS_TO_INCLUDE.reduce<Record<string, string>>(
    (acc, { name, index }) => {
      const accountIndex = matchingInstruction.accounts[index];
      const publicKey = accountKeys[accountIndex];
      acc[name] = new PublicKey(publicKey).toBase58();
      return acc;
    },
    {}
  );

  const instructionArgs = await decodeCreateInstructionArgs(matchingInstruction.data);

  return {
    signature,
    slot,
    ...includeAccounts,
    ...instructionArgs,
  };
}

async function decodeCreateInstructionArgs(instructionData: Uint8Array): Promise<Record<string, any>> {
  try {
    let offset = 8;
    const args: Record<string, any> = {};
    const buffer = Buffer.from(instructionData);

    const nameLength = buffer.readUInt32LE(offset);
    offset += 4;
    const nameBytes = buffer.subarray(offset, offset + nameLength);
    args.name = nameBytes.toString("utf-8");
    offset += nameLength;

    const symbolLength = buffer.readUInt32LE(offset);
    offset += 4;
    const symbolBytes = buffer.subarray(offset, offset + symbolLength);
    args.symbol = symbolBytes.toString("utf-8");
    offset += symbolLength;

    const uriLength = buffer.readUInt32LE(offset);
    offset += 4;
    const uriBytes = buffer.subarray(offset, offset + uriLength);
    args.uri = uriBytes.toString("utf-8");
    offset += uriLength;

    args.image = await getImageUri(args.uri);

    const creatorBytes = buffer.subarray(offset, offset + 32);
    args.creator = new PublicKey(creatorBytes).toBase58();

    return args;
  } catch (error) {
    console.error("Error decoding instruction args:", error);
    return {};
  }
}

const GATEWAYS = [
  "https://dweb.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/"
];

async function getImageUri(metadataUri: string): Promise<string> {
  if (!metadataUri || metadataUri === "invalid uri") {
    return "invalid uri";
  }

  const cid = metadataUri.split("/").pop();

  for (const gateway of GATEWAYS) {
    const gatewayUrl = `${gateway}${cid}`;
    try {
      const response = await axios.get(gatewayUrl, {
        headers: { "Accept": "application/json" },
        timeout: 5000
      });

      if (response?.data?.image) {
        console.log(`✅ Success from ${gateway}`);
        return resolveIpfsImageUri(response.data.image);
      }
    } catch (err) {
      if (typeof err === "object" && err !== null) {
        const status = (err as any).response?.status;
        const message = (err as any).message;
        console.warn(`⚠️ Failed to fetch from ${gateway}:`, status || message);
      } else {
        console.warn(`⚠️ Failed to fetch from ${gateway}:`, err);
      }
      continue;
    }
  }

  return "invalid uri";
}

function resolveIpfsImageUri(ipfsUri: string): string {
  if (ipfsUri.startsWith("ipfs://")) {
    const cid = ipfsUri.replace("ipfs://", "");
    return `https://cloudflare-ipfs.com/ipfs/${cid}`;
  }
  return ipfsUri;
}

function convertSignature(signature: Uint8Array): { base58: string } {
  return { base58: bs58.encode(Buffer.from(signature)) };
}

function matchesInstructionDiscriminator(ix: CompiledInstruction): boolean {
  const matches =
    ix?.data &&
    FILTER_CONFIG.instructionDiscriminators.some((discriminator) =>
      Buffer.from(discriminator).equals(ix.data.slice(0, 8))
    );
  return matches;
}