//通过EIP-1599来提交transaction。可以选择打几个钱包
import { BigNumber, providers, Wallet, Contract, utils, getDefaultProvider} from "ethers";
import { checkSimulation, gasPriceToGwei, printTransactions } from "./utils";
import * as dotenv from 'dotenv'  //用来从.env中加载配置文件
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { isAddress, parseUnits } from "ethers/lib/utils";


dotenv.config();
require('log-timestamp');
//——————————————————先从.env读取基本参数————————————————————————
let Number_wallet = Number(process.env.Number_wallet);
const ContractAddress = process.env.ContractAddress;
const PRICE = process.env.PRICE;
const DATA = process.env.DATA;
const GWEI = BigNumber.from(10).pow(9);//大数字
const PRIORITY_GAS_PRICE = GWEI.mul(Number(process.env.PRIORITY_GAS_FEE));
const MAX_FEE_PER_GAS = GWEI.mul(Number(process.env.MAX_FEE_PER_GAS));
console.log('MAX_FEE_PER_GAS', MAX_FEE_PER_GAS.toString())
console.log('PRIORITY_GAS_PRICE', PRIORITY_GAS_PRICE.toString())
const PRIVATE_KEY_SPONSOR_ALL=[
process.env.PRIVATE_KEY_SPONSOR0,
process.env.PRIVATE_KEY_SPONSOR1,
process.env.PRIVATE_KEY_SPONSOR2,
process.env.PRIVATE_KEY_SPONSOR3,
process.env.PRIVATE_KEY_SPONSOR4,
process.env.PRIVATE_KEY_SPONSOR5,
process.env.PRIVATE_KEY_SPONSOR6,
process.env.PRIVATE_KEY_SPONSOR7,
process.env.PRIVATE_KEY_SPONSOR8,
process.env.PRIVATE_KEY_SPONSOR9
];
const RECIPIENT_ALL=[
process.env.RECIPIENT0,
process.env.RECIPIENT1,
process.env.RECIPIENT2,
process.env.RECIPIENT3,
process.env.RECIPIENT4,
process.env.RECIPIENT5,
process.env.RECIPIENT6,
process.env.RECIPIENT7,
process.env.RECIPIENT8,
process.env.RECIPIENT9
];

let walletIndex = 0;
let PRIVATE_KEY_SPONSOR=PRIVATE_KEY_SPONSOR_ALL[walletIndex]|| "";
let RECIPIENT=RECIPIENT_ALL[walletIndex]|| "";

//——————————————————先从.env读取基本参数————————————————————————




while(Number_wallet>0){
    PRIVATE_KEY_SPONSOR=PRIVATE_KEY_SPONSOR_ALL[walletIndex]|| "";
    RECIPIENT=RECIPIENT_ALL[walletIndex]|| "";
try{
main(PRIVATE_KEY_SPONSOR, RECIPIENT)
    }catch{};
    walletIndex +=1;
    Number_wallet -=1;
}




async function main(PRIVATE_KEY_SPONSOR : string, RECIPIENT : string) {

    // ======= UNCOMMENT FOR MAINNET ==========
    let provider = getDefaultProvider('homestead'); //链接到主网默认节点
    //const provider = new providers.InfuraProvider('rinkeby', process.env.INFURA_API_KEY) //只需要最后一段API，不需要http什么的
    // ======= UNCOMMENT FOR MAINNET ==========





        // ======= 创建钱包==========\
        const walletSponsor = new Wallet(PRIVATE_KEY_SPONSOR)
        // ======= 创建钱包==========
        console.log('wallet:' ,RECIPIENT)

        const nonce = await provider.getTransactionCount(RECIPIENT, "latest");
        //console.log('nonce:' , nonce)
        const nonce_new = nonce;
        //console.log('nonce_new:' , nonce_new)
        const gasPrice = await provider.getGasPrice();// Get gas price
        console.log('gasPrice', gasPriceToGwei(gasPrice), 'Gwei')
        const network = await provider.getNetwork();// Get network
        const { chainId } = network;//Transaction object

        //这个地方要填对数据，包括价格，不然估算不了gas
        const transaction = {
        from: RECIPIENT,
        data: DATA,
        to: ContractAddress,
        value: parseUnits(String(PRICE))
        };
        const estimatedGas = await provider.estimateGas(transaction);
        console.log('estimatedGas', estimatedGas.toString())
        const estimatedGasInput=estimatedGas.add(BigNumber.from(10000))
        console.log('estimatedGasInput', estimatedGasInput.toString())
        const transactionInput = {
           type: 2, //如果要定义maxFeePerGas和maxPriorityFeePerGas，需要添加type为2，且必须要输入chainId
           nonce: nonce_new,
           from: RECIPIENT,
           to: ContractAddress,
           maxPriorityFeePerGas: PRIORITY_GAS_PRICE,
           maxFeePerGas: MAX_FEE_PER_GAS,   //这个和gasprice是不能同时有的。
           value: parseUnits(String(PRICE)),
           gasLimit: estimatedGasInput,
           chainId: chainId,
           data: DATA,
        };
        console.log('transactionInput', transactionInput)
        const signedTx = await walletSponsor.signTransaction(transactionInput);//Sign & Send transaction
        //console.log('signedTx', signedTx)
        const transactionReceipt = await provider.sendTransaction(signedTx);
        //console.log('transactionReceipt', transactionReceipt)
        await transactionReceipt.wait();
        const hash = transactionReceipt.hash;
        console.log("Your Transaction Hash is:", hash);
        const receipt = await provider.getTransactionReceipt(hash);// Get transaction receipt
        const { logs } = receipt;
        const tokenInBigNumber = BigNumber.from(logs[0].topics[3]);// Get token ID
        const tokenId = tokenInBigNumber.toNumber();
        console.log("Token ID minted:", tokenId);
    }










