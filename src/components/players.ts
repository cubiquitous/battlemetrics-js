import {
  GenericAPIResponse,
  DataPoint,
  Identifier,
} from "../../types/battlemetrics/battlemetricsTypes.ts";
import { CountDataPoint } from "../../types/battlemetrics/playerTypes.ts";
import { RelatedIdentifier } from "../../types/battlemetrics/relatedIdentifier.ts";
import Helpers from "./helpers.ts";
import { URLSearchParams } from "url";
import { randomUUID } from "node:crypto";

type countHistory = {
  serverId: number;
  startTime?: string;
  endTime?: string;
  resolution?: string;
};

type SearchOptions = {
  search?: string;
  filterGame?: string;
  filterOnline?: boolean;
  filterServers?: number;
  filterOrganization?: number;
  filterPublic?: boolean;
  flag?: string;
};

type PlayHistoryParams = {
  playerId: number;
  serverId: number;
  startTime?: string;
  endTime?: string;
};

type playHistoryresponse = {
  meta: {
    start: string;
    stop: string;
  };
  data: DataPoint[];
};

interface AddBanArgs {
  reason: string;
  note: string;
  orgId: string;
  banlist: string;
  serverId: string;
  expires?: string;
  orgwide?: boolean;
  battlemetricsId?: number;
  steamId?: number;
}

export default class Player {
  public constructor(private helpers: Helpers) {}

  public async countHistory(countHistoryobj: countHistory) {
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

    const res = await this.helpers.makeRequest<
      GenericAPIResponse<CountDataPoint[]>
    >({
      method: "GET",
      path,
      params,
    });
    return res;
  }

  public async identifiers(playerID: number) {
    /** Get player identifiers and related players and identifiers.
        Documentation: https://www.battlemetrics.com/developers/documentation#link-GET-relatedIdentifier-/players/{(%23%2Fdefinitions%2Fplayer%2Fdefinitions%2Fidentity)}/relationships/related-identifiers
        Args:
            playerID (number): The player battlemetrics Identifier.
        Returns:
            dict: Players related identifiers.
      */

    const path = `/players/${playerID}/relationships/related-identifiers`;
    const params = new URLSearchParams({
      include: "player,identifier",
      "page[size]": "100",
    });
    return await this.helpers.makeRequest<
      GenericAPIResponse<RelatedIdentifier[]>
    >({
      method: "GET",
      path,
      params,
    });
    return res;
  }

  public async search(options: SearchOptions = {}) {
    const {
      search,
      filterServers,
      filterOrganization,
      filterPublic,
      flag,
      filterOnline,
      filterGame,
    } = options;

    const data: any = {
      "page[size]": "100",
      include: "server,identifier,playerFlag,flagPlayer",
    };

    if (search) data["filter[search]"] = search;
    if (filterServers) data["filter[server]"] = filterServers;
    if (filterOrganization) data["filter[organization]"] = filterOrganization;
    if (flag) data["filter[playerFlags]"] = flag;

    data["filter[online]"] = filterOnline ? "true" : "false";
    data["filter[public]"] = filterPublic ? "true" : "false";

    if (filterGame) {
      // Assuming you need to set game on server object (based on the original code)
      // This part may need adjustment depending on the actual structure of the request.
      data.server = {
        game: filterGame,
      };
    }

    return await this.helpers.makeRequest<
      GenericAPIResponse<RelatedIdentifier[]>
    >({
      method: "GET",
      path: "/players",
      params: new URLSearchParams(data),
    });
  }

  public async info<U>(identifier: number) {
    const path: string = `/players/${identifier}`;
    const params = new URLSearchParams({
      include: "identifier,server,playerCounter,playerFlag,flagPlayer",
    });

    const res = await this.helpers.makeRequest<GenericAPIResponse<Player, U>>({
      method: "GET",
      path,
      params,
    });
    return res;
  }

  public async playHistory(historyParams: PlayHistoryParams) {
    let { playerId, serverId, startTime, endTime } = historyParams;

    const now: Date = new Date();
    if (!startTime) {
      const startDate: Date = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      startTime = startDate.toISOString();
    }

    if (!endTime) {
      const endDate: Date = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
      endTime = endDate.toISOString();
    }

    const path = `/players/${playerId}/time-played-history/${serverId}`;
    const params = new URLSearchParams({
      start: startTime,
      stop: endTime,
    });

    return await this.helpers.makeRequest<playHistoryresponse>({
      method: "GET",
      path,
      params,
    });
  }

  public async serverInfo(playerId: number, serverId: number): Promise<any> {
    // Change 'any' to a more specific type if you know the structure of the response
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/players/${playerId}/servers/${serverId}`,
      params: new URLSearchParams(""),
    });
  }

  public async matchIdentifiers(
    identifier: string,
    identifierType?: string
  ): Promise<any> {
    // TODO: define type after create html parser
    const path = `/players/match?include=player,server,identifier,playerFlag,flagPlayer`;
    const data = JSON.stringify({
      data: [
        {
          type: "identifier",
          attributes: {
            type: identifierType,
            identifier: identifier,
          },
        },
      ],
    });

    return await this.helpers.makeRequest({ method: "POST", path, data });
  }

  public async sessionHistory(
    playerId: number,
    filterServer?: string,
    filterOrganization?: string
  ): Promise<GenericAPIResponse<Player>> {
    const path = `/players/${playerId}/relationships/sessions`;
    const data: any = {
      include: "identifier,server",
      "page[size]": "100",
    };

    if (filterServer) {
      data["filter[servers]"] = filterServer;
    }
    if (filterOrganization) {
      data["filter[organizations]"] = filterOrganization;
    }
    const params = new URLSearchParams(data);

    return await this.helpers.makeRequest({
      method: "GET",
      path,
      params,
    });
  }

  // TODO: find proper type
  public async addFlag(playerId: number, flagId?: string): Promise<any> {
    const path = `/players/${playerId}/relationships/flags`;
    const data: { data: { type: string; id?: string }[] } = {
      data: [
        {
          type: "payerFlag",
        },
      ],
    };

    if (flagId) {
      data.data[0].id = flagId;
    }

    return await this.helpers.makeRequest({
      method: "POST",
      path,
      data: JSON.stringify(data),
    });
  }

  // TODO: find proper type
  public async flags(playerId: number): Promise<GenericAPIResponse<any>> {
    const params = new URLSearchParams({
      "page[size]": "100",
      include: "playerFlag",
    });

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/players/${playerId}/relationships/flags`,
      params,
    });
  }

  // TODO: find proper type
  public async deleteFlag(
    playerId: number,
    flagId: string
  ): Promise<GenericAPIResponse<any>> {
    const path: string = `/players/${playerId}/relationships/flags/${flagId}`;
    return await this.helpers.makeRequest({
      method: "DELETE",
      path,
      data: "",
    });
  }

  // TODO: find proper type
  public async coplayInfo(
    playerId: number,
    timeStart?: string,
    timeEnd?: string,
    playerNames?: string,
    organizationNames?: string,
    serverNames?: string
  ): Promise<GenericAPIResponse<any>> {
    if (!timeStart) {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      timeStart = now.toISOString();
    }
    if (!timeEnd) {
      timeEnd = new Date().toISOString();
    }

    const data: any = {
      "filter[period]": `${timeStart}:${timeEnd}`,
      "page[size]": "100",
      "fields[coplayrelation]": "name,duration",
    };

    if (playerNames) {
      data["filter[players]"] = playerNames;
    }
    if (organizationNames) {
      data["filter[organizations]"] = organizationNames;
    }
    if (serverNames) {
      data["filter[servers]"] = serverNames;
    }

    const path: string = `/players/${playerId}/relationships/coplay`;
    return await this.helpers.makeRequest({
      method: "GET",
      path,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  public async quickMatch(
    identifier: string,
    identifierType: string
  ): Promise<GenericAPIResponse<any>> {
    const path: string = "/players/quick-match";
    const data = JSON.stringify({
      data: [
        {
          type: "identifier",
          attributes: {
            type: identifierType,
            identifier: identifier,
          },
        },
      ],
    });

    return await this.helpers.makeRequest({ method: "POST", path, data });
  }

  // TODO: find proper type
  public async addNote(
    note: string,
    organizationId: number,
    playerId: number,
    shared: boolean = true
  ): Promise<GenericAPIResponse<any>> {
    const path = `/players/${playerId}/relationships/notes`;

    const data = JSON.stringify({
      data: {
        type: "playerNote",
        attributes: {
          note: note,
          shared: shared,
        },
        relationships: {
          organization: {
            data: {
              type: "organization",
              id: organizationId.toString(),
            },
          },
        },
      },
    });
    return await this.helpers.makeRequest({ method: "POST", path, data });
  }

  // TODO: find proper type
  // WARNING: untested
  public async addBan({
    reason,
    note,
    orgId,
    banlist,
    serverId,
    expires,
    orgwide = true,
    battlemetricsId,
    steamId,
  }: AddBanArgs): Promise<any> {
    if (expires) {
      expires = this.helpers.calculateFutureDate(expires);
    }

    const data = {
      data: {
        type: "ban",
        attributes: {
          uid: randomUUID().slice(0, 14),
          reason,
          note,
          expires,
          identifiers: [],
          orgWide: orgwide,
          autoAddEnabled: true,
          nativeEnabled: null,
        },
        relationships: {
          organization: {
            data: {
              type: "organization",
              id: `${orgId}`,
            },
          },
          server: {
            data: {
              type: "server",
              id: `${serverId}`,
            },
          },
          player: {
            data: {
              type: "player",
              id: `${battlemetricsId}`,
            },
          },
          banList: {
            data: {
              type: "banList",
              id: `${banlist}`,
            },
          },
        },
      },
    };

    if (!steamId && !battlemetricsId) {
      throw new Error(
        "Please submit either a STEAM IDENTIFIER or BATTLEMETRICS IDENTIFIER"
      );
    }

    let bmid: string | undefined;
    if (steamId && !battlemetricsId) {
      const battlemetricsIdentifiers = await this.matchIdentifiers(
        steamId.toString(),
        "steamID"
      );

      bmid = battlemetricsIdentifiers.data[0].relationships.player.data
        .id as string;
    }

    if (bmid) {
      const playerInfo = await this.info<Identifier>(Number(battlemetricsId));
      if (!playerInfo?.included) {
        throw new Error(`Couldn't find ${battlemetricsId}`);
      }

      for (const included of playerInfo.included) {
        if (included.type === "identifier") {
          if (
            included.attributes.type === "BEGUID" ||
            included.attributes.type === "steamID"
          ) {
            const identifiers: number[] = data.data.attributes.identifiers;
            identifiers.push(parseInt(included.id));
          }
        }
      }
    }

    return await this.helpers.makeRequest({
      method: "POST",
      path: `/bans`,
      data: JSON.stringify(data),
    });
  }
}
