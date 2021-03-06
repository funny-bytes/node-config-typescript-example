# Using `node-config` with TypeScript

When we migrated one of our projects from ES6 to TypeScript, we discovered something really crazy: the *heap memory* it allocated increased by factor 20. We found out that [node-config](https://github.com/lorenwest/node-config) was the reason.

I should mention that we have a *backend Node application*, written in TypeScript, compiled to `./build`, started with `node build/src/index.js`, dockerized and deployed to k8s -- and, it is using [node-config](https://github.com/lorenwest/node-config).

[node-config](https://github.com/lorenwest/node-config) is a handy library used by many projects. It provides hierarchical, environment-sensitive (`NODE_ENV`) configuration for your application. All configuration files are maintained in a config directory `./config`. Very nice.

If you are using TypeScript, you usually compile to something like `./build` or `./dist` and run your application from there. The funny thing about [node-config](https://github.com/lorenwest/node-config) is that it still reads the configuration files from `./config` (by default), even if there is something like `./build/config`.

Furthermore, if the config directory contains `.ts` files, [node-config](https://github.com/lorenwest/node-config) will compile them on-the-fly. That's great during development. But not so great in production.

Try it yourself. I have set up a minimal project as a showcase.

```bash
// prepare
$ npm ci
$ npm build

$ npm run start:bad
> node build/src/index.js

foo = bar
heapUsed = 68,912,656 [byte]
startup time = 985 [ms]

$ npm run start:good
> NODE_CONFIG_DIR=./build/config node build/src/index.js

foo = bar
heapUsed = 3,298,992 [byte]
startup time = 14 [ms]
```

How did we solve the problem?

* Simply compile `./config` to `./build/config` along with the rest of the TypeScript code which goes to `./build/src`.
* Make sure that [node-config](https://github.com/lorenwest/node-config) reads the configs from the compiled version `./build/config` by setting the `NODE_CONFIG_DIR` environment variable.
* Post-process all compiled `.js` files in `./build/config` to make them work with [node-config](https://github.com/lorenwest/node-config) because it doesn't parse `exports.default` as generated by tsc. Replace it with `module.exports`. Feels hacky, yes. But I have seen other projects doing a bit of post-processing after tsc.

I'm sure there are other solutions. Please let me know.

Maybe it helps.
