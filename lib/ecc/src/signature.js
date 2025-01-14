import {sign, recoverPubKey, verify, calcPubKeyRecoveryParam} from "./ecdsa";
import {sha256} from "./hash";
import {getCurveByName} from "ecurve";
var secp256k1 = getCurveByName("secp256k1");
import assert from "assert";
import BigInteger from "bigi";
import PublicKey from "./PublicKey";
const Buffer = require("safe-buffer").Buffer;

class Signature {
    constructor(r1, s1, i1) {
        this.r = r1;
        this.s = s1;
        this.i = i1;
        assert.equal(this.r != null, true, "Missing parameter");
        assert.equal(this.s != null, true, "Missing parameter");
        assert.equal(this.i != null, true, "Missing parameter");
    }

    static fromBuffer(buf) {
        var i, r, s;
        assert.equal(buf.length, 65, "Invalid signature length");
        i = buf.readUInt8(0);
        assert.equal(i - 27, (i - 27) & 7, "Invalid signature parameter");
        r = BigInteger.fromBuffer(buf.slice(1, 33));
        s = BigInteger.fromBuffer(buf.slice(33));
        return new Signature(r, s, i);
    }

    toBuffer() {
        var buf;
        buf = Buffer.alloc(65);
        buf.writeUInt8(this.i, 0);
        this.r.toBuffer(32).copy(buf, 1);
        this.s.toBuffer(32).copy(buf, 33);
        return buf;
    }

    recoverPublicKeyFromBuffer(buffer) {
        return this.recoverPublicKey(sha256(buffer));
    }

    /**
        @return {PublicKey}
    */
    recoverPublicKey(sha256_buffer) {
        let Q, e, i;
        e = BigInteger.fromBuffer(sha256_buffer);
        i = this.i;
        i -= 27;
        i = i & 3;
        Q = recoverPubKey(secp256k1, e, this, i);
        return PublicKey.fromPoint(Q);
    }

    /**
        @param {Buffer} buf
        @param {PrivateKey} private_key
        @return {Signature}
    */
    static signBuffer(buf, private_key) {
        var _hash = sha256(buf);
        return Signature.signBufferSha256(_hash, private_key);
    }

    /** Sign a buffer of exactally 32 bytes in size (sha256(text))
        @param {Buffer} buf - 32 bytes binary
        @param {PrivateKey} private_key
        @return {Signature}
    */
    static signBufferSha256(buf_sha256, private_key) {
        if (buf_sha256.length !== 32 || !Buffer.isBuffer(buf_sha256))
            throw new Error("buf_sha256: 32 byte buffer requred");
        var der, e, ecsignature, i, lenR, lenS, nonce;
        i = null;
        nonce = 0;
        e = BigInteger.fromBuffer(buf_sha256);
        while (true) {
            ecsignature = sign(secp256k1, buf_sha256, private_key.d, nonce++);
            der = ecsignature.toDER();
            lenR = der[3];
            lenS = der[5 + lenR];
            if (lenR === 32 && lenS === 32) {
                i = calcPubKeyRecoveryParam(
                    secp256k1,
                    e,
                    ecsignature,
                    private_key.toPublicKey().Q
                );
                i += 4; // compressed
                i += 27; // compact  //  24 or 27 :( forcing odd-y 2nd key candidate)
                break;
            }
            if (nonce % 10 === 0) {
                console.log(
                    "WARN: " + nonce + " attempts to find canonical signature"
                );
            }
        }
        return new Signature(ecsignature.r, ecsignature.s, i);
    }

    static sign(string, private_key) {
        return Signature.signBuffer(Buffer.from(string), private_key);
    }

    /**
        @param {Buffer} un-hashed
        @param {./PublicKey}
        @return {boolean}
    */
    verifyBuffer(buf, public_key) {
        var _hash = sha256(buf);
        return this.verifyHash(_hash, public_key);
    }

    verifyHash(hash, public_key) {
        assert.equal(
            hash.length,
            32,
            "A SHA 256 should be 32 bytes long, instead got " + hash.length
        );
        return verify(
            secp256k1,
            hash,
            {
                r: this.r,
                s: this.s,
            },
            public_key.Q
        );
    }

    /* <HEX> */

    toByteBuffer() {
        var b;
        b = new ByteBuffer(
            ByteBuffer.DEFAULT_CAPACITY,
            ByteBuffer.LITTLE_ENDIAN
        );
        this.appendByteBuffer(b);
        return b.copy(0, b.offset);
    }

    static fromHex(hex) {
        return Signature.fromBuffer(Buffer.from(hex, "hex"));
    }

    toHex() {
        return this.toBuffer().toString("hex");
    }

    static signHex(hex, private_key) {
        var buf;
        buf = Buffer.from(hex, "hex");
        return Signature.signBuffer(buf, private_key);
    }

    verifyHex(hex, public_key) {
        var buf;
        buf = Buffer.from(hex, "hex");
        return this.verifyBuffer(buf, public_key);
    }
}

export default Signature;
