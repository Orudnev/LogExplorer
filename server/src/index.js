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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const cors = require('cors');
const path_1 = __importDefault(require("path"));
const filesHelper_1 = require("./filesHelper");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.use(cors());
app.use(express_1.default.json());
app.get("/api/logRows", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let filePath = "";
    let logFileFolder = "";
    let allFiles = [];
    let tsFrom = (_b = (_a = req.query) === null || _a === void 0 ? void 0 : _a.dateFrom) === null || _b === void 0 ? void 0 : _b.toString();
    let tsTo = tsFrom;
    let tsnFrom = 0;
    let tsnTo = 0;
    let dfrom = new Date();
    let dto = new Date();
    let clearTime = (d) => {
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
    };
    let logFiles = [];
    let respList = [];
    let severityStr = "debuginfoerror";
    if (req.query.severityStr) {
        severityStr = req.query.severityStr.toString().toLowerCase();
    }
    let isSeverityMatched = (sevValue) => {
        return severityStr.includes(sevValue);
    };
    res.setHeader('content-type', 'application/json; charset=utf-8');
    let result = {
        response: undefined,
        error: undefined
    };
    if (!req.query.folder) {
        result.error = `Отсутствует параметр folder`;
    }
    if (!req.query.dateFrom) {
        result.error = `Отсутствует параметр dateFrom`;
    }
    if (!result.error) {
        if (req.query.folder) {
            logFileFolder = req.query.folder.toString();
        }
        if (logFileFolder && !fs_1.default.existsSync(logFileFolder)) {
            result.error = `Папка ${logFileFolder} не найдена`;
        }
        if (logFileFolder) {
            allFiles = fs_1.default.readdirSync(logFileFolder).map(fileName => { return fileName; });
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
            if ((m === null || m === void 0 ? void 0 : m.length) !== 5) {
                return false;
            }
            let svr = m[1].toString().toLocaleLowerCase();
            if (!isSeverityMatched(svr)) {
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
            let filePath = path_1.default.join(logFileFolder, fname);
            let r = yield (0, filesHelper_1.processLineByLine)(filePath, respList.length);
            respList = [...respList, ...r];
        }
        respList.sort((a, b) => {
            if (a.Date && b.Date) {
                return a.Date.getTime() - b.Date.getTime();
            }
            if (!a && !b)
                return 0;
            return a ? 1 : -1;
        });
        respList.forEach((itm, idx) => { itm.id = idx; });
        result.response = respList;
    }
    res.write(JSON.stringify(result));
    res.end();
}));
app.get("/api/filterSetFile", (req, res) => {
    let result = (0, filesHelper_1.readFilterSetFile)();
    res.write(JSON.stringify(result));
    res.end();
});
app.post("/api/updateFilterSetFolder", (req, res) => {
    let result = {
        response: undefined,
        error: undefined
    };
    let filterSetFolder = req.body;
    try {
        (0, filesHelper_1.updateFilterSetFolder)(filterSetFolder);
        result.response = "OK";
    }
    catch (err) {
        result.error = { message: err.message };
    }
    res.json(result);
});
app.get("/api/deleteFilterSetFolder", (req, res) => {
    let result = {
        response: undefined,
        error: undefined
    };
    let folder = "";
    if (!req.query.folder) {
        result.error = `Отсутствует параметр folder`;
    }
    else {
        folder = req.query.folder.toString();
    }
    if (folder) {
        try {
            (0, filesHelper_1.deleteFilterSetFolder)(folder);
            result.response = "OK";
        }
        catch (err) {
            result.error = { message: err.message };
        }
    }
    res.write(JSON.stringify(result));
    res.end();
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
