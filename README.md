# enw

[![npm](https://img.shields.io/npm/v/enw.svg?style=flat-square)](https://www.npmjs.com/package/enw)

Reusable environment variable validator.

> Full docs is coming soon...

## Installation

```bash
$ npm install enw
```

## Usage

### In a Reusable Module

```typescript
// src/index.ts

export * from './types';
export { default as readEnv } from './read-env';
```

```typescript
// src/types.ts

export interface Config {
  host: string;
  port: number;
}
```

```typescript
// src/read-env.ts

import * as enw from 'enw';
import { Config } from './types';

function readEnv(prefix: string = 'DB'): enw.ReadFn<Config> {
  return enw.scope(prefix, {
    host: enw.host('HOST', 'localhost'),
    port: enw.port('PORT', 5432),
  });
}
```

### In an Application

```typescript
// src/app.ts

import getConfig from './get-config';

const config = getConfig('APP_NAME', process.env);
```

```typescript
// src/types.ts

import { Config as Db } from 'reusable-database-module';

export interface Config {
  db: Db;
}
```

```typescript
// src/get-config.ts

import * as enw from 'enw';
import { readEnv as db } from 'reusable-database-module';
import { Config } from './types';

export default function getConfig(prefix: string, env: NodeJS.ProcessEnv): Config {
  const readEnv = enw.scope(prefix, {
    db: db(),
  });
  const config = readEnv(env);
  
  return config;
}
```
