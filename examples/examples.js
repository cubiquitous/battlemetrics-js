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

    // since bm is an object you can also destructure a sub-class from it
    // and it will still work
    const { player } = bm;
    const playHistory = await player.playHistory({ playerId, serverId });
    console.log(playHistory);
    //
    const serverInfo = await player.serverInfo(playerId, serverId);
    console.log(serverInfo);
    //
    const sessionHistory = await player.sessionHistory(playerId);
    console.log(sessionHistory);
    //
    const addFlag = await player.addFlag(playerId);
    console.log(addFlag);
    //
    const flags = await player.flags(playerId);
    console.log(flags);
    //
  } catch (err) {
    console.log(err);
  }
}

main();
