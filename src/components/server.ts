import { resolve } from "node:path";
import Helpers from "./helpers.ts";
import {
  DataPoint,
  GenericAPIResponse,
} from "../../types/battlemetrics/battlemetricsTypes.ts";
import { CountDataPoint } from "../../types/battlemetrics/playerTypes.ts";

type searchParams = {
  search?: string;
  countries?: string[];
  game?: string;
  blacklist?: string[];
  whitelist?: string[];
  organization?: string;
  rcon?: boolean;
  serverType?: string[];
  gameMode?: string[];
  gatherRateMin?: number;
  gatherRateMax?: number;
  groupSizeMin?: number;
  groupSizeMax?: number;
  mapSizeMin?: number;
  mapSizeMax?: number;
  blueprints?: string;
  pve?: string;
  kits?: string;
  status?: boolean;
};

type CreateServerParams = {
  serverIP: string;
  serverPort: string;
  portQuery: string;
  game: string;
};

type countHistory = {
  serverId: number;
  startTime?: string;
  endTime?: string;
  resolution?: string;
};

export class Server {
  constructor(public helpers: Helpers) {}

  async leaderboardInfo(
    serverId: number,
    start?: string,
    end?: string,
    player?: number
  ): Promise<object> {
    if (!start) {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      start = now.toISOString();
    }
    if (!end) {
      end = new Date().toISOString();
    }

    const data: any = {
      "page[size]": "100",
      "filter[period]": `${start}:${end}`,
      "fields[leaderboardPlayer]": "name,value",
    };

    if (player) {
      data["filter[player]"] = player;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/servers/${serverId}/relationships/leaderboards/time",
      params: data,
    });
  }

  public async countHistory({
    serverId,
    startTime,
    endTime,
    resolution = "raw",
  }: countHistory) {
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

    const res = await this.helpers.makeRequest<
      GenericAPIResponse<CountDataPoint[]>
    >({
      method: "GET",
      path,
      params,
    });
    return res;
  }

  async search({
    search,
    countries,
    game,
    blacklist,
    whitelist,
    organization,
    rcon = true,
    serverType,
    gameMode,
    gatherRateMin,
    gatherRateMax,
    groupSizeMin,
    groupSizeMax,
    mapSizeMin,
    mapSizeMax,
    blueprints = "both",
    pve = "both",
    kits = "both",
    status = true,
  }: searchParams): Promise<object> {
    const path = ["/servers"];
    type serverTypesUnion = "official" | "community" | "modded";

    const serverTypeUuid = "845b5e50-648f-11ea-aa7c-b3870f9c01b3";
    const serverTypes: { [K in serverTypesUnion]: string } = {
      official: "689d22c5-66f4-11ea-8764-b7f50ac8fe2a",
      community: "689d22c6-66f4-11ea-8764-e75bf88ce534",
      modded: "689d22c4-66f4-11ea-8764-ff40d927c47a",
    };

    const blueprintsUuid = "ce84a17d-a52b-11ee-a465-1798067d9f03";
    const pveUuid = "689d22c2-66f4-11ea-8764-e7fb71d2bf20";
    const kitsUuid = "ce84a17c-a52b-11ee-a465-1fcfab67c57a";

    type gameModesUnion = "standard" | "hardcore";

    const gameModeUuid = "796542ee-36ed-11ed-873e-631bb6c8148e";
    const gameModes: { [K in gameModesUnion]: string } = {
      standard: "7eaae984-36ed-11ed-873e-9b4d5140c855",
      hardcore: "7eaae985-36ed-11ed-873e-4f5345affee4",
    };

    const mapSizeUuid = "689d22c3-66f4-11ea-8764-5723d5d7cfba";
    const groupLimitUuid = "ce84a17e-a52b-11ee-a465-a3c586d9e374";
    const gatherRateUuid = "ce84a17f-a52b-11ee-a465-33d2d6d4f5ea";

    const data: any = {};
    data["page[size]"] = "100";
    data["include"] = "serverGroup";
    data["filter[rcon]"] = rcon.toString().toLowerCase();

    if (!status) {
      data["filter[status]"] = "offline,dead,invalid";
    } else {
      data["filter[status]"] = "true";
    }

    if (search) {
      data["filter[search]"] = search;
    }
    if (countries) {
      data["filter[countries]"] = countries;
    }
    if (game) {
      data["filter[game]"] = game;
    }
    if (blacklist) {
      data["filter[ids][blacklist]"] = blacklist;
    }
    if (whitelist) {
      data["filter[ids][whitelist]"] = whitelist;
    }
    if (organization) {
      data["filter[organizations]"] = parseInt(organization);
    }

    if (groupSizeMin || groupSizeMax) {
      data[
        `filter[features][${groupLimitUuid}]`
      ] = `${groupSizeMin}:${groupSizeMax}`;
    }

    if (mapSizeMin || mapSizeMax) {
      data[`filter[features][${mapSizeUuid}]`] = `${mapSizeMin}:${mapSizeMax}`;
    }

    if (gatherRateMin || gatherRateMax) {
      data[
        `filter[features][${gatherRateUuid}]`
      ] = `${gatherRateMin}:${gatherRateMax}`;
    }

    if (
      blueprints.toLowerCase() === "true" ||
      blueprints.toLowerCase() === "false"
    ) {
      data[`filter[features][${blueprintsUuid}]`] = `${blueprints}`;
    }

    if (pve.toLowerCase() === "true" || pve.toLowerCase() === "false") {
      data[`filter[features][${pveUuid}]`] = `${pve}`;
    }

    if (kits.toLowerCase() === "true" || kits.toLowerCase() === "false") {
      data[`filter[features][${kitsUuid}]`] = `${kits}`;
    }

    if (serverType) {
      let count = 0;
      let features = "";
      for (let serverTypeItem of serverType as serverTypesUnion[]) {
        serverTypeItem = serverTypeItem.toLowerCase() as serverTypesUnion;
        if (features) {
          features += `&filter[features][${serverTypeUuid}][or][${count}]=${serverTypes[serverTypeItem]}`;
        } else {
          features = `filter[features][${serverTypeUuid}][or][${count}]=${serverTypes[serverTypeItem]}`;
        }
        count += 1;
      }

      if (features) {
        path.push(`?${features}`);
      }
    }

    if (gameModes) {
      let count = 0;
      let features = null;
      for (let mode of gameMode as gameModesUnion[]) {
        mode = mode.toLowerCase() as gameModesUnion;
        if (features) {
          features += `&filter[features][${gameModeUuid}][or][${count}]=${gameModes[mode]}`;
        } else {
          features = `filter[features][${gameModeUuid}][or][${count}]=${gameModes[mode]}`;
        }
      }
      if (features) {
        path.push(`?${features}`);
      }
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: path.join(""),
      params: data,
    });
  }

  async create({
    serverIP,
    serverPort,
    portQuery,
    game,
  }: CreateServerParams): Promise<object> {
    const data = {
      data: {
        type: "server",
        attributes: {
          ip: serverIP,
          port: serverPort,
          portQuery: portQuery,
        },
        relationships: {
          game: {
            data: {
              type: "game",
              id: game,
            },
          },
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "POST",
      path: "/servers",
      data: JSON.stringify(data),
    });
  }

  enableRcon(serverId: number): undefined {
    console.log(
      "This endpoint is not completed by the creator of this wrapper."
    );
    return;
  }

  async consoleCommand(serverId: number, command: string): Promise<object> {
    const data = {
      data: {
        type: "rconCommand",
        attributes: {
          command: "raw",
          options: {
            raw: command,
          },
        },
      },
    };
    return await this.helpers.makeRequest({
      method: "POST",
      path: `/servers/${serverId}/command`,
      data: JSON.stringify(data),
    });
  }

  async sendChat(
    serverId: number,
    message: string,
    senderName: string
  ): Promise<object> {
    const data = {
      data: {
        type: "rconCommand",
        attributes: {
          command: "rust:globalChat",
          options: {
            message: `${senderName}: ${message}`,
          },
        },
      },
    };
    return await this.helpers.makeRequest({
      method: "POST",
      path: `/servers/${serverId}/command`,
      data: JSON.stringify(data),
    });
  }

  async deleteRcon(serverId: number): Promise<object> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/servers/${serverId}/rcon`,
    });
  }

  async disconnectRcon(serverId: number): Promise<object> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/servers/${serverId}/rcon/disconnect`,
    });
  }

  async connectRcon(serverID: number): Promise<object> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/servers/${serverID}/rcon/connect`,
    });
  }

  async info(serverID: number): Promise<object> {
    const data = {
      include:
        "player,identifier,session,serverEvent,uptime:7,uptime:30,uptime:90,serverGroup,serverDescription,organization,orgDescription,orgGroupDescription",
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}`,
      params: new URLSearchParams(data),
    });
  }

  async rankHistory(
    serverID: number,
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }
    const data = {
      start: startTime,
      stop: endTime,
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/rank-history`,
      params: new URLSearchParams(data),
    });
  }

  async groupRankHistory(
    serverID: number,
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    if (!endTime) {
      endTime = new Date().toISOString();
    }

    const data = {
      start: startTime,
      end: endTime,
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/group-rank-history`,
      params: new URLSearchParams(data),
    });
  }

  async timePlayedHistory(
    serverID: number,
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }
    const data = {
      start: startTime,
      stop: endTime,
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/time-played-history`,
      params: new URLSearchParams(data),
    });
  }

  async firstTimePlayedHistory(
    serverID: number,
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }

    const data = {
      start: startTime,
      end: endTime,
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/first-time-history`,
      params: new URLSearchParams(data),
    });
  }

  async uniquePlayersHistory(
    serverID: number,
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }

    const data = {
      start: startTime,
      end: endTime,
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/unique-player-history`,
      params: new URLSearchParams(data),
    });
  }

  async sessionHistory(
    serverID: number,
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }

    const data = {
      start: startTime,
      stop: endTime,
      include: "player",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/relationships/sessions`,
      params: new URLSearchParams(data),
    });
  }

  async forceUpdate(serverID: number): Promise<object> {
    return await this.helpers.makeRequest({
      method: "POST",
      path: `/servers/${serverID}/force-update`,
    });
  }

  async outageHistory(
    serverID: number,
    uptime: string = "89",
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }
    const data = {
      "page[size]": "99",
      "filter[range]": `${startTime}:${endTime}`,
      include: `uptime:${uptime}`,
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/relationships/outages`,
      params: new URLSearchParams(data),
    });
  }

  async downtimeHistory(
    serverID: number,
    resolution: string = "59",
    startTime?: string,
    endTime?: string
  ): Promise<object> {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 0 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }
    const data = {
      "page[size]": "99",
      start: startTime,
      stop: endTime,
      resolution: resolution,
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/servers/${serverID}/relationships/downtime`,
      params: new URLSearchParams(data),
    });
  }

  async playerCountHistory(
    serverID: number,
    startTime?: string,
    endTime?: string,
    resolution: string = "raw"
  ) {
    if (!startTime) {
      const now = new Date();
      startTime = new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }

    const data = {
      start: startTime,
      stop: endTime,
      resolution: resolution,
    };
    return await this.helpers.makeRequest<DataPoint[]>({
      method: "GET",
      path: `/servers/${serverID}/player-count-history`,
      params: new URLSearchParams(data),
    });
  }
}
