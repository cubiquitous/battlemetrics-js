import Helpers from "./helpers.ts";

type createInviteParams = {
  organizationId: number;
  banlistId: string;
  permManage: boolean;
  permCreate: boolean;
  permUpdate: boolean;
  permDelete: boolean;
  uses: number;
  limit: number;
};

type createParams = {
  organizationId: number;
  action: string;
  autoadd: boolean;
  banIdentifiers: string[];
  nativeBan: boolean;
  listDefaultReasons: string[];
  banListName: string;
};

type acceptInviteParams = {
  code: string;
  action: string;
  autoadd: boolean;
  banIdentifiers: string[];
  nativeBan: boolean;
  listDefaultReasons: string[];
  organizationId: string;
  organizationOwnerId: string;
};

type updateParams = {
  banListId: string;
  organizationId: string;
  action?: string;
  autoadd?: boolean;
  banIdentifiers?: string[];
  nativeBan?: boolean;
  listDefaultReasons?: string[];
  banListName?: string;
};

export class BanList {
  constructor(private helpers: Helpers) {}

  // TODO: find proper type
  async createInvite({
    organizationId,
    banlistId,
    permManage,
    permCreate,
    permUpdate,
    permDelete,
    uses = 1,
    limit = 1,
  }: createInviteParams): Promise<object> {
    const data = {
      data: {
        type: "banListInvite",
        attributes: {
          uses: uses,
          limit: limit,
          permManage: String(permManage).toLowerCase(),
          permCreate: String(permCreate).toLowerCase(),
          permUpdate: String(permUpdate).toLowerCase(),
          permDelete: String(permDelete).toLowerCase(),
        },
        relationships: {
          organization: {
            data: {
              type: "organization",
              id: `${organizationId}`,
            },
          },
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "POST",
      path: `/ban-lists/${banlistId}/relationships/invites`,
      data: JSON.stringify(data),
    });
  }

  // TODO: find proper type
  async readInvitation(inviteId: string): Promise<object> {
    const data = {
      include: "banList",
      "fields[organization]": "tz,banTemplate",
      "fields[user]": "nickname",
      "fields[banList]": "name, action",
      "fields[banListInvite]": "uses",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/ban-list-invites/${inviteId}`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async inviteList(banlistId: string): Promise<object> {
    const data = {
      include: "banList",
      "fields[organization]": "tz,banTemplate",
      "fields[user]": "nickname",
      "fields[banList]": "name,action",
      "fields[banListInvite]": "uses",
      "page[size]": "100",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/ban-lists/${banlistId}/relationships/invites`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async deleteInvite(banlistId: string, banlistInviteId: string) {
    return await this.helpers.makeRequest<object>({
      method: "DELETE",
      path: `/ban-lists/${banlistId}/relationships/invites/${banlistInviteId}`,
    });
  }

  // TODO: find proper type
  async exemptionCreate(
    banId: string,
    organizationId: number,
    reason: string | null = null
  ): Promise<object> {
    const data = {
      data: {
        type: "banExemption",
        attributes: {
          reason: reason,
        },
        relationships: {
          organization: {
            data: {
              type: "organization",
              id: `${organizationId}`,
            },
          },
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "POST",
      path: `/bans/${banId}/relationships/exemptions`,
      data: JSON.stringify(data),
    });
  }

  // TODO: find proper type
  async exemptionDelete(banId: string): Promise<object> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/bans/${banId}/relationships/exemptions`,
    });
  }

  // TODO: find proper type
  async exemptionInfoSingle(
    banId: string,
    exemptionId: string
  ): Promise<object> {
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/bans/${banId}/relationships/exemptions/${exemptionId}`,
    });
  }

  // TODO: find proper type
  async exemptionInfoAll(banId: string): Promise<object> {
    const data = {
      "fields[banExemption]": "reason",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/bans/${banId}/relationships/exemptions`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async exemptionUpdate(
    banId: string,
    exemptionId: string,
    reason: string
  ): Promise<object> {
    type exemption = { data?: { attributes?: { reason?: string } } };
    const banExemption: exemption = await this.exemptionInfoSingle(
      banId,
      exemptionId
    );

    if (banExemption.data && banExemption.data.attributes) {
      banExemption.data.attributes.reason = reason;
    }

    return await this.helpers.makeRequest({
      method: "PATCH",
      path: `/bans/${banId}/relationships/exemptions`,
      data: JSON.stringify(banExemption),
    });
  }

  async create({
    organizationId,
    action,
    autoadd,
    banIdentifiers,
    nativeBan,
    listDefaultReasons,
    banListName,
  }: createParams): Promise<object> {
    const data = {
      data: {
        type: "banList",
        attributes: {
          name: banListName,
          action: action,
          defaultIdentifiers: banIdentifiers,
          defaultReasons: listDefaultReasons,
          defaultAutoAddEnabled: `${autoadd}`.toLowerCase(),
          defaultNativeEnabled: `${nativeBan}`.toLowerCase(),
          nativeBanTTL: null,
          nativeBanTempMaxExpires: null,
          nativeBanPermMaxExpires: null,
        },
        relationships: {
          organization: {
            data: {
              type: "organization",
              id: `${organizationId}`,
            },
          },
          owner: {
            data: {
              type: "organization",
              id: `${organizationId}`,
            },
          },
        },
      },
    };
    return await this.helpers.makeRequest({
      method: "POST",
      path: `/ban-lists`,
      data: JSON.stringify(data),
    });
  }

  async acceptInvite({
    code,
    action,
    autoadd,
    banIdentifiers,
    nativeBan,
    listDefaultReasons,
    organizationId,
    organizationOwnerId,
  }: acceptInviteParams): Promise<object> {
    const data = {
      data: {
        type: "banList",
        attributes: {
          code: code,
          action: action,
          defaultIdentifiers: banIdentifiers,
          defaultReasons: listDefaultReasons,
          defaultAutoAddEnabled: `${autoadd}`.toLowerCase(),
          defaultNativeEnabled: `${nativeBan}`.toLowerCase(),
          nativeBanTTL: null,
          nativeBanTempMaxExpires: null,
          nativeBanPermMaxExpires: null,
        },
        relationships: {
          organization: {
            data: {
              type: "organization",
              id: organizationId,
            },
          },
          owner: {
            data: {
              type: "organization",
              id: organizationOwnerId,
            },
          },
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "POST",
      path: "/ban-lists/accept-invite",
      data: JSON.stringify(data),
    });
  }

  async unsubscribe(
    banListId: string,
    organizationId: string
  ): Promise<object> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/ban-lists/${banListId}/relationships/organizations/${organizationId}`,
    });
  }

  async list() {
    const data = {
      include: "server,organization,owner",
      "page[size]": "100",
    };
    return await this.helpers.makeRequest<ListReturn>({
      method: "GET",
      path: "/ban-lists",
      params: new URLSearchParams(data),
    });
  }

  async subscribedOrgs(banListId: string): Promise<object> {
    const data = {
      include: "server,organization,owner",
      "page[size]": "100",
    };
    return await this.helpers.makeRequest({
      method: "GET",
      path: "/ban-lists/${banListId}/relationships/organizations",
      params: new URLSearchParams(data),
    });
  }

  async subscribers(
    banListId: string,
    organizationId: string
  ): Promise<object> {
    const data = {
      include: "organization, owner, server",
    };
    return await this.helpers.makeRequest<object>({
      method: "GET",
      path: `/ban-lists/${banListId}/relationships/organizations/${organizationId}`,
      params: new URLSearchParams(data),
    });
  }

  async read(banListId: string): Promise<object> {
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/ban-lists/${banListId}`,
      params: new URLSearchParams({ include: "owner" }),
    });
  }

  async update({
    banListId,
    organizationId,
    action,
    autoadd,
    banIdentifiers,
    nativeBan,
    listDefaultReasons,
    banListName,
  }: updateParams): Promise<object | undefined> {
    type banListResult = {
      attributes: {
        action?: string;
        defaultAutoAddEnabled: string;
        defaultIdentifiers: string[];
        defaultNativeEnabled: string;
        defaultReasons: string[];
        name: string;
      };
    };

    const banList = await this.getList(banListId);
    if (!banList) {
      return;
    }
    if (banList?.attributes) {
      banList.attributes.action = action;
    }
    if (autoadd !== undefined) {
      banList.attributes.defaultAutoAddEnabled = autoadd;
    }
    if (banIdentifiers) {
      banList.attributes.defaultIdentifiers = banIdentifiers;
    }
    if (nativeBan !== undefined) {
      banList.attributes.defaultNativeEnabled = nativeBan;
    }
    if (listDefaultReasons) {
      banList.attributes.defaultReasons = listDefaultReasons;
    }
    if (banListName) {
      banList.attributes.name = banListName;
    }
    return await this.helpers.makeRequest({
      method: "PATCH",
      path: `/ban-lists/${banListId}/relationships/organizations/${organizationId}`,
      data: JSON.stringify(banList),
    });
  }

  async getList(banListId?: string) {
    const data = {
      "page[size]": "100",
      include: "organization,owner,server",
    };
    const banList = await this.helpers.makeRequest<Banlist | Ban>({
      method: "GET",
      path: "/ban-lists",
      params: new URLSearchParams(data),
    });

    if (banList) {
      return (banList as Banlist).data.find(
        (banList) => banList.id === banListId
      );
    }
    return banList as Ban;
  }
}
