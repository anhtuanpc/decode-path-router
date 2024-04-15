import { ethers } from "ethers";

const data =
  "0x5ae401dc00000000000000000000000000000000000000000000000000000000661cf234000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000012409b81346000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000003308a93aeaa3fa657edb744e0c247cf3e49836e100000000000000000000000000000000000000000000000000000000b2d05e0000000000000000000000000000000000000000000000000001b60e95ea4cfe1200000000000000000000000000000000000000000000000000000000000000420ee7292bd28f4a490f849fb30c28cabab9440f9e002710bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c0009c40e09fabb73bd3ade0a17ecc321fd13a19e81ce8200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

const abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "previousBlockhash",
        type: "bytes32",
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "multicall",
    outputs: [
      {
        internalType: "bytes[]",
        name: "results",
        type: "bytes[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

const MulticallContractInterface = new ethers.Interface(abi);

const decodeValue = MulticallContractInterface.decodeFunctionData(
  "multicall(uint256,bytes[])",
  data
);

console.log("decode value: ", decodeValue);
