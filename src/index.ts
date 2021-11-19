const time0 = Date.now();

import config from 'config';

const foo = config.get<string>('foo');
console.log(`foo = ${foo}`);

const time1 = Date.now();

console.log(`heapUsed = ${(process.memoryUsage().heapUsed).toLocaleString()} [byte]`);
console.log(`startup time = ${time1 - time0} [ms]`);
