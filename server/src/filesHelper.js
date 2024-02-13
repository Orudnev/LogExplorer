"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFilterSetFolder = exports.updateFilterSetFolderAsync = exports.updateFilterSetFolder = exports.readFilterSetFile = exports.processLineByLine = exports.loadLogFile = void 0;
const fs_1 = __importDefault(require("fs"));
const readline = require('readline');
function loadLogFile(filePath) {
    let fileBody = fs_1.default.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    let lines = fileBody.split('\r\n');
    let re_rowDelimiter = /=============================+/;
    let re_firstLine = /(DEBUG|INFO|ERROR)\s+(\d\d\d\d)-(\d\d)-(\d\d)\s+(\d\d):(\d\d):(\d\d).(\d\d\d)\d\s+-\s+Thread:\s+.+\((\d+)\)/;
    let rowIndex = 0;
    let newRow = { id: 0, RowLineNumber: -1 };
    let resetNewRow = () => {
        newRow = {
            id: 0,
            RowLineNumber: 0,
            Severity: "",
            Date: undefined,
            ThreadId: undefined,
            Comment: ""
        };
    };
    let parseRowHeader = (headerStr) => {
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
    let result = [];
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        let line = lines[lineIndex];
        if (line.match(re_rowDelimiter)) {
            if (newRow.RowLineNumber === -1) {
                // -1 означает, что это первая запись лога
                continue;
            }
            else {
                // это делимитер следующей строки, необходимо записать результат обработки предыдущей строки
                newRow.id = rowIndex;
                result.push(Object.assign({}, newRow));
                resetNewRow();
                rowIndex++;
                continue;
            }
        }
        if (!newRow.Severity) {
            // это заголовок записи (1 строка)
            parseRowHeader(line);
            newRow.RowLineNumber = lineIndex;
        }
        else {
            // это комментарий
            newRow.Comment += line;
        }
    }
    newRow.id = rowIndex;
    result.push(Object.assign({}, newRow));
    return result;
}
exports.loadLogFile = loadLogFile;
function processLineByLine(filePath, startRowIndex) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const fileStream = fs_1.default.createReadStream(filePath);
        let re_rowDelimiter = /=============================+/;
        let re_firstLine = /(DEBUG|INFO|ERROR)\s+(\d\d\d\d)-(\d\d)-(\d\d)\s+(\d\d):(\d\d):(\d\d).(\d\d\d)\d\s+-\s+Thread:\s+.+\((\d+)\)/;
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        let rowIndex = startRowIndex;
        let newRow = { id: 0, RowLineNumber: -1 };
        let resetNewRow = () => {
            newRow = {
                id: 0,
                RowLineNumber: 0,
                Severity: "",
                Date: undefined,
                ThreadId: undefined,
                Comment: ""
            };
        };
        let parseRowHeader = (headerStr) => {
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
        let result = [];
        let lineIndex = -1;
        try {
            for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
                _c = rl_1_1.value;
                _d = false;
                const line = _c;
                lineIndex++;
                if (line.match(re_rowDelimiter)) {
                    if (newRow.RowLineNumber === -1) {
                        // -1 означает, что это первая запись лога
                        continue;
                    }
                    else {
                        // это делимитер следующей строки, необходимо записать результат обработки предыдущей строки
                        newRow.id = rowIndex;
                        result.push(Object.assign({}, newRow));
                        resetNewRow();
                        rowIndex++;
                        continue;
                    }
                }
                if (!newRow.Severity) {
                    // это заголовок записи (1 строка)
                    parseRowHeader(line);
                    newRow.RowLineNumber = lineIndex;
                }
                else {
                    // это комментарий
                    newRow.Comment += line;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        newRow.id = rowIndex;
        result.push(Object.assign({}, newRow));
        fileStream.close();
        return result;
    });
}
exports.processLineByLine = processLineByLine;
const defaultFilterSetFolder = [
    { name: 'Default', description: '', filterSetList: [{ name: "TestFilterSet", description: "", filterRows: [""] }] }
];
function getDefaultFilterSetFilePath() {
    const defaultFilterSetFile = 'defaultFilterSet.json';
    let filterSetFolder = __dirname + '\\filterset';
    if (!fs_1.default.existsSync(filterSetFolder)) {
        fs_1.default.mkdirSync(filterSetFolder);
    }
    let fileName = defaultFilterSetFile;
    let filePath = filterSetFolder + '\\' + fileName;
    return filePath;
}
function readFilterSetFile() {
    let filePath = getDefaultFilterSetFilePath();
    if (!fs_1.default.existsSync(filePath)) {
        return defaultFilterSetFolder;
    }
    let fileBody = fs_1.default.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    let result = JSON.parse(fileBody);
    return result;
}
exports.readFilterSetFile = readFilterSetFile;
function updateFilterSetFolder(filterSetFolder) {
    let filterSetFileData = readFilterSetFile();
    let itemIndex = filterSetFileData.findIndex(itm => itm.name === filterSetFolder.name);
    if (itemIndex === -1) {
        filterSetFileData.push(filterSetFolder);
    }
    else {
        filterSetFileData[itemIndex] = filterSetFolder;
    }
    let updatedFileJson = JSON.stringify(filterSetFileData);
    let filePath = getDefaultFilterSetFilePath();
    fs_1.default.writeFileSync(filePath, updatedFileJson, { flag: 'w' });
}
exports.updateFilterSetFolder = updateFilterSetFolder;
function updateFilterSetFolderAsync(filterSetFolder) {
    let filterSetFileData = readFilterSetFile();
    let itemIndex = filterSetFileData.findIndex(itm => itm.name === filterSetFolder.name);
    if (itemIndex === -1) {
        filterSetFileData.push(filterSetFolder);
    }
    else {
        filterSetFileData[itemIndex] = filterSetFolder;
    }
    let updatedFileJson = JSON.stringify(filterSetFileData);
    let filePath = getDefaultFilterSetFilePath();
    return new Promise(resolve => {
        fs_1.default.writeFile(filePath, updatedFileJson, (err) => {
            if (err) {
                return { error: err };
            }
            else {
                return { response: "OK" };
            }
        });
    });
}
exports.updateFilterSetFolderAsync = updateFilterSetFolderAsync;
function deleteFilterSetFolder(filterSetFolderName) {
    let filterSetFileData = readFilterSetFile();
    let newData = filterSetFileData.filter(itm => {
        return itm.name !== filterSetFolderName;
    });
    let updatedFileJson = JSON.stringify(newData);
    let filePath = getDefaultFilterSetFilePath();
    fs_1.default.writeFileSync(filePath, updatedFileJson, { flag: 'w' });
}
exports.deleteFilterSetFolder = deleteFilterSetFolder;
