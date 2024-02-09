import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs from "fs";

const cors = require('cors');
import path from "path";
import { ILogRow } from "./commonTypes";
import {deleteFilterSetFolder, processLineByLine, readFilterSetFile, updateFilterSetFolder,updateFilterSetFolderAsync} from './filesHelper';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(cors());
app.use(express.json()); 

interface IrequestResult {
  response: any | undefined;
  error: any | undefined;
}

app.get("/api/logRows", async (req: Request, res: Response) => {
  let filePath = "";
  let logFileFolder:string = "";
  let allFiles: string[] = [];
  let tsFrom = req.query?.dateFrom?.toString();
  let tsTo = tsFrom;
  let tsnFrom = 0;
  let tsnTo = 0;
  let dfrom = new Date();
  let dto = new Date();
  let clearTime = (d: Date) => {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
  };
  let logFiles: string[] = [];
  let respList: ILogRow[] = [];
  let severityStr = "debuginfoerror"; 
  if(req.query.severityStr){
     severityStr = req.query.severityStr.toString().toLowerCase();  
  }
  let isSeverityMatched = (sevValue:string) => {
    return severityStr.includes(sevValue);
  }

  res.setHeader('content-type', 'application/json; charset=utf-8');
  let result: IrequestResult = {
    response: undefined,
    error: undefined
  }

  if (!req.query.folder) {
    result.error = `Отсутствует параметр folder`;
  }
  if (!req.query.dateFrom) {
    result.error = `Отсутствует параметр dateFrom`;
  }
  if (!result.error) {
    if(req.query.folder){
      logFileFolder = req.query.folder.toString();
    }   
    if (logFileFolder && !fs.existsSync(logFileFolder)) {
      result.error = `Папка ${logFileFolder} не найдена`;
    }  
    if (logFileFolder) {
      allFiles = fs.readdirSync(logFileFolder).map(fileName => { return fileName });
    }
    if (allFiles.length === 0) {
      result.error = `Папка ${logFileFolder} пустая`;
    }
    if (req.query.dateTo) {
      tsTo = req.query.dateTo.toString();
    }
    if (tsFrom && tsTo) {
      tsnFrom = parseInt(tsFrom);
      tsnTo = parseInt(tsTo);
    }
    if (isNaN(tsnFrom) || isNaN(tsnTo)) {
      result.error = 'Неверный формат значения в параметрах dateFrom или dateTo (должно быть число)';
    }
  }
  if (!result.error) {
    dfrom = new Date(tsnFrom);
    dto = new Date(tsnTo);
    clearTime(dfrom);
    clearTime(dto);
    logFiles = allFiles.filter(fname => {
      let re = /(debug|info|error).log.(\d\d\d\d)(\d\d)(\d\d)/;
      let m = fname.match(re);
      if (m?.length !== 5) {
        return false;
      }
      let svr = m[1].toString().toLocaleLowerCase();
      if(!isSeverityMatched(svr)){
        return false;
      }
      let year = parseInt(m[2]);
      let month = parseInt(m[3]);
      let day = parseInt(m[4]);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return false;
      }
      let monthInd = month - 1;
      let fileDate = new Date(year, monthInd, day);
      let result = dfrom <= fileDate && fileDate <= dto;
      return result;
    });
    for (let i = 0; i < logFiles.length; i++) {
      let fname = logFiles[i];
      let filePath = path.join(logFileFolder, fname);
      let r = await processLineByLine(filePath, respList.length);
      respList = [...respList, ...r];
    }
    result.response = respList;
  }
  res.write(JSON.stringify(result));    
  res.end();
});
 
app.get("/api/filterSetFile",(req: Request, res: Response)=>{
  let result = readFilterSetFile();
  res.write(JSON.stringify(result));    
  res.end();
});

app.post("/api/updateFilterSetFolder", (req: Request, res: Response)=>{
  let result: IrequestResult = {
    response: undefined,
    error: undefined
  } 
  let filterSetFolder = req.body;
  try{
    updateFilterSetFolder(filterSetFolder);
    result.response = "OK";
  } 
  catch(err:any){
    result.error = {message:err.message};
  }  
  res.json(result); 
});

app.get("/api/deleteFilterSetFolder",(req: Request, res: Response)=>{
  let result: IrequestResult = {
    response: undefined,
    error: undefined
  } 
  let folder = ""; 
  if (!req.query.folder) {
    result.error = `Отсутствует параметр folder`;
  } else {
    folder = req.query.folder.toString();
  }  
  if(folder){
    try{
      deleteFilterSetFolder(folder);
      result.response = "OK";
    } catch(err:any){
      result.error = {message:err.message};
    }
  }
  res.write(JSON.stringify(result));    
  res.end();
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});



