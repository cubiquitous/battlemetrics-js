import BattleMetrics from "../src/main.js";
import { configDotenv } from "dotenv";

configDotenv();
// for make gnome life easier while testing
const print = (...args: any): void => console.dir(...args, { depth: null }); // ignore this gnome

type ENV = { [key: string]: string | undefined };

const {
  TOKEN,
  ORGANIZATION_ID__ORGID,
  USER_ID__USERID,
  BATTLEMETRICS_ID__BMID,
  STEAM_ID__STEAMID,
  SERVER_ID,
}: ENV = process.env;

const playerId = Number(USER_ID__USERID);
const serverId = Number(SERVER_ID);

const bm = new BattleMetrics(TOKEN);

async function main(): Promise<void> {
  // const search = await bm.player.search({ filterOnline: false });
  // print(search);
  // const info = await bm.player.info(playerId);
  // print(info);
  // const playHistory = await bm.player.playHistory({ playerId, serverId });
  // print(playHistory);
  // const serverInfo = await bm.player.serverInfo(playerId, serverId);
  // print(serverInfo);
  // const matchIdentifiers = await bm.player.matchIdentifiers(
  //   "76561198151275725",
  //   "steamID"
  // );
  // print(matchIdentifiers);
  // const sessionHistory = await bm.player.sessionHistory(playerId);
  // print(sessionHistory);
  // const addFlag = await bm.player.addFlag(playerId);
  // print(addFlag);
  // const flags = await bm.player.flags(playerId);
  // print(flags);
}

main();
