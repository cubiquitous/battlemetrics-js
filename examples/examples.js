import BattleMetrics from "../src/main.js";
import { configDotenv } from "dotenv";

configDotenv();

const { TOKEN, USER_ID__USERID, STEAM_ID__STEAMID, SERVER_ID } = process.env;

const playerId = Number(USER_ID__USERID);
const serverId = Number(SERVER_ID);
const steamId = Number(STEAM_ID__STEAMID);

const bm = new BattleMetrics(TOKEN);

async function main() {
  try {
    const search = await bm.player.search({ filterOnline: false });
    console.log(search);
    //
    const info = await bm.player.info(playerId);
    console.log(info);
    //
    const playHistory = await bm.player.playHistory({ playerId, serverId });
    console.log(playHistory);
    //
    const serverInfo = await bm.player.serverInfo(playerId, serverId);
    console.log(serverInfo);
    //
    console.log(matchIdentifiers);
    //
    const sessionHistory = await bm.player.sessionHistory(playerId);
    console.log(sessionHistory);
    //
    const addFlag = await bm.player.addFlag(playerId);
    console.log(addFlag);
    //
    const flags = await bm.player.flags(playerId);
    console.log(flags);
    //
  } catch (err) {
    console.log(err);
  }
}

main();
