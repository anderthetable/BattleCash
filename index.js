import { MockNetworkProvider, randomUtxo, TransactionBuilder, Contract, SignatureTemplate, randomToken, randomNFT, utils } from 'cashscript'
import { stringify, hexToBin } from '@bitauth/libauth'
import { aliceAddress, alicePriv, aliceTokenAddress, bobAddress, bobPkh, bobPriv, bobTokenAddress } from './keys.js'
import BattleCashArenaArtifact from './BattleCashArena4.json' with {type: 'json'}
import BattleCashManagerArtifact from './BattleCashManager3.json' with {type: 'json'}

function calculateWinner(utxo1, utxo2, championId1, championId2, address1, address2){

    const finalHashBytes = Array.from(utils.sha256(new Uint8Array([...hexToBin(utxo1.txid).reverse(), ...hexToBin(utxo2.txid).reverse()])));

    let input2Strength = 10 * (((finalHashBytes[31] & 0x7f) % 10) + 1)
    let input2Life = 10 * (((finalHashBytes[30] & 0x7f) % 10) + 1)
    let input3Strength = 10 * (((finalHashBytes[29] & 0x7f) % 10) + 1)
    let input3Life = 10 * (((finalHashBytes[28] & 0x7f) % 10) + 1)

    if(utxo1.token.category === championId1 || utxo1.token.category === championId2) {
        input2Strength *= 2;
        input2Life *= 2;
        if (utxo1.token.category === championId1) input2Strength *= 3;
        if (utxo1.token.category === championId2) input2Life *= 3;
    }
    if(utxo2.token.category === championId1 || utxo2.token.category === championId2) {
        input3Strength *= 2;
        input3Life *= 2;
        if (utxo2.token.category === championId1) input3Strength *= 3;
        if (utxo2.token.category === championId2) input3Life *= 3;
    }

    return input2Life > input3Strength ? address1 : address2;
}

const BattleCashArenaBytecode = '52c853c87ea851ce01207f75bc537a885a78011f7f77017f84815a978b955a5279011f7f75011e7f77017f84815a978b955a5379011e7f75011d7f77017f84815a978b955a547a011d7f75011c7f77017f84815a978b9552cebc56798752cebc5879879b6353795295547a757c6b7c6b7c6c6c52795295537a757c6b7c6c52cebc5679876353795395547a757c6b7c6b7c6c6c6852cebc5779876352795395537a757c6b7c6c686853cebc56798753cebc5879879b637852957b757c7652957753cebc567987637853957b757c6853cebc577987637653957768687b7ba06351cd0376a91454797e0288ac7e886751cd53c7886852cd0376a914547a7e0288ac7e88c0d2c0cf88c0d3c0d09dc0d1c0ce88c0ccc0c69d6d6d51'
const BattleCashArenaBytecodeBin = hexToBin(BattleCashArenaBytecode) 

const provider = new MockNetworkProvider()

const aliceUtxo = randomUtxo({satoshis: 1000n, token: randomNFT()})
const aliceFee = randomUtxo()
let bobUtxo = randomUtxo({satoshis: 1000n, token: randomNFT()})
//bobUtxo.token.nft.commitment = '';
//bobUtxo.token.nft.capability = 'mutable'
//const bobUtxo = randomUtxo({satoshis: 1000n, token: randomToken()})
const bobFee = randomUtxo()
let contractUtxo = randomUtxo({satoshis: 1000n, token: randomToken()})
//const contractUtxo = randomUtxo()

const aliceSignatureTemplate = new SignatureTemplate(alicePriv)
const bobSignatureTemplate = new SignatureTemplate(bobPriv)

const BattleCashArenaContract = new Contract(BattleCashArenaArtifact, [bobPkh, contractUtxo.token.category, aliceUtxo.token.category, bobUtxo.token.category], {provider})
const BattleCashManagerContract = new Contract(BattleCashManagerArtifact, [BattleCashArenaBytecodeBin], {provider})

provider.addUtxo(aliceAddress, aliceUtxo)
provider.addUtxo(aliceAddress, aliceFee)
provider.addUtxo(bobAddress, bobUtxo)
provider.addUtxo(bobAddress, bobFee)
provider.addUtxo(BattleCashManagerContract.address, contractUtxo)

console.log(contractUtxo)

const tx = await new TransactionBuilder({provider})
    .addInput(bobUtxo, bobSignatureTemplate.unlockP2PKH())
    .addInput(contractUtxo, BattleCashManagerContract.unlock.createBattle(bobPkh, contractUtxo.token.category, aliceUtxo.token.category, bobUtxo.token.category))
    .addInput(bobFee, bobSignatureTemplate.unlockP2PKH())
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: bobUtxo.satoshis, token: {category: bobUtxo.token.category, amount: bobUtxo.token.amount, nft: {commitment: bobUtxo.token.nft.commitment, capability: bobUtxo.token.nft.capability}}})
    //.addOutput({to: BattleCashArenaContract.tokenAddress, amount: bobUtxo.satoshis, token: {category: bobUtxo.token.category, amount: bobUtxo.token.amount}})
    .addOutput({to: BattleCashManagerContract.tokenAddress, amount: contractUtxo.satoshis, token: {category: contractUtxo.token.category, amount: contractUtxo.token.amount - 5n}})
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: contractUtxo.satoshis, token: {category: contractUtxo.token.category, amount: 5n}})
    .addOutput({to: bobAddress, amount: bobFee.satoshis - 2000n})
    //.addOutput({to: BattleCashManagerContract.address, amount: contractUtxo.satoshis})
    .send()

console.log(tx)

let utxos = await provider.getUtxos(BattleCashArenaContract.address)

console.log("Todos ",utxos)

console.log("Antes ",contractUtxo)

contractUtxo = utxos.filter((utxo) => utxo.token.category === contractUtxo.token.category && !utxo.token.nft)

console.log("Despues ", contractUtxo)

bobUtxo = utxos.filter((utxo) => utxo.token.category === bobUtxo.token.category)

console.log("Bob ", bobUtxo)

const tx2 = await new TransactionBuilder({provider})
    //.addInput(bobUtxo, bobSignatureTemplate.unlockP2PKH())
    .addInput(aliceFee, aliceSignatureTemplate.unlockP2PKH())
    .addInput(contractUtxo[0], BattleCashArenaContract.unlock.Battle())
    .addInput(bobUtxo[0], BattleCashArenaContract.unlock.Battle())
    .addInput(aliceUtxo, aliceSignatureTemplate.unlockP2PKH())
    .addOutput({to: aliceAddress, amount: aliceFee.satoshis - 1000n})
    .addOutput({to: calculateWinner(bobUtxo[0], aliceUtxo, bobUtxo[0].token.category, aliceUtxo.token.category, bobTokenAddress, aliceTokenAddress), amount: contractUtxo[0].satoshis, token: {category: contractUtxo[0].token.category, amount: contractUtxo[0].token.amount}})
    .addOutput({to: bobTokenAddress, amount: bobUtxo[0].satoshis, token: {category: bobUtxo[0].token.category, amount: bobUtxo[0].token.amount, nft: {commitment: bobUtxo[0].token.nft.commitment, capability: bobUtxo[0].token.nft.capability}}})
    .addOutput({to: aliceTokenAddress, amount: aliceUtxo.satoshis, token: {category: aliceUtxo.token.category, amount: aliceUtxo.token.amount, nft: {commitment: aliceUtxo.token.nft.commitment, capability: aliceUtxo.token.nft.capability}}})
    .send()

console.log(tx2)