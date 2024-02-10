import Helpers from "./helpers.ts";
import { randomUUID } from "node:crypto";

type StatsParams = {
  organizationId: number;
  start?: string;
  end?: string;
  game?: string;
};

type FriendsListParams = {
  organizationId: string;
  filterAccepted?: boolean;
  filterOrigin?: boolean;
  filterName?: string;
  filterReciprocated?: boolean;
};

type FriendUpdateParams = {
  organizationId: number;
  friendOrganizationId: number;
  identifiers: string[];
  playerflag: string;
  shared_notes?: boolean;
  accepted?: boolean;
};

type friendCreateParams = {
  organizationId: number;
  friendlyOrg: number;
  identifiers: string[];
  sharedNotes: boolean;
};

type commandsActivityParams = {
  organizationId: number;
  summary: boolean;
  users?: string;
  commands?: string;
  timeStart?: string;
  timeEnd?: string;
  servers?: number;
};

export class Organization {
  constructor(private helpers: Helpers) {}

  // TODO: find proper type
  async info(organizationId: number): Promise<object> {
    const data: { include: string } = {
      include: "organizationUser,banList,role,organizationStats",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/organizations/${organizationId}`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async stats({
    organizationId,
    start,
    end,
    game,
  }: StatsParams): Promise<object> {
    if (!start) {
      const now = new Date();
      start = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (!end) {
      end = new Date().toISOString();
    }

    const data: { filter: string } = {
      filter: `range=${start}:${end}`,
    };

    if (game) {
      data.filter += `&game=${game}`;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/organizations/${organizationId}/stats/players`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async friendsList({
    organizationId,
    filterAccepted = true,
    filterOrigin = true,
    filterName,
    filterReciprocated: filter_reciprocated = true,
  }: FriendsListParams): Promise<object> {
    const data: { include: string; filter: string } = {
      include: "organization",
      filter: `accepted=${filterAccepted}&origin=${filterOrigin}&reciprocated=${filter_reciprocated}`,
    };

    if (filterName) {
      data.filter += `&name=${filterName}`;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/organizations/${organizationId}/relationships/friends`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async friend(
    organizationId: number,
    friendOrganizationId: number
  ): Promise<object> {
    const data = {
      include: "organization,playerFlag,organizationStats",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/organizations/${organizationId}/relationships/friends/${friendOrganizationId}`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async friendUpdate({
    organizationId,
    friendOrganizationId,
    identifiers,
    playerflag,
    shared_notes = true,
    accepted = true,
  }: FriendUpdateParams): Promise<object> {
    type Data = {
      data: {
        id: number;
        type: string;
        attributes: {
          accepted: string;
          identifiers: string[];
          notes: string;
        };
      };
    };
    const data: Data = {
      data: {
        id: friendOrganizationId,
        type: "organizationFriend",
        attributes: {
          accepted: String(accepted).toLowerCase(),
          identifiers: identifiers,
          notes: String(shared_notes).toLowerCase(),
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "PATCH",
      path: `/organizations/${organizationId}/relationships/friends/${friendOrganizationId}`,
      data: JSON.stringify(data),
    });
  }

  // TODO: find proper type
  async friendCreate({
    organizationId,
    friendlyOrg,
    identifiers,
    sharedNotes = true,
  }: friendCreateParams): Promise<object> {
    const data = {
      data: {
        type: "organizationFriend",
        attributes: {
          identifiers: identifiers,
          notes: String(sharedNotes),
        },
        relationships: {
          friend: {
            data: {
              type: "organization",
              id: friendlyOrg.toString(),
            },
          },
          flagsShared: {
            data: [
              {
                type: "playerFlag",
                id: randomUUID().toString(),
              },
            ],
          },
        },
      },
    };

    // Use camelCase for method names and variable names
    return await this.helpers.makeRequest({
      method: "POST",
      path: `https://api.battlemetrics.com/organizations/${organizationId}/relationships/friends`,
      data: JSON.stringify(data),
    });
  }

  // TODO: find proper type
  async friendDelete(
    organizationId: number,
    friendsId: number
  ): Promise<object> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/organizations/${organizationId}/relationships/friends/${friendsId}`,
    });
  }

  // TODO: find proper type
  async playerStats(
    organizationId: number,
    startDate?: string,
    endDate?: string
  ): Promise<object> {
    if (!startDate) {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      startDate = yesterday.toISOString();
    }

    if (!endDate) {
      endDate = new Date().toISOString();
    }

    const data = {
      "filter[game]": "rust",
      "filter[range]": `${startDate}:${endDate}`,
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/organizations/${organizationId}/stats/players`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async commandsActivity({
    organizationId,
    summary = false,
    users,
    commands,
    timeStart,
    timeEnd,
    servers,
  }: commandsActivityParams): Promise<object> {
    if (!timeStart) {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      timeStart = yesterday.toISOString();
    }

    if (!timeEnd) {
      timeEnd = new Date().toISOString();
    }

    const data: { [key: string]: string } = {
      "filter[timestamp]": `${timeStart}:${timeEnd}`,
    };

    if (summary) {
      data["filter[summary]"] = String(summary);
    }

    if (users) {
      data["filter[users]"] = users;
    }

    if (commands) {
      data["filter[commands]"] = commands;
    }

    if (servers) {
      data["filter[servers]"] = String(servers);
    }

    // Use camelCase for method names and variable names
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/organizations/${organizationId}/relationships/command-stats`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async userOrganizationView(): Promise<object> {
    const data = {
      "page[size]": "100",
      include: "organizationUser,banList,organizationStats",
    };

    // Use camelCase for method names and variable names
    return await this.helpers.makeRequest({
      method: "GET",
      path: "/organizations",
      params: new URLSearchParams(data),
    });
  }
}
