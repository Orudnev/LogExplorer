import './SelectAndEditItemList.css';
import React, { useEffect, useState, useRef, Children } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ToolbarButton } from '../ToolbarButton';
import { Input } from '@mui/base/Input';


interface ISelectFromList {
    itemList: string[];
    selectedItem: string;
    caption: string;
    onChange: (selItem: string) => void;
}


{/* <MenuItem value="">
          <em>None</em>
        </MenuItem> */}

function SelectFromList(props: ISelectFromList) {
    const [selectedItem, setSelectedItem] = React.useState(props.selectedItem);
    const items: any[] = [];
    items.push(<MenuItem value=""><em>Очистить</em></MenuItem>);
    props.itemList.forEach((itm, index) => {
        let newItem = <MenuItem key={index} value={itm}>{itm}</MenuItem>;
        items.push(newItem);
    });
    useEffect(() => { 
        setSelectedItem(props.selectedItem) 
    }, [props.itemList,props.selectedItem]);
    return (
        <FormControl sx={{ m: 1, minWidth: 250 }} size="small">
            <InputLabel id="demo-select-small-label">{props.caption}</InputLabel>
            <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={selectedItem}
                label={props.caption}
                onChange={(ev) => {
                    setSelectedItem(ev.target.value);
                    props.onChange(ev.target.value);
                }}
            >
                {items}
            </Select>
        </FormControl >
    );
}

export interface ISelectAndEditItemList {
    itemList: string[];
    caption: string;
    selectedItem: string;
    onSelected: (selItem: string) => void;
    onAdd:(item:string) => void;
    onDelete:(item:string)=>void;
}

type TSelectFilterFolterMode = 'Select' | 'AddNewItem';
export function SelectAndEditItemList(props: ISelectAndEditItemList) {
    const caption = "Выбор папки";
    const [newItemName, setNewItemName] = React.useState('');
    const [mode, setMode] = useState<TSelectFilterFolterMode>('Select');
    const [selectedItem, setSelectedItem] = React.useState("");
    const [itmList, setItmList] = useState<string[]>(props.itemList);
    const [errorText, setErrorText] = useState('');
    useEffect(() => {
        setItmList(props.itemList);
    }, [props.itemList, props.selectedItem])
    if (mode === 'Select') {
        return (
            <div className='sel-edit-itmlist'>
                <div className="form-control-wrapper">
                    <SelectFromList itemList={itmList} selectedItem={props.selectedItem} caption={props.caption} onChange={(selItem) => {
                        setSelectedItem(selItem);
                        props.onSelected(selItem);
                    }} />
                </div>
                <div className='toolbar'>
                    <ToolbarButton toolTip='Добавить новый элемент списка' image='plus' size='32' class='toolbar__button' onClick={() => {
                        setMode('AddNewItem');
                    }} />
                    {selectedItem
                        ? (
                            <ToolbarButton toolTip={`Удалить элемент ${selectedItem}`} image='minus' size='32' class='toolbar__button' onClick={() => {
                                let newItemList = itmList.filter(itm => itm !== selectedItem);
                                setItmList([...newItemList]);
                                props.onDelete(selectedItem);
                                setSelectedItem('');
                            }} />
                        )
                        : (
                            <></>
                        )}
                </div>
            </div>
        );
    }
    if (mode === 'AddNewItem') {
        return (
            <div className='sel-edit-itmlist'>
                <div className='mode-add-newitem'>
                    <Input autoFocus={true} className='select-edit-input' value={newItemName}
                        onFocus={() => { setErrorText("") }}
                        onChange={(e) => {
                            let newValue = e.currentTarget.value;
                            setNewItemName(newValue);
                        }}
                    />
                    <div className={`error-text ${errorText ? 'error-text_show' : 'error-text_hide'}`}>{errorText ? errorText : "no errors"}</div>
                    <div className='toolbar-modeAddNew'>
                        <ToolbarButton toolTip='Создать новую папку' image='apply' size='32' class='toolbar__button' onClick={() => {
                            let alreadyExists = itmList.some(itm => itm.toLowerCase() === newItemName.toLocaleLowerCase());
                            if (alreadyExists) {
                                setErrorText('Такой элемент уже есть');
                            } else {
                                itmList.push(newItemName);
                                setItmList([...itmList]);
                                setMode('Select');
                                setSelectedItem(newItemName);
                                setNewItemName('');
                                props.onAdd(newItemName);
                            }
                        }} />
                        <ToolbarButton toolTip={`Отменить`} image='cancel' size='32' class='toolbar__button' onClick={() => {
                            setNewItemName('');
                            setMode('Select');
                        }} />
                    </div>
                </div>
            </div>
        );
    }
    return (<></>);
}