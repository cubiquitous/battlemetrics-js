import { GenericAPIResponse } from "./battlemetricsTypes.js";
import { Organization } from "./organizationTypes.js";

export type Ban = {
  type: "banList";
  id: string;
  attributes: {
    name: string;
    action?: string;
    permManage: boolean;
    permCreate: boolean;
    permUpdate: boolean;
    permDelete: boolean;
    defaultIdentifiers: string[];
    defaultReasons: string[];
    defaultAutoAddEnabled: boolean;
    defaultNativeEnabled: null | boolean;
    nativeBanTTL: null;
    nativeBanTempMaxExpires: null;
    nativeBanPermMaxExpires: null;
  };
  relationships: {
    owner: {
      data: Organization;
    };
    organization: {
      data: Organization;
    };
  };
};

export type Banlist = GenericAPIResponse<Ban[]>;

type _banListInvite = {
  type: "banListInvite";
  id: string;
  attributes: {
    uses: number;
  };
  relationships: {
    organization: {
      data: Organization;
    };
    banList: {
      data: {
        type: "banList";
        id: string;
      };
    };
    user: {
      data: {
        type: "user";
        id: string;
      };
    };
  };
};

export type BanListInvite = {
  links: {};
  data: _banListInvite[];
  included: Ban[];
};

export type InviteReturn = {
  links: {};
  data: _banListInvite[];
  included: Ban[];
};

export type ListReturn = GenericAPIResponse<Ban[], Organization[]>;
