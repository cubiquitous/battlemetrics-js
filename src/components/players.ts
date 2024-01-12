import {
  GenericAPIResponse,
  DataPoint,
} from "../../types/battlemetrics/battlemetricsTypes.ts";
import { CountDataPoint } from "../../types/battlemetrics/playerTypes.ts";
import { RelatedIdentifier } from "../../types/battlemetrics/relatedIdentifier.ts";

type countHistory = {
  serverId: number;
  startTime?: string;
  endTime?: string;
  resolution?: string;
};

type SearchPlayerResponse = GenericAPIResponse<RelatedIdentifier[]>;
type IdentifiersResponse = GenericAPIResponse<Player>;


interface Iplayer {
  countHistory: (props: countHistory) => Promise<CountDataPoint[]>;
}

export default class Player implements Iplayer {
  public constructor(private helpers: Helpers, private baseUrl: string) {}

  public async countHistory(
    countHistoryobj: countHistory
  ): Promise<CountDataPoint[]> {
    /** Player Count History
        Documentation: https://www.battlemetrics.com/developers/documentation#link-GET-server-/servers/{(%23%2Fdefinitions%2Fserver%2Fdefinitions%2Fidentity)}/player-count-history
        Returns an Array filled with Datapoints of the player count history.
    */
    let { serverId, startTime, endTime, resolution = "raw" } = countHistoryobj;

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

    const res = await this.helpers.makeRequest<{ data: CountDataPoint[] }>({
      method: "GET",
      path,
      params,
    });

    return res.data;
  }

  public async identifiers(playerID: number): Promise<IdentifiersResponse> {
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
    const res = await this.helpers.makeRequest<IdentifiersResponse>({
      method: "GET",
      path,
      data,
    });
    return res;
  }


    return await this.helpers.makeRequest({ method: "GET", path, data });
  }
}
