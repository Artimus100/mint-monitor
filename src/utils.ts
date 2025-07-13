import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { FILTER_CONFIG } from "./config";

interface CompiledInstruction {
  programIdIndex: number;
  accounts: Uint8Array;
  data: Uint8Array;
}

export function convertSignature(signature: Uint8Array): { base58: string } {
  return { base58: bs58.encode(Buffer.from(signature)) };
}

export function matchesInstructionDiscriminator(ix: CompiledInstruction): boolean {
  const matches =
    ix?.data &&
    FILTER_CONFIG.instructionDiscriminators.some((discriminator) =>
      Buffer.from(discriminator).equals(ix.data.slice(0, 8))
    );
  return matches;
}