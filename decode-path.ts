import { decodePath } from "./utils";

const bytecodes =
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce820001f4bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c0027100ee7292bd28f4a490f849fb30c28cabab9440f9e";

const results = decodePath(bytecodes);

console.log("results: ", results);
