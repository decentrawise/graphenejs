# GrapheneJS (graphenejs)

Pure JavaScript Graphene Protocol library for node.js and browsers. Can be used to construct, sign and broadcast transactions in JavaScript, and to easily obtain data from the blockchain via public APIs or local nodes.

## Setup

This library can be obtained through npm:

```
npm install --save @decentrawise/graphenejs
```

or

```
yarn add @decentrawise/graphenejs
```

## Usage

Several examples are available in the /examples folder, and the tests in /test also show how to use the library.

Browser bundles are provided, see below. A variable `graphene_js` will be available in `window` object.

Three sub-libraries are included: `ECC`, `Chain` and `Serializer`. Generally only the `ECC` and `Chain` libraries need to be used directly.

### Chain

This library provides utility functions to handle blockchain state as well as a login class that can be used for simple login functionality using a specific key seed.

#### Login

The login class uses the following format for keys:

```
keySeed = accountName + role + password
```

Using this seed, private keys are generated for each of the default roles `active, owner, memo`, or as specified. A minimum password length of 12 characters is enforced, but an even longer password is recommended. Three methods are provided:

```
generateKeys(account, password, [roles])
checkKeys(account, password, auths)
signTransaction(tr)
```

The auths object should contain the auth arrays from the account object. An example is this:

```
{
    active: [
        ["GPH5Abm5dCdy3hJ1C5ckXkqUH2Me7dXqi9Y7yjn9ACaiSJ9h8r8mL", 1]
    ]
}
```

If checkKeys is successful, you can use signTransaction to sign a TransactionBuilder transaction using the private keys for that account.

#### State container

The Chain library contains a complete state container called the ChainStore. The ChainStore will automatically configure the `set_subscribe_callback` and handle any incoming state changes appropriately. It uses Immutable.js for storing the state, so all objects are returned as immutable objects. It has its own `subscribe` method that can be used to register a callback that will be called whenever a state change happens.

The ChainStore has several useful methods to retrieve, among other things, objects, assets and accounts using either object ids or asset/account names. These methods are synchronous and will return `undefined` to indicate fetching in progress, and `null` to indicate that the object does not exist.

```
import {Apis} from "@decentrawise/graphenejs-ws";
var {ChainStore} = require("@decentrawise/graphenejs");

Apis.instance("ws://127.0.0.1:8090", true).init_promise.then((res) => {
    console.log("connected to chain id:", res[0].chain_id;
    ChainStore.init().then(() => {
        ChainStore.subscribe(updateState);
    });
});

let dynamicGlobal = null;
function updateState(object) {
    dynamicGlobal = ChainStore.getObject("2.1.0");
    console.log("ChainStore object update\n", dynamicGlobal ? dynamicGlobal.toJS() : dynamicGlobal);
}
```

### ECC

The ECC library contains all the crypto functions for private and public keys as well as transaction creation/signing and encryption.

#### Private keys

As a quick example, here's how to generate a new private key from a seed (a brainkey for example):

```
var {PrivateKey, key} = require("@decentrawise/graphenejs");

let seed = "THIS IS A TERRIBLE BRAINKEY SEED WORD SEQUENCE";
let pkey = PrivateKey.fromSeed( key.normalize_brainKey(seed) );

console.log("\nPrivate key:", pkey.toWif());
console.log("Public key :", pkey.toPublicKey().toString(), "\n");
```

#### Transactions

TODO transaction signing example

## Tests

The tests show several use cases, to run, simply type `yarn test`. The tests require a local Graphene node to be running, as well as an active internet connection.

## Documentation (esdoc)

You can access the full documentation at: [https://decentrawise.github.io/graphenejs](https://decentrawise.github.io/graphenejs)

If you want to update the documentation, for example before releasing a new version, just run `yarn docs`.

## Binaries / Browserified bundles

Please have a [look here](https://github.com/decentrawise/graphenejs/releases) to find your desired release.

If you want to build the binaries yourself you can clone this repository and run `yarn`. It will create:

-   Browserified version `build/graphenejs.js`
-   Browserified and minified (babel) version `build/graphenejs.min.js`
-   CommonJS version using webpack `build/graphenejs.cjs`
