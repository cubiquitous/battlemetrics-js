import { DataPoint } from "./battlemetrics.js";

export type CountDataPoint = Partial<DataPoint> &
  Pick<DataPoint, "timestamp" | "group">;
