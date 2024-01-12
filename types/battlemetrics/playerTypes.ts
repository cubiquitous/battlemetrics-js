import { DataPoint } from "./battlemetricsTypes.js";

export type CountDataPoint = Partial<DataPoint> &
  Pick<DataPoint, "timestamp" | "group">;

export type Player = {
  type: string;
  id: string;
  attributes: {
    id: string;
    name: string;
    private: boolean;
    positiveMatch: boolean;
    createdAt: string;
    updatedAt: string;
  };
  relationships: {};
  included: [];
};
