import {Apis} from "@decentrawise/graphenejs-ws";
import {ChainStore} from "../lib";

const DEFAULT_API = "wss://eu.nodes.bitshares.ws";
const DEFAULT_CONFIG = {
    core_asset: "BTS",
    address_prefix: "BTS",
};

ChainConfig.configure(DEFAULT_CONFIG);
Apis.instance(DEFAULT_API, true).init_promise.then((res) => {
    console.log("connected to chain id:", res[0].chain_id);

    ChainStore.init(false).then(() => {
        ChainStore.subscribe(updateState);
    });
});

let dynamicGlobal = null;
function updateState(object) {
    // dynamicGlobal = ChainStore.getObject("2.1.0");

    console.log("ChainStore object update");
}
