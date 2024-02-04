export type ISODateString = string;

export interface DataPoint {
  type?: string;
  timestamp?: Date;
  group?: number;
  name?: string;
  max?: number;
  value?: number;
  min?: number;
}

export type GenericAPIResponse<T, U = any> = {
  included?: U[];
  data: {
    data: T;
    links: { next?: string };
    included: [];
  };
};

export type Identifier = {
  type: string;
  id: string;
  attributes: {
    type: string;
    identifier: string;
    lastSeen: ISODateString;
    private: boolean;
    metadata?: null;
  };
};
