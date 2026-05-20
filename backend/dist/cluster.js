"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const WORKERS = process.env.WEB_CONCURRENCY
    ? parseInt(process.env.WEB_CONCURRENCY)
    : Math.max(2, os_1.default.cpus().length);
if (cluster_1.default.isPrimary) {
    console.log(`Master ${process.pid} starting ${WORKERS} workers`);
    for (let i = 0; i < WORKERS; i++)
        cluster_1.default.fork();
    cluster_1.default.on('exit', (worker, code) => {
        console.log(`Worker ${worker.process.pid} died (${code}), restarting...`);
        cluster_1.default.fork();
    });
}
else {
    require('./server');
}
