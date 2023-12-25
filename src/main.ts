export default class BattleMetrics {
  private baseURL: string;
  private apiKey: string;
  private headers: { Authorization: string };
  private responseData: null;
  constructor(apiKey: string) {
    this.baseURL = "https://api.battlemetrics.com";
    this.apiKey = apiKey;
    this.headers = { Authorization: `Bearer ${this.apiKey}` };
    this.responseData = null;
  }
}

