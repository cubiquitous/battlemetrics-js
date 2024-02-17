import Helpers from "./helpers.js";

interface InfoParams {
  filterServer?: number;
  filterGame?: string;
  filterOrganizations?: number;
  filterPlayer?: number;
  filterIdentifiers?: number;
}

export class Session {
  constructor(private helpers: Helpers) {}

  // TODO: find proper type
  async info({
    filterServer,
    filterGame,
    filterOrganizations,
    filterPlayer,
    filterIdentifiers,
  }: InfoParams): Promise<object> {
    const data: { [key: string]: string | number } = {
      include: "identifier,server,player",
      "page[size]": "100",
    };

    if (filterServer) {
      data["filter[servers]"] = filterServer;
    }

    if (filterGame) {
      data["filter[game]"] = filterGame;
    }

    if (filterOrganizations) {
      data["filter[organizations]"] = filterOrganizations;
    }

    if (filterPlayer) {
      data["filter[players]"] = filterPlayer;
    }

    if (filterIdentifiers) {
      data["filter[identifiers]"] = filterIdentifiers;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/sessions",
      params: new URLSearchParams(data as { [key: string]: string }),
    });
  }

  // TODO: find proper type
  async coplay(sessionId: string): Promise<object> {
    const data: { [key: string]: string } = {
      include: "identifier,server,player",
      "page[size]": "99",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/sessions/${sessionId}/relationships/coplay`,
      params: new URLSearchParams(data),
    });
  }
}
