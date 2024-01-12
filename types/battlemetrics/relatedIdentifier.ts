import { dateString } from "./battlemetricsTypes.js";
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
    lastSeen: dateString;
    private: boolean;
    metadata: {
      country: string;
      lastCheck: dateString;
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
