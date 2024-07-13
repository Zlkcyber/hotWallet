# NEAR HOT WALLET CLAIMER

Near HOT Wallet claimer for automatic claiming HOT token using Near/Lava mainnet RPC.
- you can change rpc on `rpc.js` if you want

## update 
- `git pull`
  
## Setup
- install nodejs.
- clone project ```git clone https://github.com/Zlkcyber/hotWallet.git```
- ```cd hotWallet```
- run ```npm install```.
- run ```cp account-temp.js account.js```
- open `account.js` and add ur wallet deails with this format ```accountID|privateKEY|calimDelayInHours``` , example ```test.near|akalsjfklasjfklasjfklasf|2```. it support multiple wallet
so just write down like this
```
export const acc = [
    "test1.tg|PrivateKey1|2",
    "test2.tg|PrivateKey2|2",
    "test3.tg|PrivateKey3|2"
];
```

## RUNNING
Before your running this bot, make sure your hot wallet is at full storage to minimize the risk of getting ban / nerf.
- run ```npm run claim```.

## NOTE
- please use new wallet for testing first

## Donation
- zlkcyber.near

