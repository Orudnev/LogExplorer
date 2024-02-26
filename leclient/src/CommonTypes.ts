export enum LogRowResult {
  undefined = 0,
  highlighted = 1,
  backgr1 = 2,
  backgr2 = 4,
  isNewFltGroupStart = 8, //Строка содержит в себе значение указанное в первой строке набора фильтров
  errMissingRowsInFltGroup = 16,
  errWrongOrder = 32,
  groupIsCorrect = 64,
  groupIsWrong = 128
}

export interface ILogRow {
  id: number;
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