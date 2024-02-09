import React, { useEffect, useState, useRef } from 'react';
import { DataGrid, GridRowsProp, GridColDef, GridCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import * as Api from '../WebApiWrapper';
import { MultiSelect, Option } from './MultiSelect';
import { ToolbarButton, ToolbarCheckButton } from './ToolbarButton';
import { ILogRow, LogRowResult } from '../CommonTypes';
import { AppGlobal } from '../App';
import { AppSessionData } from './AppData';
import { FilterPanel } from './FilterPanel';




export function MainPage() {
    let dfltRows: ILogRow[] = [];
    const [allRowList, setAllRowList] = useState(dfltRows);
    const [rowList, setRowList] = useState(dfltRows);
    const [currRow, setCurrRow] = useState<ILogRow>({ RowNumber: -1, RowLineNumber: -1, Severety: "", Date: undefined, ThreadId: undefined, Comment: "" });
    const [dateFrom, setDateFrom] = React.useState<Dayjs | null>(dayjs(new Date(AppSessionData.prop('TsFromFilter'))));
    const [dateTo, setDateTo] = React.useState<Dayjs | null>(dayjs(new Date(AppSessionData.prop('TsToFilter'))));
    const [isLoading, setIsLoading] = useState(false);
    const [severityFltValue, setSeverityFltValue] = useState(AppSessionData.prop('SeverityFilter'));
    const [error, setError] = useState("");

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
                            <FilterPanel rows={[""]}
                                onChange={(frows, isFilterOn) => {
                                    let newRows = ApplyFilter(allRowList, frows, isFilterOn);
                                    if (newRows.length > 0) {
                                        setRowList(newRows);
                                    }
                                }}
                            />
                        )
                    }
                </div>
            </div>
            <div className='datagrid-and-details'>
                <div className='datagrid-container'>
                    <DataGrid rowHeight={25}
                        rows={rowList}
                        columns={columns}
                        getCellClassName={(params: GridCellParams<any, any, number>) => {
                            let trow = params.row as ILogRow;
                            if (params.field === 'Comment' && (trow.Result && (trow.Result & LogRowResult.highlighted) > 0)) {
                                return "datagrid-row_highlight"
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

function ApplyFilter(allRows: ILogRow[], filterList: string[], isFilterOn: boolean): ILogRow[] {
    if (filterList.length === 1 && !filterList[0]) {
        return allRows;
    }
    let lastMatchedFilterRowIndex = -1;
    let checkRowOrder = (row: ILogRow, fltIndex: number) => {
        if (filterList.length === 0) {
            return;
        }
        let expectedIndex = lastMatchedFilterRowIndex + 1;
        if (expectedIndex > filterList.length - 1) {
            expectedIndex = 0;
        }
        if (expectedIndex != fltIndex) {
            row.Result = LogRowResult.highlighted | LogRowResult.errWrongOrder;
            row.ResultMessage = `Ожидаемое значение: ${filterList[expectedIndex]}`
        }
    }

    let result: ILogRow[] = [];
    allRows.forEach((row, ind) => {
        let fltIndex = filterList.findIndex(flt => row.Comment.toLowerCase().includes(flt.toLowerCase()));
        if (fltIndex === -1 && isFilterOn) {
            return;
        }
        let newRow = { ...row };
        if (fltIndex === -1 && !isFilterOn) {
            result.push(newRow);
            return;
        }
        newRow.Result = LogRowResult.highlighted;;
        checkRowOrder(row, fltIndex);
        result.push(newRow);
        lastMatchedFilterRowIndex = fltIndex;
    });

    return result;
}