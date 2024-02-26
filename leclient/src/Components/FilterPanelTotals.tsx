import React, { useEffect, useState, useRef } from 'react';
import { ILogRow, LogRowResult } from '../CommonTypes';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { IFilterPanel } from './FilterPanel';

export interface IFilterPanelTotals {
    parentProps:IFilterPanel;
    onGroupFilterChanged?: (value: number) => void;
    showGroupFilter:boolean;
    selectedValue:number;
}

export function FilterPanelTotals(props: IFilterPanelTotals) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let v = (event.target as HTMLInputElement).value;
        let newV = Number(v);
        if (props.onGroupFilterChanged) {
            props.onGroupFilterChanged(newV);
        }
    };
    let highlightedRows = 0;
    let groupCount = 0;
    let correctGroupCount = 0;
    let wrongGroupCount = 0;
    let errWrongOrderCount = 0;
    props.parentProps.dataRows.forEach(row => {
        if (row.Result) {
            if ((row.Result & LogRowResult.highlighted) > 0) highlightedRows++;
            if (((row.Result & LogRowResult.isNewFltGroupStart) > 0 && row.Result & LogRowResult.groupIsCorrect) > 0) correctGroupCount++;
            if (((row.Result & LogRowResult.isNewFltGroupStart) > 0 && row.Result & LogRowResult.groupIsWrong) > 0) wrongGroupCount++;
            if ((row.Result & LogRowResult.errWrongOrder) > 0) errWrongOrderCount++;
        }
    })
    groupCount = correctGroupCount + wrongGroupCount;
    return (
        <div className='filter-panel-totals'>
            <div className='infolabel'>
                Кол-во выделенных строк: <div className='infotext'>{highlightedRows}</div>
            </div>
            {props.showGroupFilter
            ?(
                <div className='radiogroup-wrapper'>
                <FormControl>
                    <RadioGroup value={props.selectedValue} onChange={handleChange} row
                        name="row-radio-buttons-group"
                    >
                        <FormControlLabel value={0} control={<Radio />} label={`Все группы (${groupCount} групп)`} />
                        <FormControlLabel value={LogRowResult.groupIsCorrect} control={<Radio />} label={`Корректные группы (${correctGroupCount} групп)`} />
                        <FormControlLabel value={LogRowResult.groupIsWrong} control={<Radio />} label={`Группы с ошибками (${wrongGroupCount} групп)`} />
                    </RadioGroup>
                </FormControl>
            </div>
            )
            :
            (
            <></>
            )}
        </div >
    );
}