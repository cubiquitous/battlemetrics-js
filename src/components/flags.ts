import Helpers from "./helpers.js";

type CreateArgs = {
  color: string;
  description: string;
  iconName: string;
  flagName: string;
  organizationId: number;
  userId: number;
};

type UpdateArgs = {
  flagId: string;
  color: string;
  description: string;
  iconName: string;
  flagName: string;
};

export class Flags {
  constructor(private helpers: Helpers, private apiKey: string) {}

  // TODO: find proper type
  async create({
    color,
    description,
    iconName,
    flagName,
    organizationId,
    userId,
  }: CreateArgs): Promise<any> {
    const path = "/player-flags";
    const data = {
      data: {
        type: "playerFlag",
        attributes: {
          icon: `${iconName}`,
          name: `${flagName}`,
          color: `${color}`,
          description: `${description}`,
        },
        relationships: {
          organization: {
            data: {
              type: "organization",
              id: `${organizationId}`,
            },
          },
          user: {
            data: {
              type: "user",
              id: `${userId}`,
            },
          },
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "POST",
      path: path,
      data: JSON.stringify(data),
    });
  }

  // TODO: find proper type
  async delete(flagId: string): Promise<any> {
    return await this.helpers.makeRequest({
      method: "DELETE",
      path: `/player-flags/${flagId}`,
    });
  }

  // TODO: find proper type
  async info(flagId: string): Promise<any> {
    return await this.helpers.makeRequest({
      method: "GET",
      path: `/player-flags/${flagId}`,
    });
  }

  // TODO: find proper type
  async list(filterPersonal: boolean = false): Promise<any> {
    const data: { [key: string]: string } = {
      "page[size]": "100",
      include: "organization",
    };

    if (filterPersonal) {
      data["filter[personal]"] = String(filterPersonal);
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/player-flags",
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async update({
    flagId,
    color,
    description,
    iconName,
    flagName,
  }: UpdateArgs): Promise<any> {
    const data = {
      data: {
        type: "playerFlag",
        id: `${flagId}`,
        attributes: {
          icon: `${iconName}`,
          name: `${flagName}`,
          color: `${color}`,
          description: `${description}`,
        },
      },
    };

    return await this.helpers.makeRequest({
      method: "PATCH",
      path: `/player-flags/${flagId}`,
      data: JSON.stringify(data),
    });
  }
}
