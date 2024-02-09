import React, { useReducer, useEffect, useState } from 'react';
import { AppGlobal } from '../App';
import { AppSessionData, TAppSesstionDataProps } from './AppData';
import Switch from './Switch/Switch';
import { ToolbarButton } from './ToolbarButton';
import { Input } from '@mui/base/Input';

export interface ISettingsItemProps {
    labelText: string;
    propId: TAppSesstionDataProps;
}

function SettingsBoolItem(props: ISettingsItemProps) {
    return (
        <div className="settings-bool-item">
            <div>{props.labelText}</div>
            <div><Switch propId={props.propId} /></div>
        </div>
    );
}

function SettingsStringItem(props: ISettingsItemProps) {
    const [value,setValue] = useState(AppSessionData.prop(props.propId));
    return (
        <div className="settings-item">
            <div className='settings-item__label'>{props.labelText}</div>
            <Input className='' value={value}
                onChange={(e) => {
                    let val = e.currentTarget.value
                    AppSessionData.prop(props.propId,val);
                    setValue(val);
                }}
            />
        </div>
    );
}

export interface ISettingsProps {
    onExit: () => void;
}

export function Settings(props: any) {
    return (
        <div className='settings-page'>
            <div className='settings-page__header' >
                <ToolbarButton image='exit' toolTip='Выход' size='56' onClick={() => {
                    AppGlobal.navigate('/');
                }} />
                <div className='settings-page__title'>Настройки</div>
            </div>
            <div className='settings-body'>
                <SettingsStringItem labelText='Путь к папке с Log файлами:' propId='LogFilesFolder' />
            </div>
            {/* <SettingsBoolItem labelText='Say answer' propId={'PlCfg_SayAnswer'} />
            <SettingsBoolItem labelText='Listen answer' propId={'PlCfg_ListenAnswer'} /> */}
        </div>
    );
}