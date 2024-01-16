// Compiled auto updater class
// See Duck Exchange webiste for source code

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdater = void 0;
var cron = require('node-cron');
const fs = __importStar(require("fs"));
const https = require('https');
const { spawn } = require('child_process');
class AutoUpdater {
    constructor(repoUrl, updateCron) {
        this.repoUrl = repoUrl;
        this.currentVersion = JSON.parse(fs.readFileSync("./package.json", "utf-8")).version;
        console.log("Running Version: ", this.currentVersion);
        console.log("Started Auto Updater");
        console.log("");
        cron.schedule(updateCron, () => {
            this.check();
        });
    }
    ;
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            //let result = this.checkVersions(this.currentVersion, this.parseVersionString(await this.fetchJSON(this.repoUrl)));
            let result = (this.currentVersion == (yield this.fetchJSON(this.repoUrl)));
            console.log("Check For Update Result: ", result);
            if (result) {
                return;
            }
            console.log("Updating Code");
            const child = spawn("git pull && npm install", {
                detached: true,
                stdio: 'ignore',
                shell: true
            });
            child.unref();
        });
    }
    parseVersionString(versionString) {
        let strArray = versionString.split(".");
        let parsedArray = [];
        strArray.forEach(str => {
            parsedArray.push(JSON.parse(str));
        });
        return parsedArray;
    }
    checkVersions(ver1, ver2) {
        let result = true;
        for (let i = 0; i < ver1.length; i++) {
            if (ver1[i] != ver2[i]) {
                result = false;
            }
        }
        return result;
    }
    fetchJSON(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                https.get(url, (response) => {
                    let data = '';
                    // A chunk of data has been received.
                    response.on('data', (chunk) => {
                        data += chunk;
                    });
                    // The whole response has been received.
                    response.on('end', () => {
                        try {
                            const jsonData = JSON.parse(data);
                            resolve(jsonData.version);
                        }
                        catch (error) {
                            resolve("");
                        }
                    });
                }).on('error', (error) => {
                    console.error('Error fetching JSON:', error.message);
                    resolve("");
                });
            });
        });
    }
}
exports.AutoUpdater = AutoUpdater;
