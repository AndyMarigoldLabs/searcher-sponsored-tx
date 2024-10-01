import { Contract, providers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";

const LOCKUP_DYNAMIC_ADDRESS = "0x9deabf7815b42bf4e9a03eec35a486ff74ee7459"; // Replace with the actual contract address
const LOCKUP_DYNAMIC_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "streamId", type: "uint256" }],
    name: "renounce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class LockupDynamic extends Base {
  private _sender: string;
  private _streamIds: number[];
  private _lockupDynamicContract: Contract;

  constructor(
    provider: providers.JsonRpcProvider,
    sender: string,
    streamIds: number[]
  ) {
    super();
    if (!isAddress(sender)) throw new Error("Bad Address");
    this._sender = sender;
    this._streamIds = streamIds;
    this._lockupDynamicContract = new Contract(
      LOCKUP_DYNAMIC_ADDRESS,
      LOCKUP_DYNAMIC_ABI,
      provider
    );
  }

  async description(): Promise<string> {
    return (
      "Renouncing these streams " +
      this._streamIds.join(",") +
      " from " +
      this._sender
    );
  }

  async getSponsoredTransactions(): Promise<Array<TransactionRequest>> {
    return Promise.all(
      this._streamIds.map(async (streamId) => {
        return {
          ...(await this._lockupDynamicContract.populateTransaction.renounce(
            streamId
          )),
          from: this._sender,
        };
      })
    );
  }
}
