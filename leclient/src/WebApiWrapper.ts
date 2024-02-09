import axios from "axios";
import { IApiResponse, IFilterSetFolder, ILogRow } from "./CommonTypes";

const baseUrl='http://localhost:5000/api/';
export function Dir(handler:(fileList:string[])=>void){
    let srvUrl = baseUrl+'dir';
    httpGet(srvUrl,undefined,handler);
}

export function GetLogRows(logFilesFolder:string,dFrom:number,dTo:number,severityStr:string,handler:(resp:IApiResponse)=>void){
    let srvUrl = baseUrl+'logRows'; 
    let params={folder:logFilesFolder,dateFrom:dFrom,dateTo:dTo,severityStr:severityStr};
    httpGet(srvUrl,params,handler);
}

export function LoadFilterSetFile(handler:(resp:IFilterSetFolder[])=>void){
    let srvUrl = baseUrl+'filterSetFile';
    httpGet(srvUrl,undefined,handler);
} 

export function SaveFolder(payload:IFilterSetFolder,handler:(resp:IApiResponse)=>void){
    let srvUrl = baseUrl+'updateFilterSetFolder';
    httpPost(srvUrl,undefined,payload,handler);
}

function httpGet(addr:string,params:any,handler:any){
    axios({
        url:addr, 
        method:'GET',
        params:params
    })
    .then((response)=>{
        if(handler){
            handler(response.data);
        }
    })
    .catch(err=>{
        let s= 1;
    });
}

function httpPost(addr:string,params:any,payload:any,handler:any){
    axios({
        url:addr, 
        method:'POST',
        params:params,
        data:payload
    })
    .then((response)=>{
        if(handler){
            handler(response.data);
        }
    })
    .catch(err=>{
        let s= 1;
    });    
}