import { DataPoint } from "./battlemetricsTypes.js";

export type CountDataPoint = Partial<DataPoint> &
  Pick<DataPoint, "timestamp" | "group">;

type GeneralType<U> = {
  type: U;
  id: string;
};

export type Player = GeneralType<"player">;
export type Server = GeneralType<"server">;
export type Organization = GeneralType<"organization">;
export type User = GeneralType<"user">;
export type BanList = GeneralType<"banList">;

export type Ban = GeneralType<"ban"> & {
  attributes: {
    id: string;
    uid: string;
    timestamp: string;
    reason: string;
    note: string;
    identifiers: [];
    expires: null;
    autoAddEnabled: true;
    nativeEnabled: null;
    orgWide: true;
  };
  relationships: {
    server: {
      data: Server;
    };
    organization: {
      data: Organization;
    };
    player: {
      data: Player;
    };
    user: {
      data: User;
    };
    banList: {
      data: BanList;
    };
  };
};
