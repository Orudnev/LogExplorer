export interface ILogRow {
    id: number;
    RowLineNumber?: number;
    Severity?: string;
    Date?: Date;
    ThreadId?: number;
    Comment?: string;
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