import Helpers from "./helpers.js";

type UpdateArgs = {
  banId: string;
  reason: string | null;
  note: string | null;
  append: boolean;
};

interface SearchParams {
  search?: string;
  playerId?: number;
  banlist?: string;
  expired?: boolean;
  exempt?: boolean;
  server?: number;
  organizationId?: number;
  userIds?: string;
}

export class Bans {
  constructor(private helpers: Helpers) {}

  // TODO: find proper type
  async delete(banId: string): Promise<any> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/bans/${banId}`,
    });
  }

  // TODO: find proper type
  async info(banId: string): Promise<any> {
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/bans/${banId}`,
    });
  }

  // TODO: find proper type
  async update({
    banId,
    reason = null,
    note = null,
    append = false,
  }: UpdateArgs): Promise<any> {
    const ban = await this.info(banId);

    if (reason) {
      ban.data.attributes.reason = reason;
    }

    if (note) {
      if (append) {
        ban.data.attributes.note += `\n${note}`;
      } else {
        ban.data.attributes.note = note;
      }
    }

    return await this.helpers.makeRequest({
      method: "PATCH",
      path: `/bans/${banId}`,
      data: JSON.stringify(ban),
    });
  }

  // TODO: find proper type
  async search({
    search,
    playerId,
    banlist,
    expired = true,
    exempt = false,
    server,
    organizationId,
    userIds,
  }: SearchParams): Promise<any> {
    const data: { [key: string]: string } = {
      include: "server,user,player,organization",
      "filter[expired]": String(expired),
      "filter[exempt]": String(exempt),
      sort: "-timestamp",
      "page[size]": "100",
    };

    if (organizationId) {
      data["filter[organization]"] = String(organizationId);
    }

    if (playerId) {
      data["filter[player]"] = String(playerId);
    }

    if (server) {
      data["filter[server]"] = String(server);
    }

    if (search) {
      data["filter[search]"] = search;
    }

    if (banlist) {
      data["filter[banList]"] = banlist;
    }

    if (userIds) {
      data["filter[users]"] = userIds;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/bans",
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async nativeBanInfo(server?: number, ban?: string): Promise<any> {
    const data: { [key: string]: string } = {
      "page[size]": "100",
      include: "server,ban",
      sort: "-createdAt",
      "fields[ban]": "reason",
      "fields[server]": "name",
      "fields[banNative]": "createdAt,reason",
    };

    if (ban) {
      data["filter[ban]"] = ban;
    }

    if (server) {
      data["filter[server]"] = String(server);
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/bans-native",
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async nativeForceUpdate(nativeId: string): Promise<any> {
    return await this.helpers.makeRequest({
      method: "POST",
      path: `/bans-native/${nativeId}/force-update`,
    });
  }
}
