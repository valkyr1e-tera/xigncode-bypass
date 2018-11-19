"use strict"

const fs = require("fs");
const path = require("path");
const ProcessListener = require("./process-listener");
const { scan_interval: SCAN_INTERVAL } = require('./config.json');

let PatchedProcesses = {};

function HandleAddedProcess(process)
{
    try
    {
        let XigncodeFolder = path.join(path.dirname(process.path), "XIGNCODE");
        fs.copyFileSync(path.join(__dirname, "res/x3.xem"), path.join(XigncodeFolder, "x3.xem"));
        fs.copyFileSync(path.join(__dirname, "res/xcorona.xem"), path.join(XigncodeFolder, "xcorona.xem"));
        PatchedProcesses[process.pid] = XigncodeFolder;
        
        console.log(`[xigncode-bypass] Game client (PID ${process.pid}) detected, bypass installed.`);
    }
    catch(e)
    {
        // Ignore errors...
    }
}

function HandleRemovedProcess(pid)
{
    try
    {
        let XigncodeFolder = PatchedProcesses[pid];
        
        if(BACKUP) {
            fs.renameSync(path.join(XigncodeFolder, "x3.xem.bak"), path.join(XigncodeFolder, "x3.xem"));
            fs.renameSync(path.join(XigncodeFolder, "xcorona.xem.bak"), path.join(XigncodeFolder, "xcorona.xem"));
            console.log(`[xigncode-bypass] Game client (PID ${pid}) closed, bypass reverted.`);
        }
        
        delete PatchedProcesses[pid];
    }
    catch(e)
    {
        // Ignore errors...
    }
}

module.exports = function XigncodeBypass(region) {
    if (["eu", "ru"].includes(region)) {
        console.log(`[xigncode-bypass] Not required for region ${region.toUpperCase()}, going to sleep!`);
        return;
    }

    ProcessListener("TERA.exe", HandleAddedProcess, HandleRemovedProcess, SCAN_INTERVAL);
    console.log("[xigncode-bypass] Ready, waiting for game client to be started!");

    try {
        fs.unlinkSync("C:\\Windows\\xhunter1.sys");
        console.log("[xigncode-bypass] Traces of a previous xigncode installation have been located and removed from your system!");
        console.log("[xigncode-bypass] Note that some registry keys might still remain on your system.");
        console.log("[xigncode-bypass] Check out https://tinyurl.com/caaliproxy for instructions on manual removal.");
    } catch (e) {
        // Ignore errors...
    }
}