function SignalProtocolStore() {
    this.store = {};
    this.saveStore = function () {
        const storeCopy = {};

        if (this.store.registrationId) {
            storeCopy.registrationId = this.store.registrationId;
        }

        if (this.store.identityKey) {
            storeCopy.identityKey = {};
            storeCopy.identityKey.pubKey = util.arrayBufferToBase64(this.store.identityKey.pubKey);
            storeCopy.identityKey.privKey = util.arrayBufferToBase64(this.store.identityKey.privKey);
        }

        const keyId = '25519KeysignedKey' + (this.store.registrationId - 1);
        if (this.store[keyId]) {
            storeCopy[keyId] = {};
            storeCopy[keyId].keyPair = {};
            storeCopy[keyId].keyId = keyId;
            storeCopy[keyId].keyPair.pubKey = util.arrayBufferToBase64(this.store[keyId].keyPair.pubKey);
            storeCopy[keyId].keyPair.privKey = util.arrayBufferToBase64(this.store[keyId].keyPair.privKey);

            storeCopy[keyId].signature = util.arrayBufferToBase64(this.store[keyId].signature);
        }

        for (const key in this.store) {
            if (key.includes('KeypreKey') && this.store[key]) {
                storeCopy[key] = {};
                storeCopy[key].pubKey = util.arrayBufferToBase64(this.store[key].pubKey);
                storeCopy[key].privKey = util.arrayBufferToBase64(this.store[key].privKey);
            }
        }

        localStorage.setItem('signal_store', JSON.stringify(storeCopy));
    };

    if (!Object.is(localStorage.getItem('signal_store'), null)) {
        this.store = JSON.parse(localStorage.getItem('signal_store'));
    }

    if (this.store.identityKey) {
        this.store.identityKey.pubKey = util.base64ToArrayBuffer(this.store.identityKey.pubKey);
        this.store.identityKey.privKey = util.base64ToArrayBuffer(this.store.identityKey.privKey);
    }

    const keyId = '25519KeysignedKey' + (this.store.registrationId - 1);

    if (this.store[keyId]) {
        this.store[keyId].keyPair.pubKey = util.base64ToArrayBuffer(this.store[keyId].keyPair.pubKey);
        this.store[keyId].keyPair.privKey = util.base64ToArrayBuffer(this.store[keyId].keyPair.privKey);

        this.store[keyId].signature = util.base64ToArrayBuffer(this.store[keyId].signature);
    }

    for (const key in this.store) {
        if (key.includes('KeypreKey') && this.store[key]) {
            this.store[key].pubKey = util.base64ToArrayBuffer(this.store[key].pubKey);
            this.store[key].privKey = util.base64ToArrayBuffer(this.store[key].privKey);
        }
    }
}

SignalProtocolStore.prototype = {
    util: window.util,

    Direction: {
        SENDING: 1,
        RECEIVING: 2,
    },

    getIdentityKeyPair() {
        return Promise.resolve(this.get('identityKey'));
    },
    getLocalRegistrationId() {
        return Promise.resolve(this.get('registrationId'));
    },
    put(key, value) {
        if (key === undefined || value === undefined || key === null || value === null) {
            throw new Error('Tried to store undefined/null');
        }

        this.store[key] = value;
        this.saveStore();
    },
    get(key, defaultValue) {
        if (key === null || key === undefined) {
            throw new Error('Tried to get value for undefined/null key');
        }

        if (key in this.store) {
            return this.store[key];
        }

        return defaultValue;
    },
    remove(key) {
        if (key === null || key === undefined) {
            throw new Error('Tried to remove value for undefined/null key');
        }

        delete this.store[key];
        this.saveStore();
    },

    isTrustedIdentity(identifier, identityKey, direction) {
        if (identifier === null || identifier === undefined) {
            throw new Error('tried to check identity key for undefined/null key');
        }

        if (!(identityKey instanceof ArrayBuffer)) {
            throw new Error('Expected identityKey to be an ArrayBuffer');
        }

        const trusted = this.get('identityKey' + identifier);
        if (trusted === undefined) {
            return Promise.resolve(true);
        }

        return Promise.resolve(util.toString(identityKey) === util.toString(trusted));
    },
    loadIdentityKey(identifier) {
        if (identifier === null || identifier === undefined) {
            throw new Error('Tried to get identity key for undefined/null key');
        }

        return Promise.resolve(this.get('identityKey' + identifier));
    },
    saveIdentity(identifier, identityKey) {
        if (identifier === null || identifier === undefined) {
            throw new Error('Tried to put identity key for undefined/null key');
        }

        const address = new libsignal.SignalProtocolAddress.fromString(identifier);

        const existing = this.get('identityKey' + address.getName());
        this.put('identityKey' + address.getName(), identityKey);

        if (existing && util.toString(identityKey) !== util.toString(existing)) {
            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    },

    /* Returns a prekeypair object or undefined */
    loadPreKey(keyId) {
        let res = this.get('25519KeypreKey' + keyId);
        if (res !== undefined) {
            res = {pubKey: res.pubKey, privKey: res.privKey};
        }

        return Promise.resolve(res);
    },
    storePreKey(keyId, keyPair) {
        return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair));
    },
    removePreKey(keyId) {
        return Promise.resolve(this.remove('25519KeypreKey' + keyId));
    },

    /* Returns a signed keypair object or undefined */
    loadSignedPreKey(keyId) {
        let res = this.get('25519KeysignedKey' + keyId);
        if (res !== undefined) {
            res = {pubKey: res.keyPair.pubKey, privKey: res.keyPair.privKey};
        }

        return Promise.resolve(res);
    },
    storeSignedPreKey(keyId, keyPair) {
        return Promise.resolve(this.put('25519KeysignedKey' + keyId, keyPair));
    },
    removeSignedPreKey(keyId) {
        return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
    },

    loadSession(identifier) {
        return Promise.resolve(this.get('session' + identifier));
    },
    storeSession(identifier, record) {
        return Promise.resolve(this.put('session' + identifier, record));
    },
    removeSession(identifier) {
        return Promise.resolve(this.remove('session' + identifier));
    },
    removeAllSessions(identifier) {
        for (const id in this.store) {
            if (id.startsWith('session' + identifier)) {
                delete this.store[id];
            }
        }

        return Promise.resolve();
    },
};

const util = (function () {
    'use strict';

    const StaticArrayBufferProto = new ArrayBuffer().__proto__;

    return {
        toString(thing) {
            if (typeof thing === 'string') {
                return thing;
            }

            return new dcodeIO.ByteBuffer.wrap(thing).toString('binary');
        },
        toArrayBuffer(thing) {
            if (thing === undefined) {
                return undefined;
            }

            if (thing === Object(thing)) {
                if (thing.__proto__ == StaticArrayBufferProto) {
                    return thing;
                }
            }

            let str;
            if (typeof thing === 'string') {
                str = thing;
            } else {
                throw new Error('Tried to convert a non-string of type ' + typeof thing + ' to an array buffer');
            }

            return new dcodeIO.ByteBuffer.wrap(thing, 'binary').toArrayBuffer();
        },
        isEqual(a, b) {
            // TODO: Special-case arraybuffers, etc
            if (a === undefined || b === undefined) {
                return false;
            }

            a = util.toString(a);
            b = util.toString(b);
            const maxLength = Math.max(a.length, b.length);
            if (maxLength < 5) {
                throw new Error('a/b compare too short');
            }

            return a.substring(0, Math.min(maxLength, a.length)) == b.substring(0, Math.min(maxLength, b.length));
        },
        arrayBufferToBase64(buffer) {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            return window.btoa(binary);
        },
        base64ToArrayBuffer(base64) {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            return bytes.buffer;
        },
    };
})();

window.SignalProtocolStore = SignalProtocolStore;
window.lsUtil = util;
