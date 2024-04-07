import { internal, external, toNano, beginCell, storeMessage, } from '@ton/core'
import { mnemonicToWalletKey } from '@ton/crypto'
import { WalletContractV4, TonClient4 } from '@ton/ton';
import { LiteClient, LiteSingleEngine, LiteRoundRobinEngine } from 'ton-lite-client';
import { Api, HttpClient } from 'tonapi-sdk-js';


const mySeed = ""
const tonapi_token = "Bearer "
const snipe_price = 8000000000


function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}

type ApiObj = TonClient4
let liteClient: LiteClient

export function intToIP(int: number) {
    const part1 = int & 255
    const part2 = (int >> 8) & 255
    const part3 = (int >> 16) & 255
    const part4 = (int >> 24) & 255

    return `${part4}.${part3}.${part2}.${part1}`
}

let lc: LiteClient;
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

const createLiteClient = (async () => {
    // Get JSON config from global.config.json
    const liteServers = [
        {
            "ip": 84478511,
            "port": 19949,
            "id": {
                "@type": "pub.ed25519",
                "key": "n4VDnSCUuSpjnCyUk9e3QOOd6o0ItSWYbTnW3Wnn8wk="
            }
        },
        {
            "ip": 84478479,
            "port": 48014,
            "id": {
                "@type": "pub.ed25519",
                "key": "3XO67K/qi+gu3T9v8G2hx1yNmWZhccL3O7SoosFo8G0="
            }
        },
        {
            "ip": -2018135749,
            "port": 53312,
            "id": {
                "@type": "pub.ed25519",
                "key": "aF91CuUHuuOv9rm2W5+O/4h38M3sRm40DtSdRxQhmtQ="
            }
        },
        {
            "ip": -2018145068,
            "port": 13206,
            "id": {
                "@type": "pub.ed25519",
                "key": "K0t3+IWLOXHYMvMcrGZDPs+pn58a17LFbnXoQkKc2xw="
            }
        },
        {
            "ip": -2018145059,
            "port": 46995,
            "id": {
                "@type": "pub.ed25519",
                "key": "wQE0MVhXNWUXpWiW5Bk8cAirIh5NNG3cZM1/fSVKIts="
            }
        },
        {
            "ip": 1091931625,
            "port": 30131,
            "id": {
                "@type": "pub.ed25519",
                "key": "wrQaeIFispPfHndEBc0s0fx7GSp8UFFvebnytQQfc6A="
            }
        },
        {
            "ip": 1091931590,
            "port": 47160,
            "id": {
                "@type": "pub.ed25519",
                "key": "vOe1Xqt/1AQ2Z56Pr+1Rnw+f0NmAA7rNCZFIHeChB7o="
            }
        },
        {
            "ip": 1091931623,
            "port": 17728,
            "id": {
                "@type": "pub.ed25519",
                "key": "BYSVpL7aPk0kU5CtlsIae/8mf2B/NrBi7DKmepcjX6Q="
            }
        },
        {
            "ip": 1091931589,
            "port": 13570,
            "id": {
                "@type": "pub.ed25519",
                "key": "iVQH71cymoNgnrhOT35tl/Y7k86X5iVuu5Vf68KmifQ="
            }
        },
        {
            "ip": -1539021362,
            "port": 52995,
            "id": {
                "@type": "pub.ed25519",
                "key": "QnGFe9kihW+TKacEvvxFWqVXeRxCB6ChjjhNTrL7+/k="
            }
        },
        {
            "ip": -1539021936,
            "port": 20334,
            "id": {
                "@type": "pub.ed25519",
                "key": "gyLh12v4hBRtyBygvvbbO2HqEtgl+ojpeRJKt4gkMq0="
            }
        },
        {
            "ip": -1136338705,
            "port": 19925,
            "id": {
                "@type": "pub.ed25519",
                "key": "ucho5bEkufbKN1JR1BGHpkObq602whJn3Q3UwhtgSo4="
            }
        },
        {
            "ip": 868465979,
            "port": 19434,
            "id": {
                "@type": "pub.ed25519",
                "key": "J5CwYXuCZWVPgiFPW+NY2roBwDWpRRtANHSTYTRSVtI="
            }
        },
        {
            "ip": 868466060,
            "port": 23067,
            "id": {
                "@type": "pub.ed25519",
                "key": "vX8d0i31zB0prVuZK8fBkt37WnEpuEHrb7PElk4FJ1o="
            }
        },
        {
            "ip": -2018147130,
            "port": 53560,
            "id": {
                "@type": "pub.ed25519",
                "key": "NlYhh/xf4uQpE+7EzgorPHqIaqildznrpajJTRRH2HU="
            }
        },
        {
            "ip": -2018147075,
            "port": 46529,
            "id": {
                "@type": "pub.ed25519",
                "key": "jLO6yoooqUQqg4/1QXflpv2qGCoXmzZCR+bOsYJ2hxw="
            }
        },
        {
            "ip": 908566172,
            "port": 51565,
            "id": {
                "@type": "pub.ed25519",
                "key": "TDg+ILLlRugRB4Kpg3wXjPcoc+d+Eeb7kuVe16CS9z8="
            }
        },
        {
            "ip": -1185526007,
            "port": 4701,
            "id": {
                "@type": "pub.ed25519",
                "key": "G6cNAr6wXBBByWDzddEWP5xMFsAcp6y13fXA8Q7EJlM="
            }
        }
    ]
    const engines: any[] = []

    for (const server of liteServers) {
        const ls = server
        engines.push(
            new LiteSingleEngine({
                host: `tcp://${intToIP(ls.ip)}:${ls.port}`,
                publicKey: Buffer.from(ls.id.key, 'base64'),
            })
        )
    }

    const engine = new LiteRoundRobinEngine(engines)
    const lc2 = new LiteClient({
        engine,
        batchSize: 1,
    })
    lc = lc2
})()
async function getLiteClient(): Promise<LiteClient> {
    if (lc) {
        return lc
    }

    await createLiteClient

    return lc as any
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


