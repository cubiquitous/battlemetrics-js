export type dateString = string;

export interface DataPoint {
  type?: string;
  timestamp?: Date;
  group?: number;
  name?: string;
  max?: number;
  value?: number;
  min?: number;
}

export type GenericAPIResponse<T> = {
  data: {
    data: T;
    links: { next?: string };
    included: [];
  };
};
