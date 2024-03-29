import React, { useEffect, useState, useRef } from 'react';
import Tooltip from '@mui/material/Tooltip';

export type TToolbarButtonImage = 'apply'|'cancel'|'plus'|'minus'|'filter-on'|'filter-off'|'refresh'|'gear'|'exit'|'save'|'error'|'up'|'down'|'trash-on'|'trash-off'|'selitems-on'|'selitems-off';
export type TToolbarBtnSize = '56'|'48'|'32'|'24';
export interface IToolbarButton{
    toolTip:string;
    image:TToolbarButtonImage;
    size:TToolbarBtnSize;
    class?:string;
    onClick:()=>void; 
} 

export function ToolbarButton(props:IToolbarButton) {
    return (
        <Tooltip title={props.toolTip}>
            <div 
                className={`img-button img-button${props.size} img-${props.image} bckgrSize${props.size} ${props.class}`} 
                onClick={()=>{props.onClick()}}
            />
        </Tooltip>
    );
}

export interface IToolbarCheckButton extends IToolbarButton{
    toolTip:string;
    imageOn:TToolbarButtonImage;
    imageOff:TToolbarButtonImage;
    size:TToolbarBtnSize;
    class?:string;
    value:boolean;
    onClick:()=>void;
}

export function ToolbarCheckButton(props:IToolbarCheckButton) {
    let imgname = props.value?props.imageOn:props.imageOff;
    return (
        <Tooltip title={props.toolTip}>
            <div 
                className={`img-button img-button${props.size} img-${imgname} bckgrSize${props.size} ${props.class}`} 
                onClick={()=>{props.onClick()}}
            />
        </Tooltip>
    );
}