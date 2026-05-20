import cluster from 'cluster';
import os from 'os';

const WORKERS = process.env.WEB_CONCURRENCY
  ? parseInt(process.env.WEB_CONCURRENCY)
  : Math.max(2, os.cpus().length);

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} starting ${WORKERS} workers`);
  for (let i = 0; i < WORKERS; i++) cluster.fork();
  cluster.on('exit', (worker, code) => {
    console.log(`Worker ${worker.process.pid} died (${code}), restarting...`);
    cluster.fork();
  });
} else {
  require('./server');
}
