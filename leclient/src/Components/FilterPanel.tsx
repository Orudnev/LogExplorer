import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@mui/base/Input';
import { SelectAndEditItemList } from './SelectAndEditItemList/SelectAndEditItemList';
import { ToolbarButton, ToolbarCheckButton } from './ToolbarButton';
import * as Api from '../WebApiWrapper';
import { IFilterSet, IFilterSetFolder } from '../CommonTypes';
import { AppSessionData } from './AppData';

interface IFilterPanel {
    rows: string[];
    onChange: (frows: string[], isFilterOn: boolean) => void;
}

interface IFilterPanelRow {
    rows: string[];
    index: number;
    onChangedValue: (index: number, newValue: string) => void;
    onDeleteRowBtnClick: (index: number) => void;
    onAddRowBtnClick: () => void;
}

function FilterPanelRow(props: IFilterPanelRow) {
    const [value, setValue] = useState("");
    useEffect(() => {
        setValue(props.rows[props.index]);
    }, [props]);
    let plusbtn = <></>;
    let minusbtn = <></>;
    if (props.rows.length > 1) {
        minusbtn = <ToolbarButton toolTip='Удалить строку' image='minus' size='24' class='filter-row__button' onClick={() => {
            props.onDeleteRowBtnClick(props.index);
        }} />
    }
    if (props.index === props.rows.length - 1) {
        plusbtn = <ToolbarButton toolTip='Добавить строку' image='plus' size='24' class='filter-row__button' onClick={() => {
            props.onAddRowBtnClick();
        }} />
    }
    return (
        <div className='filter-row'>
            <div className='filter-row__id'>{props.index}</div>
            <Input autoFocus={true} className='filter-row__input' value={value}
                onChange={(e) => {
                    let newValue = e.currentTarget.value;
                    setValue(newValue);
                    props.rows[props.index] = newValue;
                }}
            />
            {minusbtn}
            {plusbtn}
        </div>
    );
}


export function FilterPanel(props: IFilterPanel) {
    const [frows, setFrows] = useState(props.rows);
    const [isFilterOn, setIsFilterOn] = useState(false);
    const [filterFileContent, setFilterFileContent] = useState<IFilterSetFolder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [selectedFilterSet, setSelectedFilterSet] = useState('');
    useEffect(() => {
        Api.LoadFilterSetFile((fList: IFilterSetFolder[]) => {
            setFilterFileContent(fList);
            let storedFolder = 
                fList.find(itm=>itm.name.toLocaleLowerCase() === AppSessionData.prop('LastSelectedFolder').toLocaleLowerCase());
            if(storedFolder){
                setSelectedFolder(storedFolder.name);
                let storedFset =
                storedFolder.filterSetList
                    .find(itm=>itm.name.toLocaleLowerCase() === AppSessionData.prop('LastSelectedFilterSet').toLocaleLowerCase());
                if(storedFset){
                    setSelectedFilterSet(storedFset.name);
                    setFrows(storedFset.filterRows);
                }
            }
        })
    }, []);
    let folderList = filterFileContent.length > 0 ? filterFileContent.map(itm => itm.name) : [];
    let selectedFolderListItem = (folderList.length > 0 && selectedFolder) ? filterFileContent.find(itm => itm.name === selectedFolder) : undefined;
    let filterSetList: string[] = [];
    let getFilterSet = (fsetName: string,folderName:string = selectedFolder) => {
        let result = undefined;
        let folderItem = filterFileContent.find(itm => itm.name === folderName);
        if (folderItem) {
            result = folderItem.filterSetList.find(itm => itm.name === fsetName);
        }
        return result;
    };
    let saveFolder = () => {
        let fset = getFilterSet(selectedFilterSet);
        if (fset) {
            fset.filterRows = frows;
        }
        let folderItem = filterFileContent.find(itm => itm.name === selectedFolder);
        if(folderItem){
            Api.SaveFolder(folderItem, (resp) => {
                let s = 1;
            });    
        }
    }


    if (selectedFolderListItem) {
        filterSetList = selectedFolderListItem.filterSetList.map(itm => itm.name);
    } else {
        filterSetList = [];
    }
    return (
        <div className='filter-row-list-container'>
            <div className="border-label-font">Панель набора фильтров</div>
            <div className='filter-rows-toolbar'>
                <SelectAndEditItemList
                    itemList={folderList}
                    caption='Выбор папки'
                    selectedItem={selectedFolder} onSelected={(selFolder) => {
                        setSelectedFolder(selFolder);
                        if(!selFolder){
                            setSelectedFilterSet('');
                        }
                    }}
                    onAdd={(item) => {
                        let newItem: IFilterSetFolder = {
                            name: item,
                            description: '',
                            filterSetList: [{ name: 'default', description: '', filterRows: [''] }]
                        };
                        filterFileContent.push(newItem);
                        setSelectedFolder(item);
                    }}
                    onDelete={(item) => {
                        let newFilterFileContent = filterFileContent.filter(itm => itm.name.toLowerCase() !== item);
                        setFilterFileContent(newFilterFileContent);
                        setSelectedFolder("");
                    }}
                />
                <SelectAndEditItemList
                    itemList={filterSetList}
                    caption='Выбор набора фильтров'
                    selectedItem={selectedFilterSet}
                    onSelected={(selFset) => {
                        setSelectedFilterSet(selFset);
                        let fsetItem = getFilterSet(selFset)
                        if (fsetItem) {
                            setFrows(fsetItem.filterRows);
                            AppSessionData.prop('LastSelectedFolder',selectedFolder);
                            AppSessionData.prop('LastSelectedFilterSet',selFset);
                        }
                        
                    }}
                    onAdd={(item) => {
                        let newItem: IFilterSet = {
                            name: item,
                            description: '',
                            filterRows: ['']
                        }
                        let folderItem = filterFileContent.find(itm => itm.name === selectedFolder);
                        if (folderItem) {
                            folderItem.filterSetList.push(newItem);
                            setSelectedFilterSet(item);
                        }
                    }}
                    onDelete={(item) => {
                        let folderItem = filterFileContent.find(itm => itm.name === selectedFolder);
                        if (folderItem) {
                            folderItem.filterSetList = folderItem.filterSetList.filter(itm => itm.name !== item);
                        }
                    }}
                />
                <ToolbarButton toolTip='Применить изменения' image='apply' size='48' onClick={() => {
                    props.onChange(frows, isFilterOn);
                }} />
                {frows.length > 1 || (frows.length == 1 && frows[0])
                    ? (
                        <ToolbarCheckButton
                            toolTip='Фильтр вкл/выкл'
                            imageOn='filter-on'
                            imageOff='filter-off'
                            image='cancel'
                            size='48'
                            value={isFilterOn}
                            onClick={() => {
                                setIsFilterOn(!isFilterOn);
                                props.onChange(frows, !isFilterOn);
                            }} />
                    ) : (<></>)
                }
                {(frows.length > 1 || (frows.length == 1 && frows[0])) && selectedFolder && selectedFilterSet
                    ? (
                        <ToolbarButton toolTip='Сохранить' image='save' size='48' onClick={() => {
                            saveFolder();
                        }} />
                    ) : (<></>)
                }

            </div>
            <div className='filter-row-list'>
                {frows.map((itm, idx) => {
                    return <FilterPanelRow key={idx}
                        rows={frows}
                        index={idx}
                        onChangedValue={(index, newValue) => {
                            frows[index] = newValue;
                        }}
                        onAddRowBtnClick={() => {
                            let newRowSet = [...frows];
                            newRowSet.push("");
                            setFrows(newRowSet);
                        }}
                        onDeleteRowBtnClick={(ind) => {
                            let newRowSet: string[] = [];
                            frows.forEach((r, i) => {
                                if (i === ind) {
                                    return;
                                }
                                newRowSet.push(r);
                            });
                            setFrows(newRowSet);
                        }}
                    />;
                })}
            </div>
        </div>
    );
}