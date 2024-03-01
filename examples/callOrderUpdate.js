import {Apis} from "@decentrawise/graphenejs-ws";
import {TransactionBuilder, PrivateKey} from "../lib";

const DEFAULT_API = "wss://node.testnet.bitshares.eu";
const DEFAULT_CONFIG = {
    core_asset: "TEST",
    address_prefix: "TEST",
};

const wifKey = "5KBuq5WmHvgePmB7w3onYsqLM8ESomM2Ae7SigYuuwg8MDHW7NN";
const pKey = PrivateKey.fromWif(wifKey);

ChainConfig.configure(DEFAULT_CONFIG);
Apis.instance(DEFAULT_API, true).init_promise.then((res) => {
    console.log("connected to chain id:", res[0].chain_id);

    let tr = new TransactionBuilder();
    tr.add_type_operation("call_order_update", {
        funding_account: "1.2.680",
        delta_collateral: {
            amount: 1000000,
            asset_id: "1.3.0",
        },
        delta_debt: {
            amount: 0,
            asset_id: "1.3.1003",
        },
        extensions: {
            target_collateral_ratio: 250,
        },
    });

    tr.set_required_fees().then(() => {
        tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
        console.log("serialized transaction:", tr.serialize().operations);
        tr.broadcast()
            .then(() => {
                console.log("Call order update success!");
            })
            .catch((err) => {
                console.error(err);
            });
    });
});
