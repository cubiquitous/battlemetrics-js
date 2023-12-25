import Helpers from "./helpers.js";

type countHistory = {
  serverId: number;
  startTime?: string;
  endTime?: string;
  resolution: string;
};

interface Iplayer {
  countHistory: ({
    serverId,
    startTime,
    endTime,
    resolution,
  }: countHistory) => Promise<any>;
}

export default class Player implements Iplayer {
  public constructor(private helpers: Helpers, private baseUrl: string) {}

  async countHistory({
    serverId,
    startTime,
    endTime,
    resolution,
  }: countHistory) {
    /** Player Count History
        Documentation: https://www.battlemetrics.com/developers/documentation#link-GET-server-/servers/{(%23%2Fdefinitions%2Fserver%2Fdefinitions%2Fidentity)}/player-count-history
        Returns an Object which is A datapoint of the player count history.
        */

    if (!startTime) {
      startTime = new Date(
        new Date().getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString();
    }
    if (!endTime) {
      endTime = new Date().toISOString();
    }

    let path = `/servers/${serverId}/player-count-history`;
    let data = {
      start: startTime,
      end: endTime,
      resolution,
    };

    return await this.helpers.makeRequest({
      method: "GET",
      path,
      data: JSON.stringify(data),
    });
  }
}
