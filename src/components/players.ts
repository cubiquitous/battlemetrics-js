import {
  GenericAPIResponse,
  DataPoint,
  Identifier,
} from "../../types/battlemetrics/battlemetricsTypes.js";
import { RelatedIdentifier } from "../../types/battlemetrics/relatedIdentifier.js";
import Helpers from "./helpers.js";
import { URLSearchParams } from "url";
import { randomUUID } from "node:crypto";
import {
  Ban,
  CoplayRelation,
  FlagPlayer,
  PlayHistory,
  PlayerIdentifier,
  PlayerNote,
} from "../../types/battlemetrics/playerTypes.js";

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

type AddBanParams = {
  reason: string;
  note: string;
  orgId: string;
  banlist: string;
  serverId: string;
  expires?: string;
  orgwide?: boolean;
  battlemetricsId?: number;
  steamId?: number;
};

type addNoteParams = {
  note: string;
  organizationId: number;
  playerId: number;
  shared: boolean;
};

type coplayInfoParam = {
  playerId: number;
  timeStart?: string;
  timeEnd?: string;
  playerNames?: string;
  organizationNames?: string;
  serverNames?: string;
};

type sessionHistoryParams = {
  playerId: number;
  filterServer?: string;
  filterOrganization?: string;
};

export default class Player {
  public constructor(private helpers: Helpers) {}

  public async identifiers(playerID: number) {
    const path = `/players/${playerID}/relationships/related-identifiers`;
    const params = new URLSearchParams({
      include: "player,identifier",
      "page[size]": "100",
    });
    return await this.helpers.makeRequest<
      GenericAPIResponse<PlayerIdentifier[]>
    >({
      method: "GET",
      path,
      params,
    });
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

    return await this.helpers.makeRequest<RelatedIdentifier[]>({
      method: "GET",
      path: "/players",
      params: new URLSearchParams(data),
    });
  }

  public async info(identifier: number) {
    const path: string = `/players/${identifier}`;
    const params = new URLSearchParams({
      include: "identifier,server,playerCounter,playerFlag,flagPlayer",
    });

    return await this.helpers.makeRequest<GenericAPIResponse<Player>>({
      method: "GET",
      path,
      params,
    });
  }

  public async playHistory({
    playerId,
    serverId,
    startTime,
    endTime,
  }: PlayHistoryParams) {
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

    return await this.helpers.makeRequest<PlayHistory>({
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

  public async sessionHistory({
    playerId,
    filterServer,
    filterOrganization,
  }: sessionHistoryParams): Promise<GenericAPIResponse<Player>> {
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

  public async addFlag(playerId: number, flagId?: string) {
    const path = `/players/${playerId}/relationships/flags`;
    const data: { data: { type: string; id?: string }[] } = {
      data: [
        {
          type: "playerFlag",
        },
      ],
    };

    if (flagId) {
      data.data[0].id = flagId;
    }

    return await this.helpers.makeRequest<FlagPlayer>({
      method: "POST",
      path,
      data: JSON.stringify(data),
    });
  }

  public async flags(playerId: number) {
    const params = new URLSearchParams({
      "page[size]": "100",
      include: "playerFlag",
    });

    return await this.helpers.makeRequest<FlagPlayer>({
      method: "GET",
      path: `/players/${playerId}/relationships/flags`,
      params,
    });
  }

  public async deleteFlag(playerId: number, flagId: string) {
    const path: string = `/players/${playerId}/relationships/flags/${flagId}`;
    return await this.helpers.makeRequest<FlagPlayer>({
      method: "DELETE",
      path,
      data: "",
    });
  }

  public async coplayInfo({
    playerId,
    timeStart,
    timeEnd,
    playerNames,
    organizationNames,
    serverNames,
  }: coplayInfoParam) {
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
      "fields[coplayRelation]": "name,duration",
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
    return await this.helpers.makeRequest<CoplayRelation[]>({
      method: "GET",
      path,
      params: new URLSearchParams(data),
    });
  }

  public async quickMatch(identifier: string, identifierType: string) {
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

    return await this.helpers.makeRequest<PlayerIdentifier>({
      method: "POST",
      path,
      data,
    });
  }

  public async addNote({
    note,
    organizationId,
    playerId,
    shared = true,
  }: addNoteParams) {
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
    return await this.helpers.makeRequest<PlayerNote>({
      method: "POST",
      path,
      data,
    });
  }

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
  }: AddBanParams) {
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
      const playerInfo = await this.info(Number(battlemetricsId));
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

    return await this.helpers.makeRequest<Ban>({
      method: "POST",
      path: `/bans`,
      data: JSON.stringify(data),
    });
  }
}
