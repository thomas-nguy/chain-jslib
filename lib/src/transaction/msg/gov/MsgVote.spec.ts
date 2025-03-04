import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';
import Long from 'long';

import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { VoteOption } from './MsgVote';
import { CroSDK } from '../../../core/cro';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { HDKey } from '../../../hdkey/hdkey';
import * as legacyAmino from '../../../cosmos/amino';

const cro = CroSDK({
    network: {
        defaultNodeUrl: '',
        chainId: 'testnet-croeseid-1',
        addressPrefix: 'tcro',
        validatorAddressPrefix: 'tcrocncl',
        validatorPubKeyPrefix: 'tcrocnclconspub',
        coin: {
            baseDenom: 'basetcro',
            croDenom: 'tcro',
        },
        bip44Path: {
            coinType: 1,
            account: 0,
        },
    },
});

describe('Testing MsgVote', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            proposalId: Big(1244000),
            voter: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            option: VoteOption.VOTE_OPTION_NO,
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.gov.MsgVote(options.value)).to.throw('Expected `options` to be of type `object`');
        });
    });

    it('Test MsgVote conversion', function () {
        const msgVote = new cro.gov.MsgVote({
            proposalId: Big(1244000),
            voter: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            option: VoteOption.VOTE_OPTION_NO,
        });

        const rawMsg: Msg = {
            typeUrl: '/cosmos.gov.v1beta1.MsgVote',
            value: {
                proposalId: Long.fromNumber(1244000, true),
                voter: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
                option: 3,
            },
        };
        expect(msgVote.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgVote Tx signing', function () {
        const hdKey = HDKey.fromMnemonic(
            'team school reopen cave banner pass autumn march immune album hockey region baby critic insect armor pigeon owner number velvet romance flight blame tone',
        );

        const privKey = hdKey.derivePrivKey("m/44'/1'/0'/0/0");
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const msgVote = new cro.gov.MsgVote({
            proposalId: Big(1244000),
            voter: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            option: VoteOption.VOTE_OPTION_NO,
        });

        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(1250),
            accountSequence: new Big(0),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(msgVote).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a540a520a1b2f636f736d6f732e676f762e763162657461312e4d7367566f7465123308e0f64b122b7463726f3138346c7461326c7379753437767779703265387a6d746361336b357971383570366334767033180312580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21030bf28c5f92c336db4703791691fa650fee408690b0a22c5ee4afb7e2508d32a712040a0208011800120410c09a0c1a4036fae282a345fd0b2653c06b7f9f8e3f6c2b29282d62f0ca63b99d9acfc602c570a792bd50afc405e35447a08ee69031f08bffaa0d0af3a91b0a66fdc3cf77eb',
        );
    });
    it('Test MsgVote amino json conversion', function () {
        const msgVote = new cro.gov.MsgVote({
            proposalId: Big(1244000),
            voter: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            option: VoteOption.VOTE_OPTION_NO,
        });

        const rawMsg: legacyAmino.Msg = {
            type: 'cosmos-sdk/MsgVote',
            value: {
                proposal_id: '1244000',
                voter: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
                option: 3,
            },
        };
        expect(msgVote.toRawAminoMsg()).to.eqls(rawMsg);
    });
});
