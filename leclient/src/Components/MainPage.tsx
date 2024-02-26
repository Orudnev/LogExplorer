import React, { useEffect, useState, useRef } from 'react';
import { DataGrid, GridRowsProp, GridColDef, GridCellParams, useGridApiRef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import * as Api from '../WebApiWrapper';
import { MultiSelect, Option } from './MultiSelect';
import { ToolbarButton, ToolbarCheckButton } from './ToolbarButton';
import { ILogRow, LogRowResult } from '../CommonTypes';
import { AppGlobal } from '../App';
import { AppSessionData } from './AppData';
import { FilterPanel } from './FilterPanel';
import { FilterPanelTotals } from './FilterPanelTotals';




export function MainPage() {
    let dfltRows: ILogRow[] = [];
    let dfltCurrRow: ILogRow = { id: -1, RowLineNumber: -1, Severety: "", Date: undefined, ThreadId: undefined, Comment: "" };
    const [allRowList, setAllRowList] = useState(dfltRows);
    const [rowList, setRowList] = useState(dfltRows);
    const [currRow, setCurrRow] = useState<ILogRow>(dfltCurrRow);
    const [dateFrom, setDateFrom] = React.useState<Dayjs | null>(dayjs(new Date(AppSessionData.prop('TsFromFilter'))));
    const [dateTo, setDateTo] = React.useState<Dayjs | null>(dayjs(new Date(AppSessionData.prop('TsToFilter'))));
    const [isLoading, setIsLoading] = useState(false);
    const [severityFltValue, setSeverityFltValue] = useState(AppSessionData.prop('SeverityFilter'));
    const [error, setError] = useState("");
    const datagrid = useGridApiRef();
    if (isLoading) {
        return (<div>'Loading...'</div>);
    }
    const columns: GridColDef[] = [
        { field: 'id', headerName: '#', width: 70 },
        { field: 'Date', headerName: 'Date', width: 195 },
        { field: 'Severity', headerName: 'Type', width: 80 },
        { field: 'ThreadId', headerName: 'Thread', width: 70 },
        { field: 'Img', headerName: 'Err', width: 50 },
        { field: 'Comment', headerName: 'Comment', width: 4000 }
    ];
    return (
        <div className='main-page'>
            <div className='main-page-toolbar'>
                <div className='main-page-toolbar__firstline'>
                    <DatePicker label="Дата начала:" value={dateFrom} onChange={(newValue) => {
                        setDateFrom(newValue);
                        AppSessionData.prop('TsFromFilter', newValue?.valueOf())
                        if (newValue && dateTo && newValue?.toDate() >= dateTo?.toDate()) {
                            setDateTo(newValue);
                            AppSessionData.prop('TsToFilter', newValue.valueOf())
                        }
                    }} />
                    <DatePicker label="Дата окончания:" value={dateFrom} onChange={(newValue) => {
                        setDateTo(newValue);
                        AppSessionData.prop('TsToFilter', newValue?.valueOf())
                    }} />
                    <MultiSelect defaultValue={["Info"]} value={severityFltValue} className="severity-mselect" onChange={(evt, value) => {
                        setSeverityFltValue(value);
                        AppSessionData.prop('SeverityFilter', value);
                    }}>
                        <Option value={"Debug"}>Debug</Option>
                        <Option value={"Info"}>Info</Option>
                        <Option value={"Error"}>Error</Option>
                    </MultiSelect>
                    <ToolbarButton image='gear' toolTip='Настройки' onClick={() => { AppGlobal.navigate('/Settings'); }} size='56' />
                    <ToolbarButton image='apply' toolTip='Загрузить лог файлы' onClick={() => {
                        setIsLoading(true);
                        let tsFrom = dateFrom?.valueOf();
                        let tsTo = dateFrom?.valueOf();
                        let svr = severityFltValue.reduce((accum: string, curItm: string) => accum + curItm, "");
                        if (tsFrom && tsTo) {
                            Api.GetLogRows(AppSessionData.prop('LogFilesFolder'), tsFrom, tsTo, svr, (resp: any) => {
                                if (resp.response) {
                                    setAllRowList(resp.response);
                                    setRowList([...resp.response]);
                                    setError("");
                                } else {
                                    setError(resp.error);
                                }
                                setIsLoading(false);
                            });
                        }
                    }} size='56' />
                </div>
                <div className='main-page-toolbar__secondline'>
                    {error ?
                        (
                            <div className='main-page-toolbar__error'>{error}</div>)
                        : (
                            <div className='filter-panel-wrapper'>
                                <FilterPanel fltRows={[""]} dataRows={rowList}
                                    onChange={(frows, isFilterOn, grpFilter) => {
                                        let newRows = ApplyFilter(allRowList, frows, isFilterOn, grpFilter);
                                        let cr = currRow;
                                        let dg = datagrid;
                                        if (newRows.length > 0) {
                                            setRowList(newRows);
                                            if (!isFilterOn && currRow && currRow.id > -1) {
                                                dg.current.selectRow(currRow.id, true);
                                                let pgSize = 100;
                                                let pageNum = Math.trunc(currRow.id / 100);
                                                let positionOnPage = currRow.id % pgSize;
                                                dg.current.setPageSize(pgSize);
                                                setTimeout(() => { 
                                                    dg.current.setPage(pageNum);                                                    
                                                    dg.current.scrollToIndexes({rowIndex:currRow.id});
                                                }, 100);
                                            }
                                        }
                                    }}
                                />
                                {/* <FilterPanelTotals grpFilterValue={groupFilter} rows={rowList} onGroupFilterChanged={(flt)=>{
                                    setGroupFilter(flt);
                                    let newRows = ApplyGroupFilter(rowList,flt);
                                    if (newRows.length > 0) {
                                        setRowList(newRows);
                                    }
                                }} /> */}
                            </div>
                        )
                    }
                </div>
            </div>
            <div className='datagrid-and-details'>
                <div className='datagrid-container'>
                    <DataGrid apiRef={datagrid}
                        rowHeight={25}
                        rows={rowList}
                        columns={columns}
                        getCellClassName={(params: GridCellParams<any, any, number>) => {
                            let trow = params.row as ILogRow;
                            if (params.field === 'Comment' && (trow.Result && (trow.Result & LogRowResult.highlighted) > 0)) {
                                let bckgr = "";
                                if ((trow.Result & LogRowResult.backgr1) > 0) {
                                    bckgr = "datagrid-row_highligt-stripe1";
                                }
                                if ((trow.Result & LogRowResult.backgr2) > 0) {
                                    bckgr = "datagrid-row_highligt-stripe2";
                                }
                                return `datagrid-row_highlight ${bckgr}`;
                            }
                            if (params.field === 'Img' && trow.ResultMessage) {
                                return "img-error bckgrSize24";
                            }
                            return "";
                        }}
                        onCellClick={(params, event, details) => {
                            let s = 1;
                        }}
                        onRowClick={(par, ev) => {
                            setCurrRow(par.row);
                        }} />
                </div>
                <div className='datagrid-details'>
                    <div className='dg-details-comment'>
                        <div className="title">Comment</div>
                        <div className="body">{currRow.Comment}</div>
                        <div className='infolabel'>Номер строки в лог файле:<div className='infotext'>{currRow.RowLineNumber}</div></div>
                    </div>
                    {currRow.ResultMessage
                        ? (
                            <div className='dg-details-error'>
                                <div className="title">Error</div>
                                <div className="body">{currRow.ResultMessage}</div>
                            </div>
                        )
                        : (
                            <></>
                        )
                    }
                </div>
            </div>
        </div>
    );
}



function ApplyFilter(allRows: ILogRow[], filterList: string[], isFilterOn: boolean, grpFilter: number): ILogRow[] {
    if (filterList.length === 1 && !filterList[0]) {
        return allRows;
    }
    let lastMatchedFilterRowIndex = -1;
    let lastGroupItemIndexList: number[] = []; //список индексов строк последней группы
    let isBackgr1 = true; //переключатель BackgroundColor для выделения групп полосками
    let result: ILogRow[] = [];
    let checkRowOrder = (row: ILogRow, fltIndex: number) => {
        if (filterList.length === 0) {
            return;
        }
        let expectedIndex = lastMatchedFilterRowIndex + 1;
        if (expectedIndex > filterList.length - 1) {
            //группа фильтров завершена, сбрасываем индекс в 0
            expectedIndex = 0;
        }
        if (expectedIndex != fltIndex) {
            if (fltIndex !== 0) {
                row.Result = LogRowResult.highlighted | LogRowResult.errWrongOrder;
                row.ResultMessage = `Ожидаемое значение: ${filterList[expectedIndex]}`
            } else {
                //несовпавшее значение соответствует началу очередной группы набора фильтров
                row.Result = LogRowResult.highlighted | LogRowResult.isNewFltGroupStart; //отмечаем начало очередной группы для текущей строки
                //проверяем прошлую группу на некомплектность
                if (lastGroupItemIndexList.length > 0 && lastGroupItemIndexList.length < filterList.length) {
                    let prevGrStartRow = result[lastGroupItemIndexList[0]];
                    let r = prevGrStartRow.Result;
                    prevGrStartRow.Result = r ? r | LogRowResult.errMissingRowsInFltGroup : LogRowResult.errMissingRowsInFltGroup;
                    prevGrStartRow.ResultMessage = "Группа неполная, отсутствуют некоторые элементы";
                    let s = 1;
                }
            }
        } else {
            //совпавшее значение фильтра соответствует ожидаемому
            if (expectedIndex == 0) {
                //совпавшее значение соответствует началу очередной группы набора фильтров
                row.Result = LogRowResult.highlighted | LogRowResult.isNewFltGroupStart;
            }
        }
    }
    let setGroupStatus = () => {
        let grMembers = lastGroupItemIndexList.map(itm => result[itm]);
        let hasErrors = grMembers.some(itm =>
            itm.Result && (
                (itm.Result & LogRowResult.errWrongOrder) > 0
                || (itm.Result & LogRowResult.errMissingRowsInFltGroup) > 0
            ));
        let grStatus = hasErrors ? LogRowResult.groupIsWrong : LogRowResult.groupIsCorrect;
        grMembers.forEach(itm => {
            let v = itm.Result ? itm.Result | grStatus : grStatus;
            itm.Result = v;
        });
    };
    allRows.forEach((row, ind) => {
        let fltIndex = filterList.findIndex(flt => row.Comment.toLowerCase().includes(flt.toLowerCase()));
        if (fltIndex === -1 && isFilterOn) {
            // - строка не содержит в себе ни одного значения из набора фильтров
            // - фильтрация записей включена
            // Решение : строка не будет включена в результирующий список
            return;
        }
        let newRow = { ...row };
        if (fltIndex === -1 && !isFilterOn) {
            // - строка не содержит в себе ни одного значения из набора фильтров
            // - фильтрация записей отключена
            // Решение : добавляем несовпавшую строку в результирующий список
            result.push(newRow);
            return;
        }
        // строка содержит в себе значение filterList[fltIndex] 
        newRow.Result = LogRowResult.highlighted; // Выделяем строку (highlighted) 
        checkRowOrder(newRow, fltIndex);
        result.push(newRow);
        if ((newRow.Result & LogRowResult.isNewFltGroupStart) > 0) {
            setGroupStatus();
            lastGroupItemIndexList = [];
        }
        lastGroupItemIndexList.push(result.length - 1);
        lastMatchedFilterRowIndex = fltIndex;
    });
    if (grpFilter !== 0) {
        result = result.filter(itm => {
            return itm.Result && (itm.Result & grpFilter) > 0;
        });
    }

    result.forEach((itm, idx) => {
        //раскрашиваем группы полосками
        if (itm.Result && ((itm.Result & LogRowResult.groupIsCorrect) > 0 || ((itm.Result & LogRowResult.groupIsWrong) > 0))) {
            if (itm.Result & LogRowResult.isNewFltGroupStart) {
                isBackgr1 = !isBackgr1;
            }
            let backGr = isBackgr1 ? LogRowResult.backgr1 : LogRowResult.backgr2;
            let v = itm.Result | backGr;
            itm.Result = v;
        }
    });
    return result;
}
