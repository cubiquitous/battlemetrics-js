import { DataPoint, GeneralType, Identifier } from "./battlemetricsTypes.js";

export type CountDataPoint = Partial<DataPoint> &
  Pick<DataPoint, "timestamp" | "group">;

export type Player = GeneralType<"player">;
export type Server = GeneralType<"server">;
export type Organization = GeneralType<"organization">;
export type User = GeneralType<"user">;
export type BanList = GeneralType<"banList">;
export type PlayerFlag = GeneralType<"playerFlag">;
export type Ban = GeneralType<"ban"> & {
  attributes: {
    id: string;
    uid: string;
    timestamp: string;
    reason: string;
    note: string;
    identifiers: [];
    expires: null;
    autoAddEnabled: boolean;
    nativeEnabled: null;
    orgWide: boolean;
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

export type FlagPlayer = GeneralType<"flagPlayer"> & {
  attributes: {
    addedAt: string;
    removedAt: string | null;
  };
  relationships: {
    user: {
      data: User;
    };
    playerFlag: {
      data: PlayerFlag;
    };
    player: {
      data: Player;
    };
    organization: {
      data: Organization;
    };
  };
};

export type PlayerNote = GeneralType<"playerNote"> & {
  attributes: {
    note: string;
    shared: boolean;
    createdAt: string;
  };
  relationships: {
    player: {
      data: Player;
    };
    organization: {
      data: Organization;
    };
    user: {
      data: User;
    };
  };
};

export type CoplayRelation = GeneralType<"coplayRelation"> & {
  attributes: {
    name: string;
    duration: number;
  };
};

export type PlayerIdentifier = GeneralType<"identifier"> & {
  attributes: {
    type: string;
    identifier: string;
    lastSeen: string;
    private: boolean;
    metadata: {
      profile: {
        steamid: string;
        communityvisibilitystate: number;
        profilestate: number;
        personaname: string;
        commentpermission: number;
        profileurl: string;
        avatar: string;
        avatarmedium: string;
        avatarfull: string;
        avatarhash: string;
        personastate: number;
        realname: string;
        primaryclanid: string;
        timecreated: number;
        personastateflags: number;
        gameserverip: string;
        gameserversteamid: string;
        gameextrainfo: string;
        gameid: string;
        api: boolean;
        xml: boolean;
        isLimitedAccount: boolean;
      };
      bans: {
        SteamId: string;
        CommunityBanned: boolean;
        VACBanned: boolean;
        NumberOfVACBans: number;
        DaysSinceLastBan: number;
        NumberOfGameBans: number;
        EconomyBan: string;
      };
      gameInfo: {
        steamid: string;
        lastCheck: string;
      };
    };
  };
  relationships: {
    player: {
      data: Player;
    };
    organizations: {
      data: Organization[];
    };
  };
};

export type PlayHistory = {
  meta: {
    start: string;
    stop: string;
  };
  data: DataPoint[];
};
