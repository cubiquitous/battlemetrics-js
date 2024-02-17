export type ISODateString = string;

export type GeneralType<U> = {
  type: U;
  id?: string;
};

export interface DataPoint {
  type?: string;
  timestamp?: string;
  group?: number;
  name?: string;
  max?: number;
  value?: number;
  min?: number;
}

export type GenericAPIResponse<T, U = any> = {
  included?: U[];
  data: T;
  links: { next?: string };
};

export type Identifier<T> = GeneralType<"identifier"> & {
  attributes: {
    identifier: string;
    lastSeen: ISODateString;
    private: boolean;
    metadata?: T;
  };
};
