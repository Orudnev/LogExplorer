import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  NavigateFunction,
  useNavigate,
  Navigate,
  Link
} from "react-router-dom";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ru';
import './App.css';
import './Images.css';
import { AppSessionData, TAppSettigs } from './Components/AppData';
import { store, TAllActions, IAppState } from './Reducers/index';
import * as Api from './WebApiWrapper';
import { MainPage } from './Components/MainPage';
import { Settings } from './Components/Settings';


class AppGlobalClass {
  private navfunc: NavigateFunction | undefined = undefined;
  signalR: any;
  //signalRGate:SRGateClass|undefined=undefined;
  prevAction: any = null;
  dispatchFunc: any = undefined;
  hwConnectorPort: string = "";
  constructor() {
    this.getState = this.getState.bind(this);
    this.navigate = this.navigate.bind(this);
  }

  init(navf: NavigateFunction) {
    this.navfunc = navf;
  }

  dispatch(action: TAllActions) {
    store.dispatch(action);
  }

  navigate(url: any) {
    if (this.navfunc) {
      this.navfunc(url);
    }
  }

  getState(): IAppState {
    let st = store.getState();
    return st;
  }
}

export const AppGlobal = new AppGlobalClass();


const Root = () => {
  return (
    <div>Root</div>
  );
}

function App() {
  AppGlobal.init(useNavigate());
  //@ts-ignore
  window.appg = AppGlobal;
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
    <div>
      <Routes>
        <Route path={"/"} element={<MainPage />} />
        <Route path={"/Settings"} element={<Settings />} />
      </Routes> 
    </div>
    </LocalizationProvider> 
  );
}

export default App;
