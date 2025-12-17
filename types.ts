export type TableRow = string[];
export type TableData = TableRow[];

export interface ExtractionResult {
  tableData: TableData;
}

export enum AppState {
  IDLE = 'IDLE',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
