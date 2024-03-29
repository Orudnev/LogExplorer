export interface IFilterPanelRowValue {
  searchCriteria:string;
  mustSkip:boolean;
}

export interface IFilterPanel {
  fltRows: IFilterPanelRowValue[];
  dataRows: ILogRow[];
  onChange: (frows: IFilterPanelRowValue[], isFilterOn: boolean, showSelItemsOnly:boolean, grpFilter: number) => void;
}


export interface IFilterPanelRow {
  rows: IFilterPanelRowValue[];
  index: number;
  onChangedValue: (index: number, newValue: IFilterPanelRowValue) => void;
  onDeleteRowBtnClick: (index: number) => void;
  onAddRowBtnClick: () => void;
  onMoveRowUp:(index:number) => void;
  onMoveRowDown:(index:number) => void;
}


export enum LogRowResult {
  undefined = 0,
  highlighted = 1,
  backgr1 = 2,
  backgr2 = 4,
  isNewFltGroupStart = 8, //Строка содержит в себе значение указанное в первой строке набора фильтров
  errMissingRowsInFltGroup = 16,
  errWrongOrder = 32,
  groupIsCorrect = 64,
  groupIsWrong = 128,
  selectedByUser = 256
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
  filterRows:IFilterPanelRowValue[];
}

export interface IFilterSetFolder{
  name:string;
  description:string;
  filterSetList:IFilterSet[];
}