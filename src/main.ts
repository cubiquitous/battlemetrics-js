import { BanList } from "./components/banlist.ts";
import { Bans } from "./components/bans.ts";
import { Flags } from "./components/flags.ts";
import Helpers from "./components/helpers.js";
import { Notes } from "./components/notes.ts";
import Player from "./components/players.js";
import { Session } from "./components/session.ts";
import { GameInfo } from "./components/gameInfo.ts";
import { Organization } from "./components/organization.ts";
import { Server } from "./components/server.ts";

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
    this.player = new Player(this.helpers, this.baseURL);
    this.flags = new Flags(this.helpers, token);
    this.server = new Server(this.helpers);
    this.notes = new Notes(this.helpers);
    this.session = new Session(this.helpers);
    this.banList = new BanList(this.helpers);
    this.bans = new Bans(this.helpers);
    this.organization = new Organization(this.helpers);
    this.gameInfo = new GameInfo(this.helpers);
