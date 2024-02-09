import fs from "fs";
import { IFilterSet, IFilterSetFolder, ILogRow } from "./commonTypes";
const readline = require('readline');

export function loadLogFile(filePath: string): ILogRow[] {
  let fileBody = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  let lines = fileBody.split('\r\n');
  let re_rowDelimiter = /=============================+/;
  let re_firstLine = /(DEBUG|INFO|ERROR)\s+(\d\d\d\d)-(\d\d)-(\d\d)\s+(\d\d):(\d\d):(\d\d).(\d\d\d)\d\s+-\s+Thread:\s+.+\((\d+)\)/;
  let rowIndex = 0;
  let newRow: ILogRow = { id: 0, RowLineNumber: -1 };
  let resetNewRow = () => {
    newRow = {
      id: 0,
      RowLineNumber: 0,
      Severity: "",
      Date: undefined,
      ThreadId: undefined,
      Comment: ""
    };
  }
  let parseRowHeader = (headerStr: string) => {
    let firstLm = headerStr.match(re_firstLine);
    if (firstLm) {
      newRow.Severity = firstLm[1];
      let year = parseInt(firstLm[2]);
      let month = parseInt(firstLm[3]) - 1;
      let days = parseInt(firstLm[4]);
      let hours = parseInt(firstLm[5]);
      let minutes = parseInt(firstLm[6]);
      let seconds = parseInt(firstLm[7]);
      let milliseconds = parseInt(firstLm[8]);
      let tid = parseInt(firstLm[9]);
      newRow.Date = new Date(year, month, days, hours, minutes, seconds, milliseconds);
      newRow.ThreadId = tid;
    }
  };
  let result: ILogRow[] = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex];
    if (line.match(re_rowDelimiter)) {
      if (newRow.RowLineNumber === -1) {
        // -1 означает, что это первая запись лога
        continue;
      } else {
        // это делимитер следующей строки, необходимо записать результат обработки предыдущей строки
        newRow.id = rowIndex;
        result.push({ ...newRow });
        resetNewRow();
        rowIndex++;
        continue;
      }
    }
    if (!newRow.Severity) {
      // это заголовок записи (1 строка)
      parseRowHeader(line);
      newRow.RowLineNumber = lineIndex;
    } else {
      // это комментарий
      newRow.Comment += line;
    }
  }
  newRow.id = rowIndex;
  result.push({ ...newRow });
  return result;
}

export async function processLineByLine(filePath: string, startRowIndex: number) {
  const fileStream = fs.createReadStream(filePath);
  let re_rowDelimiter = /=============================+/;
  let re_firstLine = /(DEBUG|INFO|ERROR)\s+(\d\d\d\d)-(\d\d)-(\d\d)\s+(\d\d):(\d\d):(\d\d).(\d\d\d)\d\s+-\s+Thread:\s+.+\((\d+)\)/;
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let rowIndex = startRowIndex;
  let newRow: ILogRow = { id: 0, RowLineNumber: -1 };
  let resetNewRow = () => {
    newRow = {
      id: 0,
      RowLineNumber: 0,
      Severity: "",
      Date: undefined,
      ThreadId: undefined,
      Comment: ""
    };
  }
  let parseRowHeader = (headerStr: string) => {
    let firstLm = headerStr.match(re_firstLine);
    if (firstLm) {
      newRow.Severity = firstLm[1];
      let year = parseInt(firstLm[2]);
      let month = parseInt(firstLm[3]) - 1;
      let days = parseInt(firstLm[4]);
      let hours = parseInt(firstLm[5]);
      let minutes = parseInt(firstLm[6]);
      let seconds = parseInt(firstLm[7]);
      let milliseconds = parseInt(firstLm[8]);
      let tid = parseInt(firstLm[9]);
      newRow.Date = new Date(year, month, days, hours, minutes, seconds, milliseconds);
      newRow.ThreadId = tid;
    }
  };
  let result: ILogRow[] = [];

  let lineIndex = -1;
  for await (const line of rl) {
    lineIndex++;
    if (line.match(re_rowDelimiter)) {
      if (newRow.RowLineNumber === -1) {
        // -1 означает, что это первая запись лога
        continue;
      } else {
        // это делимитер следующей строки, необходимо записать результат обработки предыдущей строки
        newRow.id = rowIndex;
        result.push({ ...newRow });
        resetNewRow();
        rowIndex++;
        continue;
      }
    }
    if (!newRow.Severity) {
      // это заголовок записи (1 строка)
      parseRowHeader(line);
      newRow.RowLineNumber = lineIndex;
    } else {
      // это комментарий
      newRow.Comment += line;
    }
  }
  newRow.id = rowIndex;
  result.push({ ...newRow });
  fileStream.close();
  return result;
}

const defaultFilterSetFolder: IFilterSetFolder[] = [
  { name: 'Default', description: '', filterSetList: [{ name: "TestFilterSet", description: "", filterRows: [""] }] }
];



function getDefaultFilterSetFilePath() {
  const defaultFilterSetFile = 'defaultFilterSet.json';
  let filterSetFolder = __dirname + '\\filterset';
  if (!fs.existsSync(filterSetFolder)) {
    fs.mkdirSync(filterSetFolder);
  }
  let fileName = defaultFilterSetFile;
  let filePath = filterSetFolder + '\\' + fileName;
  return filePath;
}

export function readFilterSetFile(): IFilterSetFolder[] {
  let filePath = getDefaultFilterSetFilePath();
  if (!fs.existsSync(filePath)) {
    return defaultFilterSetFolder;
  }
  let fileBody = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  let result: IFilterSetFolder[] = JSON.parse(fileBody);
  return result;
}

export function updateFilterSetFolder(filterSetFolder: IFilterSetFolder) {
  let filterSetFileData = readFilterSetFile();
  let itemIndex = filterSetFileData.findIndex(itm => itm.name === filterSetFolder.name);
  if (itemIndex === -1) {
    filterSetFileData.push(filterSetFolder);
  } else {
    filterSetFileData[itemIndex] = filterSetFolder;
  }
  let updatedFileJson = JSON.stringify(filterSetFileData);
  let filePath = getDefaultFilterSetFilePath();

  fs.writeFileSync(filePath, updatedFileJson,{flag:'w'});
}

export function updateFilterSetFolderAsync(filterSetFolder: IFilterSetFolder) {
  let filterSetFileData = readFilterSetFile();
  let itemIndex = filterSetFileData.findIndex(itm => itm.name === filterSetFolder.name);
  if (itemIndex === -1) {
    filterSetFileData.push(filterSetFolder);
  } else {
    filterSetFileData[itemIndex] = filterSetFolder;
  }
  let updatedFileJson = JSON.stringify(filterSetFileData);
  let filePath = getDefaultFilterSetFilePath();
  return new Promise(resolve => {
    fs.writeFile(filePath, updatedFileJson, (err) => {
      if (err) {
        return { error: err };
      } else {
        return { response: "OK" };
      }
    });
  });
}


export function deleteFilterSetFolder(filterSetFolderName: string) {
  let filterSetFileData = readFilterSetFile();
  let newData = filterSetFileData.filter(itm => {
    return itm.name !== filterSetFolderName
  });
  let updatedFileJson = JSON.stringify(newData);
  let filePath = getDefaultFilterSetFilePath();
  fs.writeFileSync(filePath, updatedFileJson,{flag:'w'});
}



