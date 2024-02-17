import { BanList } from "./components/banlist.js";
import { Bans } from "./components/bans.js";
import { Flags } from "./components/flags.js";
import Helpers from "./components/helpers.js";
import { Notes } from "./components/notes.js";
import Player from "./components/players.js";
import { Session } from "./components/session.js";
import { GameInfo } from "./components/gameInfo.js";
import { Organization } from "./components/organization.js";
import { Server } from "./components/server.js";

export default class BattleMetrics {
  private baseURL: string;
  private apiKey: string | undefined;
  private headers: { Authorization: string };
  private responseData: null;
  private helpers: Helpers;
  public player: Player;
  public flags: Flags;
  public notes: Notes;
  public server: Server;
  public session: Session;
  public banList: BanList;
  public bans: Bans;
  public organization: Organization;
  public gameInfo: GameInfo;

  public constructor(token: string | undefined) {
    if (typeof token !== "string") {
      throw new Error("You need to provide a Token");
    }

    this.baseURL = "https://api.battlemetrics.com";
    this.apiKey = token;
    this.headers = { Authorization: `Bearer ${this.apiKey}` };
    this.responseData = null;
    this.helpers = new Helpers(this.headers, this.baseURL);
    this.player = new Player(this.helpers);
    this.flags = new Flags(this.helpers, token);
    this.server = new Server(this.helpers);
    this.notes = new Notes(this.helpers);
    this.session = new Session(this.helpers);
    this.banList = new BanList(this.helpers);
    this.bans = new Bans(this.helpers);
    this.organization = new Organization(this.helpers);
    this.gameInfo = new GameInfo(this.helpers);
  }

  async checkApiScopes(token?: string): Promise<object> {
    if (!token) {
      token = this.apiKey;
    }

    return await this.helpers.makeRequest({
      method: "POST",
      path: "",
      data: JSON.stringify({ token }),
    });
  }

  async pagination(pageLink: string): Promise<object> {
    return await this.helpers.makeRequest({
      method: "GET",
      path: pageLink,
    });
  }

  async metrics(
    name: string = "games.rust.players",
    startDate?: string,
    endDate?: string,
    resolution: string = "60"
  ): Promise<object> {
    if (!startDate) {
      const now = new Date();
      startDate = new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(); // 1 day ago
    }

    if (!endDate) {
      endDate = new Date().toISOString();
    }

    const data = {
      "metrics[0][name]": name,
      "metrics[0][range]": `${startDate}:${endDate}`,
      "metrics[0][resolution]": resolution,
      "fields[dataPoint]": "name,group,timestamp,value",
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/metrics",
      params: new URLSearchParams(data),
    });
  }

  async activityLogs(
    filterBmid?: number,
    filterSearch?: string,
    filterServers?: number,
    blacklist?: string,
    whitelist?: string
  ): Promise<object> {
    const data: { [key: string]: string | number } = {
      "page[size]": "100",
      include: "organization,server,user,player",
    };

    if (blacklist) {
      data["filter[types][blacklist]"] = blacklist;
    }

    if (whitelist) {
      data["filter[types][whitelist]"] = whitelist;
    }

    if (filterServers) {
      data["filter[servers]"] = filterServers;
    }

    if (filterSearch) {
      data["filter[search]"] = filterSearch;
    }

    if (filterBmid) {
      data["filter[players]"] = filterBmid;
    }

    return await this.helpers.makeRequest({
      method: "GET",
      path: "/activity",
      params: new URLSearchParams(data as { [key: string]: string }),
    });
  }
}
