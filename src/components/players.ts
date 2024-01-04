import { CountDataPoint } from "../../types/battlemetrics/player.js";
import Helpers from "./helpers.js";

type countHistory = {
  serverId: number;
  startTime?: string;
  endTime?: string;
  resolution?: string;
};

interface Iplayer {
  countHistory: ({
    serverId,
    startTime,
    endTime,
    resolution,
  }: countHistory) => Promise<any>;
}

export default class Player implements Iplayer {
  public constructor(private helpers: Helpers, private baseUrl: string) {}

  async countHistory({
    serverId,
    startTime,
    endTime,
    resolution = "raw",
  }: countHistory): Promise<CountDataPoint[]> {
    /** Player Count History
        Documentation: https://www.battlemetrics.com/developers/documentation#link-GET-server-/servers/{(%23%2Fdefinitions%2Fserver%2Fdefinitions%2Fidentity)}/player-count-history
        Returns an Array filled with Datapoints of the player count history.
    */

    if (!startTime) {
      startTime = new Date(
        new Date().getTime() - 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds;
      ).toISOString();
    }

    if (!endTime) {
      endTime = new Date().toISOString();
    }

    const path = `/servers/${serverId}/player-count-history`;

    const params = new URLSearchParams({
      start: startTime,
      stop: endTime,
      resolution,
    });

    const res = await this.helpers.makeRequest<{ data: [CountDataPoint] }>({
      method: "GET",
      path,
      params,
    });

    return res.data.map((i) => {
      console.log(i);
      return i;
    });
  }

  async identifiers(playerID: number): Promise<any> {
    /** Get player identifiers and related players and identifiers.
        Documentation: https://www.battlemetrics.com/developers/documentation#link-GET-relatedIdentifier-/players/{(%23%2Fdefinitions%2Fplayer%2Fdefinitions%2Fidentity)}/relationships/related-identifiers
        Args:
            playerID (number): The player battlemetrics Identifier.
        Returns:
            dict: Players related identifiers.
      */

    const path = `/players/${playerID}/relationships/related-identifiers`;
    const data = JSON.stringify({
      include: "player,identifier",
      "page[size]": "100",
    });

    return await this.helpers.makeRequest({ method: "GET", path, data });
  }
}
