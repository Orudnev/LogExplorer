export enum LogRowResult {
  undefined = 0,
  highlighted = 1,
  errWrongOrder = 2
}

export interface ILogRow {
  RowNumber: number;
  RowLineNumber: number;
  Severety: string;
  Date: Date | undefined;
  ThreadId: number | undefined;
  Comment: string;
  SelectedMark?: number;
  Result?: LogRowResult;
  ResultMessage?:string;
}

export interface IApiResponse{
  response:any;
  error:any;
}

export interface IFilterSet{
  name:string;
  description:string;
  filterRows:string[];
}

export interface IFilterSetFolder{
  name:string;
  description:string;
  filterSetList:IFilterSet[];
}