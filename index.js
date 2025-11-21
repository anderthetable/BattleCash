import { MockNetworkProvider, randomUtxo, TransactionBuilder, Contract, SignatureTemplate, randomToken, randomNFT, utils } from 'cashscript'
import { stringify, hexToBin, binToHex } from '@bitauth/libauth'
import { aliceAddress, alicePkh, alicePriv, aliceTokenAddress, bobAddress, bobPkh, bobPriv, bobTokenAddress } from './keys.js'
import BattleCashArenaArtifact from './BattleCashArena.json' with {type: 'json'}
import BattleCashManagerArtifact from './BattleCashManager.json' with {type: 'json'}
import BattleCashChallengerArtifact from './BattleCashChallenger.json' with {type: 'json'}

function calculateWinner(utxo1, utxo2, championId1, championId2, address1, address2, nonce1, nonce2){

    const finalHashBytes = Array.from(utils.sha256(new Uint8Array([...nonce1, ...hexToBin(utxo1.txid).reverse(), ...hexToBin(utxo2.txid).reverse(), ...nonce2])));

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

    console.log(binToHex(finalHashBytes))

    return input2Life > input3Strength ? address1 : address2;
}

const BattleCashArenaBytecode = BattleCashArenaArtifact.debug.bytecode;
const BattleCashArenaBytecodeBin = hexToBin(BattleCashArenaBytecode)
const BattleCashChallengerBytecode = BattleCashChallengerArtifact.debug.bytecode;
const BattleCashChallengerBytecodeBin = hexToBin(BattleCashChallengerBytecode) 

const provider = new MockNetworkProvider()

let ArenaUtxos, ManagerUtxos, ChallengerUtxos, ArenaContractUtxoState, ChallengerContractUtxoState

let aliceUtxo = randomUtxo({satoshis: 1000n, token: randomNFT()})
const aliceFee = randomUtxo()
let bobUtxo = randomUtxo({satoshis: 1000n, token: randomNFT()})
let bobFee = randomUtxo()
let contractUtxoPrize = randomUtxo({satoshis: 1000n, token: randomToken()})
let mintingContractUtxoState = randomUtxo({satoshis: 1000n, token: randomNFT()})
mintingContractUtxoState.token.category = contractUtxoPrize.token.category
mintingContractUtxoState.token.nft.capability = 'minting'
mintingContractUtxoState.token.nft.commitment = '0000'

const aliceSignatureTemplate = new SignatureTemplate(alicePriv)
const bobSignatureTemplate = new SignatureTemplate(bobPriv)

const BattleCashManagerContract = new Contract(BattleCashManagerArtifact, [BattleCashArenaBytecodeBin, BattleCashChallengerBytecodeBin, contractUtxoPrize.token.category, bobUtxo.token.category, aliceUtxo.token.category], {provider})
const BattleCashArenaContract = new Contract(BattleCashArenaArtifact, [bobPkh, utils.hash256(utils.encodeInt(BigInt(2))), utils.hash256(hexToBin(BattleCashManagerContract.bytecode))], {provider})
const BattleCashChallengerContract = new Contract(BattleCashChallengerArtifact, [alicePkh, utils.hash256(hexToBin(BattleCashManagerContract.bytecode))], {provider})

provider.addUtxo(aliceAddress, aliceUtxo)
provider.addUtxo(aliceAddress, aliceFee)
provider.addUtxo(bobAddress, bobUtxo)
provider.addUtxo(bobAddress, bobFee)
provider.addUtxo(BattleCashManagerContract.tokenAddress, contractUtxoPrize)
provider.addUtxo(BattleCashManagerContract.tokenAddress, mintingContractUtxoState)

const tx = await new TransactionBuilder({provider})
    .addInput(bobUtxo, bobSignatureTemplate.unlockP2PKH())
    .addInput(mintingContractUtxoState, BattleCashManagerContract.unlock.createBattle(bobPkh, utils.hash256(utils.encodeInt(BigInt(2))), utils.hash256(hexToBin(BattleCashManagerContract.bytecode))))
    .addInput(bobFee, bobSignatureTemplate.unlockP2PKH())
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: bobUtxo.satoshis, token: {category: bobUtxo.token.category, amount: bobUtxo.token.amount, nft: {commitment: bobUtxo.token.nft.commitment, capability: bobUtxo.token.nft.capability}}})
    .addOutput({to: BattleCashManagerContract.tokenAddress, amount: mintingContractUtxoState.satoshis, token: {category: mintingContractUtxoState.token.category, amount: mintingContractUtxoState.token.amount, nft: {commitment: mintingContractUtxoState.token.nft.commitment, capability: mintingContractUtxoState.token.nft.capability}}})
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: mintingContractUtxoState.satoshis, token: {category: mintingContractUtxoState.token.category, amount: mintingContractUtxoState.token.amount, nft: {commitment: mintingContractUtxoState.token.nft.commitment, capability: 'mutable'}}})
    .addOutput({to: bobAddress, amount: bobFee.satoshis - 2000n})
    .send()

console.log(tx)

ArenaUtxos = await provider.getUtxos(BattleCashArenaContract.address)
ManagerUtxos = await BattleCashManagerContract.getUtxos()

console.log(ArenaUtxos)
ArenaContractUtxoState = ArenaUtxos.filter((utxo) => utxo.token.category === contractUtxoPrize.token.category && utxo.token.nft)

mintingContractUtxoState = ManagerUtxos.filter((utxo) => utxo.token.category === mintingContractUtxoState.token.category && utxo.token.nft)

const tx2 = await new TransactionBuilder({provider})
    .addInput(aliceUtxo, aliceSignatureTemplate.unlockP2PKH())
    .addInput(ArenaContractUtxoState[0], BattleCashArenaContract.unlock.Challenged(BigInt(1), alicePkh))
    .addInput(mintingContractUtxoState[0], BattleCashManagerContract.unlock.Challenge(BigInt(1), utils.hash256(utils.encodeInt(BigInt(2))), bobPkh, alicePkh, utils.hash256(hexToBin(BattleCashManagerContract.bytecode))))
    .addInput(aliceFee, aliceSignatureTemplate.unlockP2PKH())
    .addOutput({to: BattleCashChallengerContract.tokenAddress, amount: aliceUtxo.satoshis, token: {category: aliceUtxo.token.category, amount: aliceUtxo.token.amount, nft: {commitment: aliceUtxo.token.nft.commitment, capability: aliceUtxo.token.nft.capability}}})
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: ArenaContractUtxoState[0].satoshis, token: {category: ArenaContractUtxoState[0].token.category, amount: ArenaContractUtxoState[0].token.amount, nft: {commitment: Buffer.from([0, 1, ...alicePkh]).toString('hex'), capability: ArenaContractUtxoState[0].token.nft.capability}}})
    .addOutput({to: BattleCashManagerContract.tokenAddress, amount: mintingContractUtxoState[0].satoshis, token: {category: mintingContractUtxoState[0].token.category, amount: mintingContractUtxoState[0].token.amount, nft: {commitment: mintingContractUtxoState[0].token.nft.commitment , capability: mintingContractUtxoState[0].token.nft.capability}}})
    .addOutput({to: BattleCashChallengerContract.tokenAddress, amount: ArenaContractUtxoState[0].satoshis, token: {category: ArenaContractUtxoState[0].token.category, amount: ArenaContractUtxoState[0].token.amount, nft: {commitment: Buffer.from([0, ...bobPkh]).toString('hex'), capability: ArenaContractUtxoState[0].token.nft.capability}}})    
    .addOutput({to: aliceAddress, amount: aliceFee.satoshis - 2000n})
    .send()
console.log(tx2)
ArenaUtxos = await provider.getUtxos(BattleCashArenaContract.address)
ManagerUtxos =await BattleCashManagerContract.getUtxos()
ChallengerUtxos = await BattleCashChallengerContract.getUtxos()

ChallengerContractUtxoState = ChallengerUtxos.filter((utxo) => utxo.token.category === contractUtxoPrize.token.category && utxo.token.nft)

ArenaContractUtxoState = ArenaUtxos.filter((utxo) => utxo.token.category === contractUtxoPrize.token.category && utxo.token.nft)

contractUtxoPrize = ManagerUtxos.filter((utxo) => utxo.token.category === contractUtxoPrize.token.category && !utxo.token.nft)

aliceUtxo = ChallengerUtxos.filter((utxo) => utxo.token.category === aliceUtxo.token.category)

bobUtxo = ArenaUtxos.filter((utxo) => utxo.token.category === bobUtxo.token.category)

bobFee = await provider.getUtxos(bobAddress)

const tx3 = await new TransactionBuilder({provider})
    .addInput(ArenaContractUtxoState[0], BattleCashArenaContract.unlock.Battle(BigInt(2)))
    .addInput(ChallengerContractUtxoState[0], BattleCashChallengerContract.unlock.Battle())
    .addInput(contractUtxoPrize[0], BattleCashManagerContract.unlock.Battle(BigInt(2), utils.hash256(utils.encodeInt(BigInt(2))), bobPkh, alicePkh, utils.hash256(hexToBin(BattleCashManagerContract.bytecode))))
    .addInput(bobUtxo[0], BattleCashArenaContract.unlock.Battle(BigInt(2)))
    .addInput(aliceUtxo[0], BattleCashChallengerContract.unlock.Battle())
    .addInput(bobFee[0], bobSignatureTemplate.unlockP2PKH())
    .addOutput({to: BattleCashManagerContract.tokenAddress, amount: contractUtxoPrize[0].satoshis, token: { category: contractUtxoPrize[0].token.category, amount: contractUtxoPrize[0].token.amount - 10n}})
    .addOutput({to: bobTokenAddress, amount: bobUtxo[0].satoshis, token: {category: bobUtxo[0].token.category, amount: bobUtxo[0].token.amount, nft: {commitment: bobUtxo[0].token.nft.commitment, capability: bobUtxo[0].token.nft.capability}}})
    .addOutput({to: aliceTokenAddress, amount: aliceUtxo[0].satoshis, token: {category: aliceUtxo[0].token.category, amount: aliceUtxo[0].token.amount, nft: {commitment: aliceUtxo[0].token.nft.commitment, capability: aliceUtxo[0].token.nft.capability}}})
    .addOutput({to: calculateWinner(bobUtxo[0], aliceUtxo[0], bobUtxo[0].token.category, aliceUtxo[0].token.category, bobTokenAddress, aliceTokenAddress, new Uint8Array([2]), new Uint8Array([1])), amount: contractUtxoPrize[0].satoshis, token: {category: contractUtxoPrize[0].token.category, amount: 10n}})
    .addOutput({to: aliceAddress, amount: bobFee[0].satoshis - 2000n})
    .send()

console.log(tx3)