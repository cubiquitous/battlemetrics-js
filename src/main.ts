import "dotenv/config";
export default class BattleMetrics {
  private baseURL: string;
  private apiKey: string | undefined;
  private headers: { Authorization: string };
  private responseData: null;

  public constructor(apiKey: string | undefined) {
    if (typeof apiKey !== "string") {
      throw new Error("You need to provide a Token in the `.env` file");
    }

    this.baseURL = "https://api.battlemetrics.com";
    this.apiKey = apiKey;
    this.headers = { Authorization: `Bearer ${this.apiKey}` };
    this.responseData = null;
  }
}

const bm = new BattleMetrics(process.env.TOKEN);
