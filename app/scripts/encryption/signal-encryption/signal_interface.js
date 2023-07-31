
const signalProtocol = {
    signalStore: {},
    identityKeyPair: {},
    registrationId: 0,
    preKeys: [],
    preKeysToSend: [],
    signedPreKey: {},
    recipientsSessions: new Set(),
    async generateKeysAndIDs(handleTag) {
        this.signalStore = new window.SignalProtocolStore();
        // Generate identity key pair and registration id

        // eslint-disable-next-line no-negated-condition
        if (!this.signalStore.get('registrationId')) {
            this.registrationId = this.hash(handleTag);
            this.signalStore.put('registrationId', this.registrationId);
        } else {
            this.registrationId = this.signalStore.get('registrationId');
        }

        if (!this.signalStore.get('identityKey') || await !this.signalStore.loadSignedPreKey(this.registrationId - 1)) {
            console.log('Generating Keys');
            this.identityKeyPair = await libsignal.KeyHelper.generateIdentityKeyPair();
            this.signalStore.put('identityKey', this.identityKeyPair);
            this.publishIdentityKeyToServer({pubKey: window.lsUtil.arrayBufferToBase64(this.identityKeyPair.pubKey)});

            this.signedPreKey = await libsignal.KeyHelper.generateSignedPreKey(this.identityKeyPair, this.registrationId - 1);
            this.signalStore.storeSignedPreKey(this.registrationId - 1, this.signedPreKey);
            this.publishSignedKeysToServer({
                id: this.signedPreKey.keyId,
                pubKey: window.lsUtil.arrayBufferToBase64(this.signedPreKey.keyPair.pubKey),
                signature: window.lsUtil.arrayBufferToBase64(this.signedPreKey.signature),
            });
        } else {
            this.identityKeyPair = this.signalStore.get('identityKey');
            this.signedPreKey = await this.signalStore.loadSignedPreKey(this.registrationId - 1);
        }

        function hasValueByPartialKey(obj, partialKey) {
            for (const key in obj) {
                if (key.includes(partialKey) && obj[key]) {
                    return true;
                }
            }

            return false;
        }

        if (!hasValueByPartialKey(this.signalStore.store, 'KeypreKey')) {
            const preKeyCount = 10;
            for (let i = 0; i < preKeyCount; i++) {
                const baseKeyId = this.registrationId + i + 1;
                const preKey = await libsignal.KeyHelper.generatePreKey(baseKeyId);
                this.signalStore.storePreKey(baseKeyId, preKey.keyPair);
                this.preKeys.push(preKey);
                this.preKeysToSend.push({
                    id: baseKeyId,
                    pubKey: window.lsUtil.arrayBufferToBase64(preKey.keyPair.pubKey),
                });
            }

            this.publishPreKeysToServer(this.preKeysToSend);
        }
    },
    async buildEncryptSession(userHandleTag) {
        if (!this.recipientsSessions.has(userHandleTag)) {
            const keys = await this.fetchUserKeyFromServer(userHandleTag);
            if (!keys) {
                return;
            }

            keys.identityKey = window.lsUtil.base64ToArrayBuffer(keys.identityKey);
            try {
                keys.preKey.publicKey = window.lsUtil.base64ToArrayBuffer(keys.preKey.publicKey);
            } catch {
            }

            keys.signedPreKey.publicKey = window.lsUtil.base64ToArrayBuffer(keys.signedPreKey.publicKey);
            keys.signedPreKey.signature = window.lsUtil.base64ToArrayBuffer(keys.signedPreKey.signature);

            const recipientAddress = new libsignal.SignalProtocolAddress(keys.registrationId, 0);
            const sessionBuilder = new libsignal.SessionBuilder(this.signalStore, recipientAddress);
            return sessionBuilder.processPreKey(keys)
                .then(() => {
                    console.log('Success! Session Established!');
                    this.recipientsSessions.add(userHandleTag);
                    console.log(this.signalStore.store);
                }).catch(err => {
                    console.log('Failed!');
                    console.log(err);
                });
        }
    },
    async encryptMessage(message) {
        await this.buildEncryptSession(message.recipient);
        const signalMessageToAddress = new libsignal.SignalProtocolAddress(this.hash(message.recipient), 0);
        const sessionCipher = new libsignal.SessionCipher(this.signalStore, signalMessageToAddress);

        return sessionCipher.encrypt(new TextEncoder('utf-8').encode(message.message)).then(ciphertext => {
            message.message = ciphertext;
            console.log('Encrypted message successfully');
            return true;
        }).catch(err => {
            console.log(err);
        });
    },
    decryptMessage(message) {
        const signalMessageFromAddress = new libsignal.SignalProtocolAddress(this.hash(message.sender), 0);
        const sessionCipher = new libsignal.SessionCipher(this.signalStore, signalMessageFromAddress);
        return sessionCipher.decryptPreKeyWhisperMessage(message.message.body, 'binary').then(plaintext => {
            message.message = window.lsUtil.toString(plaintext);
            console.log('Decrypted message successfully');
            console.log(this.signalStore.store);
            return true;
        }).catch(err => {
            console.log(err);
        });
    },
    publishKeyToServer(uri, key) {
        fetch('http://localhost:8080/chatserver/' + uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(key),
            credentials: 'include',
        })
            .then(response => {
                if (response.ok) {
                    return true;
                }

                throw new Error('Failed to send Keys to the server.');
            })
            .then(() => {
                console.log('Keys successfully sent to the server.');
            })
            .catch(error => {
                console.error(error);
            });
    },
    publishSignedKeysToServer(signedKey) {
        this.publishKeyToServer('store_signed_public_pre_key', signedKey);
    },
    publishIdentityKeyToServer(identityKeyPub) {
        this.publishKeyToServer('store_public_key', identityKeyPub);
    },
    publishPreKeysToServer(preKeysPub) {
        this.publishKeyToServer('store_public_pre_keys', preKeysPub);
    },
    fetchUserKeyFromServer(userHandleTag) {
        return fetch('http://localhost:8080/chatserver/retrieve_user_keys?handleTag=' + userHandleTag, {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .catch(error => {
                console.error(error);
            });
    },
    hash(string) {
        let hash = 0;
        let i; let chr;
        if (string.length === 0) {
            return hash;
        }

        for (i = 0; i < string.length; i++) {
            chr = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }

        if (hash < 0) {
            return hash * -1;
        }

        return hash;
    },
};

window.addEventListener('load', () => {
    signalProtocol.generateKeysAndIDs(clientHandleTag);
});
// // Gpt generated code

// Promise.all([identityKeyPair, registrationId]).then(results => {
//     const identityKeyPair = results[0];
//     const registrationId = results[1];

//     // Store identityKeyPair and registrationId in persistent storage
// });

// // Generate prekeys
// const baseKeyId = 1;
// const preKeyCount = 100;
// const preKeys = libsignal.KeyHelper.generatePreKeys(baseKeyId, preKeyCount);

// preKeys.then(keys => {
//     // Store prekeys in persistent storage
// });

// // Generate signed prekey
// const signedPreKeyId = 1;
// const signedPreKey = libsignal.KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId);

// signedPreKey.then(key => {
//     // Store signed prekey in persistent storage
// });

// // To initiate a session
// const recipientAddress = new libsignal.SignalProtocolAddress(recipientId, recipientDeviceId);
// const sessionBuilder = new libsignal.SessionBuilder(store, recipientAddress);

// // Assume we have retrieved recipient's prekey bundle from server
// sessionBuilder.processPreKey(preKeyBundle).then(() => {
//     // Session is now established and we can encrypt messages
//     const message = 'Hello, world!';
//     const sessionCipher = new libsignal.SessionCipher(store, recipientAddress);
//     sessionCipher.encrypt(message).then(ciphertext => {
//         // Send ciphertext.body to recipient
//     });
// });

// // To handle an incoming message
// const senderAddress = new libsignal.SignalProtocolAddress(senderId, senderDeviceId);
// const sessionCipher = new libsignal.SessionCipher(store, senderAddress);

// // Assume we have received a message from sender
// sessionCipher.decryptWhisperMessage(ciphertext.body, 'binary').then(plaintext => {
//     // Handle plaintext
// });
