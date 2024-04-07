import { internal, external, toNano, beginCell, storeMessage, } from '@ton/core'
import { mnemonicToWalletKey } from '@ton/crypto'
import { WalletContractV4, TonClient4 } from '@ton/ton';
import { Api, HttpClient } from 'tonapi-sdk-js';


const mySeed = ""
const tonapi_token = "Bearer "
const snipe_price = 8000000000


function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

type ApiObj = TonClient4

let tonapiClient: Api<unknown>;
async function getTonapiClient(): Promise<Api<unknown>> {
    if (tonapiClient) {
        return tonapiClient
    }

    const headers = {
        'Content-type': 'application/json',
        'Authorization': tonapi_token
    }


    const httpClient = new HttpClient({
        baseUrl: 'https://tonapi.io',
        baseApiParams: {
            headers,
        }
    });

    // Initialize the API client
    const client = new Api(httpClient);
    tonapiClient = client
    return client
}

const a = [] as any[]

async function main() {
    console.log(1);
    const keyPair = await mnemonicToWalletKey(mySeed.split(' '))
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    })

    const tonapi = await getTonapiClient()

    let seqno = (await tonapi.wallet.getAccountSeqno(wallet.address.toString())).seqno
    console.log('start', seqno,);

    while (!0) {
        await sleep(500)
        const res = await fetch("https://api.getgems.io/graphql?operationName=nftSearch&variables=%7B%22query%22%3A%22%7B%5C%22%24and%5C%22%3A%5B%7B%5C%22collectionAddress%5C%22%3A%5C%22EQDmkj65Ab_m0aZaW8IpKw4kYqIgITw_HRstYEkVQ6NIYCyW%5C%22%7D%2C%7B%5C%22saleType%5C%22%3A%5C%22fix_price%5C%22%7D%5D%7D%22%2C%22attributes%22%3Anull%2C%22sort%22%3A%22%5B%7B%5C%22isOnSale%5C%22%3A%7B%5C%22order%5C%22%3A%5C%22desc%5C%22%7D%7D%2C%7B%5C%22price%5C%22%3A%7B%5C%22order%5C%22%3A%5C%22asc%5C%22%7D%7D%2C%7B%5C%22index%5C%22%3A%7B%5C%22order%5C%22%3A%5C%22asc%5C%22%7D%7D%5D%22%2C%22count%22%3A30%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22566aab5b51f3a22f10b7ae0acbed38d14f7466f042a8dcbf98b260ba6c52bd33%22%7D%7D", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.7",
                "content-type": "application/json",
            },
            "method": "GET"
        });

        if (res.status != 200) {
            console.log(res.status);

            await sleep(5000)
            continue
        };

        const data = (await res.json() as any).data.alphaNftItemSearch.edges;

        for (const { node } of data) {
            if (node.sale?.fullPrice && parseInt(node.sale.fullPrice) <= snipe_price) {

                const res = await fetch("https://api.getgems.io/graphql?operationName=getNftByAddress&variables=%7B%22address%22%3A%22" + node.address + "%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22171af3c1737b4b27e2b49f1235227df026cb40f8c039bf013c37785527d21d41%22%7D%7D", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "en-US,en;q=0.7",
                        "content-type": "application/json",
                    },
                    "body": null,
                    "method": "GET"
                });

                if (res.status != 200) {
                    await sleep(2500)
                    console.log(await res.json());
                    continue
                }

                const data = (await res.json() as any).data.nft
                if (!data.sale || a.includes(data.sale?.address)) continue

                a.push(data.sale.address)

                console.log(`Found a new listing with a price ${node.sale.fullPrice}`);

                console.log(data.sale.address);
                console.log(node.sale.fullPrice / 1e9 + 1);

                const transfer = {
                    seqno,
                    secretKey: keyPair.secretKey,
                    messages: [internal({
                        to: data.sale.address,
                        value: toNano(node.sale.fullPrice / 1e9 + 1),
                        bounce: true,
                    })],
                    sendMode: 3 as any,
                }

                try {
                    // await wallet2.sendTransfer(transfer)
                    const msg = beginCell().store(storeMessage(external({
                        to: wallet.address,
                        body: wallet.createTransfer(transfer)
                    }))).endCell()

                    let k = 0;

                    while (k < 3) {
                        try {
                            console.log("Sending")
                            await tonapi.blockchain.sendBlockchainMessage({
                                boc: msg.toBoc().toString('base64'),
                            })
                            console.log("Sent")
                            seqno++
                            break
                            // return res
                        } catch (e: any) {
                            console.log("Error")
                            // lastError = err
                            k++

                            if (e.status === 429 || e.status == 500) {
                                await sleep(200)
                            } else {
                                break
                            }

                        }
                    }
                } catch (e) {

                }
            }
        }
    }

}
main()


