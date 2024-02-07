import { Flags } from "./components/flags.ts";
import Helpers from "./components/helpers.js";
import Player from "./components/players.js";

export default class BattleMetrics {
  private baseURL: string;
  private apiKey: string | undefined;
  private headers: { Authorization: string };
  private responseData: null;
  private helpers: Helpers;
  public player: Player;
  public flags: Flags;

  public constructor(token: string | undefined) {
    if (typeof token !== "string") {
      throw new Error("You need to provide a Token");
    }

    this.baseURL = "https://api.battlemetrics.com";
    this.apiKey = token;
    this.headers = { Authorization: `Bearer ${this.apiKey}` };
    this.responseData = null;
    this.helpers = new Helpers(this.headers, this.baseURL);
    this.player = new Player(this.helpers, this.baseURL);
    this.flags = new Flags(this.helpers, token);
  }
}

// console.dir(myObject, { depth: null });
