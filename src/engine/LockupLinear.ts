import { Contract, providers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";

const LOCKUP_LINEAR_ADDRESS = "0xafb979d9afad1ad27c5eff4e27226e3ab9e5dcc9"; // Replace with the actual contract address
const LOCKUP_LINEAR_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "streamId", type: "uint256" }],
    name: "renounce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class LockupLinear extends Base {
  private _sender: string;
  private _streamIds: number[];
  private _lockupLinearContract: Contract;

  constructor(
    provider: providers.JsonRpcProvider,
    sender: string,
    streamIds: number[]
  ) {
    super();
    if (!isAddress(sender)) throw new Error("Bad Address");
    this._sender = sender;
    this._streamIds = streamIds;
    this._lockupLinearContract = new Contract(
      LOCKUP_LINEAR_ADDRESS,
      LOCKUP_LINEAR_ABI,
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
          ...(await this._lockupLinearContract.populateTransaction.renounce(
            streamId
          )),
          from: this._sender,
        };
      })
    );
  }
}
