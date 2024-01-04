export interface DataPoint {
  timestamp: Date;
  group: number;
  name: string;
  max: number;
  value: number;
  min: number;
}
