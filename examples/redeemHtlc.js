import {Apis} from "@decentrawise/graphenejs-ws";
import {TransactionBuilder, ChainStore, FetchChain, PrivateKey} from "../lib";

const DEFAULT_API = "wss://node.testnet.bitshares.eu";
const DEFAULT_CONFIG = {
    core_asset: "TEST",
    address_prefix: "TEST",
};

const wifKey = "5JjjMBUHUecV8nHvgKXdjRi9oqD8h382qQrAEAdLQ4oYAoEeSv2";
const pKey = PrivateKey.fromWif(wifKey);

ChainConfig.configure(DEFAULT_CONFIG);
Apis.instance(DEFAULT_API, true).init_promise.then((res) => {
    console.log("connected to chain id:", res[0].chain_id);

    ChainStore.init().then(() => {
        let toAccount = "thtlc-3";

        Promise.all([FetchChain("getAccount", toAccount)]).then((res) => {
            let [toAccount] = res;

            let tr = new TransactionBuilder();

            let preimageValue = "My preimage value";

            // Right now you need know the htlc_id,
            // it is returned in the create_htlc operation.
            // In the future there will be a "get all htlc for account" call
            // in the backend

            let operationJSON = {
                preimage: Buffer.from(preimageValue).toString("hex"),
                fee: {
                    amount: 0,
                    asset_id: "1.3.0",
                },
                htlc_id: "1.16.61",
                redeemer: toAccount.get("id"),
                extensions: null,
            };

            console.log("tx prior serialization ", operationJSON);

            tr.add_type_operation("htlc_redeem", operationJSON);

            tr.set_required_fees().then(() => {
                tr.add_signer(pKey, pKey.toPublicKey().toPublicKeyString());
                console.log(
                    "serialized transaction:",
                    tr.serialize().operations
                );
                tr.broadcast()
                    .then((result) => {
                        console.log(
                            "hltc was succesfully redeeemed!" +
                                JSON.stringify(result)
                        );
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            });
        });
    });
});
