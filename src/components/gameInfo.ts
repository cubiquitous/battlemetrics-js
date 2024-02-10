import Helpers from "./helpers.ts";

export class GameInfo {
  constructor(private helpers: Helpers) {}

  // TODO: find proper type
  async features(game: string): Promise<object> {
    const data: { "page[size]": string; "filter[game]"?: string } = {
      "page[size]": "100",
    };

    if (game) {
      data["filter[game]"] = game;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/game-features",
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async featureOptions(
    featureId: string,
    sort: string = "players"
  ): Promise<object> {
    const data: { "page[size]": string; sort?: string } = {
      "page[size]": "100",
      sort,
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/game-features/${featureId}/relationships/options`,
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async list(game?: string): Promise<object> {
    const data: { "page[size]": string; "fields[game]"?: string } = {
      "page[size]": "100",
    };

    if (game) {
      data["fields[game]"] = game;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/games",
      params: new URLSearchParams(data),
    });
  }

  // TODO: find proper type
  async info(gameId: string, game?: string): Promise<object> {
    const data: { "page[size]": string; "fields[game]"?: string } = {
      "page[size]": "100",
    };

    if (game) {
      data["fields[game]"] = game;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: `/games/${gameId}`,
      params: new URLSearchParams(data),
    });
  }
}
