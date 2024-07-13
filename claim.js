import { KeyPair, keyStores, connect, Near } from "near-api-js";
import { Twisters } from "twisters";
import BigNumber from "bignumber.js";
import { mainnetConfig } from "./rpc.js";
import { acc } from "./account.js";

const near = new Near(mainnetConfig);
const twisters = new Twisters();

const getAccount = (accountId, privateKey) =>
  new Promise(async (resolve, reject) => {
    try {
      const keyStore = new keyStores.InMemoryKeyStore();
      const keyPair = KeyPair.fromString(privateKey);
      await keyStore.setKey(mainnetConfig.networkId, accountId, keyPair);

      const connectionConfig = {
        deps: {
          keyStore,
        },
        ...mainnetConfig,
      };

      const accountConnection = await connect(connectionConfig);
      const account = await accountConnection.account(accountId);

      resolve(account);
    } catch (error) {
      reject(error);
    }
  });

const getUser = async (near, accountId) => {
  const argument = {
    account_id: accountId,
  };

  const result = await near.connection.provider.query({
    account_id: "game.hot.tg",
    finality: "optimistic",
    request_type: "call_function",
    method_name: "get_user",
    args_base64: Buffer.from(JSON.stringify(argument)).toString("base64"),
  });

  const detailUser = JSON.parse(Buffer.from(result.result).toString());

  return detailUser;
};

const getNearBalance = async (accountId, privateKey) => {
  const account = await getAccount(accountId, privateKey);
  const Nearbalance = await account.getAccountBalance();
  return new BigNumber(Nearbalance.total).dividedBy(1e24);
};

const processAccount = async (accountId, privateKey, delayInHours) => {
  while (true) {
    try {
      const mineAndUpdate = async () => {
        const NearBalanceUser = await getNearBalance(accountId, privateKey);

        twisters.put(accountId, {
          text: `
Account ID : ${accountId}
Near Balance :${NearBalanceUser}
Status : Claiming...
`,
        });

        let transactionHash = null;
        while (transactionHash == null) {
          try {
            const account = await getAccount(accountId, privateKey);
            const callContract = await account.functionCall({
              contractId: "game.hot.tg",
              methodName: "claim",
              args: {},
            });

            transactionHash = callContract.transaction.hash;

            twisters.put(accountId, {
              text: `
      Account ID : ${accountId}
      Near Balance :${NearBalanceUser}
      Status : Claimed ${callContract.transaction.hash}...
      `,
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
            twisters.put(accountId, {
              active: false,
              removed: true,
              text: `
      Account ID : ${accountId}
      Near Balance :${NearBalanceUser}
      Status : Claimed ${callContract.transaction.hash}...
      `,
            });
          } catch (contractError) {
            twisters.put(accountId, {
              text: `
      Account ID : ${accountId}
      Near Balance :${NearBalanceUser}
      Status : ${contractError}...
      `,
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
        twisters.put(accountId, {
          text: `
  Account ID : ${accountId}
  Near Balance :${NearBalanceUser}
  Status : Mining for ${delayInHours} Hours 5 Minutes...
  `,
        });
        await new Promise((resolve) =>
          setTimeout(resolve, delayInHours * 3600 * 1000 + 5 * 60 * 1000)
        );
      };

      await mineAndUpdate();
    } catch (error) {
      twisters.put(accountId, {
        text: `
Account ID : ${accountId}
Status : ${error.message} - ${error.cause ?? ""}...
`,
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

(async () => {
  const allPromise = [];
  const promises = acc.map(async (account) => {
    const [accountId, privateKey, delayInHours] = account.split("|");

    processAccount(accountId, privateKey, delayInHours);
  });

  for (const processAccount of promises) {
    allPromise.push(await processAccount);
  }
})();

