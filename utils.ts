import { arrayify } from "@ethersproject/bytes";
import { isHexString, keccak256 } from "ethers";
import { Logger } from "@ethersproject/logger";
import { _base36To16 } from "@ethersproject/bignumber";

const ADDR_SIZE = 20;
const FEE_SIZE = 3;
const OFFSET = ADDR_SIZE + FEE_SIZE;
const DATA_SIZE = OFFSET + ADDR_SIZE;
const MAX_SAFE_INTEGER: number = 0x1fffffffffffff;
const safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));
export const version = "address/5.7.0";
const logger = new Logger(version);
const ibanLookup: { [character: string]: string } = {};

function log10(x: number): number {
  if (Math.log10) {
    return Math.log10(x);
  }
  return Math.log(x) / Math.LN10;
}

function getChecksumAddress(address: string): string {
  if (!isHexString(address, 20)) {
    logger.throwArgumentError("invalid address", "address", address);
  }

  address = address.toLowerCase();

  const chars = address.substring(2).split("");

  const expanded = new Uint8Array(40);
  for (let i = 0; i < 40; i++) {
    expanded[i] = chars[i].charCodeAt(0);
  }

  const hashed = arrayify(keccak256(expanded));

  for (let i = 0; i < 40; i += 2) {
    if (hashed[i >> 1] >> 4 >= 8) {
      chars[i] = chars[i].toUpperCase();
    }
    if ((hashed[i >> 1] & 0x0f) >= 8) {
      chars[i + 1] = chars[i + 1].toUpperCase();
    }
  }

  return "0x" + chars.join("");
}

export function getAddress(address: string): string {
  let result = "";

  if (typeof address !== "string") {
    logger.throwArgumentError("invalid address", "address", address);
  }

  if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
    // Missing the 0x prefix
    if (address.substring(0, 2) !== "0x") {
      address = "0x" + address;
    }

    result = getChecksumAddress(address);

    // It is a checksummed address with a bad checksum
    if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
      logger.throwArgumentError("bad address checksum", "address", address);
    }

    // Maybe ICAP? (we only support direct mode)
  } else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
    // It is an ICAP address with a bad checksum
    if (address.substring(2, 4) !== ibanChecksum(address)) {
      logger.throwArgumentError("bad icap checksum", "address", address);
    }

    result = _base36To16(address.substring(4));
    while (result.length < 40) {
      result = "0" + result;
    }
    result = getChecksumAddress("0x" + result);
  } else {
    logger.throwArgumentError("invalid address", "address", address);
  }

  return result;
}

function ibanChecksum(address: string): string {
  address = address.toUpperCase();
  address = address.substring(4) + address.substring(0, 2) + "00";

  let expanded = address
    .split("")
    .map((c) => {
      return ibanLookup[c];
    })
    .join("");

  // Javascript can handle integers safely up to 15 (decimal) digits
  while (expanded.length >= safeDigits) {
    let block = expanded.substring(0, safeDigits);
    expanded = (parseInt(block, 10) % 97) + expanded.substring(block.length);
  }

  let checksum = String(98 - (parseInt(expanded, 10) % 97));
  while (checksum.length < 2) {
    checksum = "0" + checksum;
  }

  return checksum;
}

function decodeOne(tokenFeeToken: Buffer): [[string, string], number] {
  // reads the first 20 bytes for the token address
  const tokenABuf = tokenFeeToken.slice(0, ADDR_SIZE);
  const tokenA = getAddress("0x" + tokenABuf.toString("hex"));

  // reads the next 2 bytes for the fee
  const feeBuf = tokenFeeToken.slice(ADDR_SIZE, OFFSET);
  const fee = feeBuf.readUIntBE(0, FEE_SIZE);

  // reads the next 20 bytes for the token address
  const tokenBBuf = tokenFeeToken.slice(OFFSET, DATA_SIZE);
  const tokenB = getAddress("0x" + tokenBBuf.toString("hex"));

  return [[tokenA, tokenB], fee];
}

export function decodePath(path: string): [string[], number[]] {
  let data = Buffer.from(path.slice(2), "hex");

  let tokens: string[] = [];
  let fees: number[] = [];
  let i = 0;
  let finalToken: string = "";
  while (data.length >= DATA_SIZE) {
    const [[tokenA, tokenB], fee] = decodeOne(data);
    finalToken = tokenB;
    tokens = [...tokens, tokenA];
    fees = [...fees, fee];
    data = data.slice((i + 1) * OFFSET);
    i += 1;
  }
  tokens = [...tokens, finalToken];

  return [tokens, fees];
}


