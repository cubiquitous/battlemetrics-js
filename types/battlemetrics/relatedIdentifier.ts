import { ISODateString } from "./battlemetricsTypes.js";
import { Organization } from "./organizationTypes.js";
import { Player } from "./playerTypes.js";

export type Relationships = {
  player: { data: Player };
  organizations: { data: Organization[] };
  relatedPlayers: { data: Player[] };
  relatedIdentifiers: {
    data: RelatedIdentifier[];
  };
};

export type RelatedIdentifier = {
  type: "relatedIdentifier";
  id: string;
  attributes?: {
    type: string;
    identifier: string;
    lastSeen: ISODateString;
    private: boolean;
    metadata: {
      country: string;
      lastCheck: ISODateString;
      connectionInfo: {
        tor: boolean;
        datacenter: boolean;
        proxy: boolean;
        asn: string;
        block: number;
        isp: string;
      };
    };
  };
  relationships: Relationships;
};
