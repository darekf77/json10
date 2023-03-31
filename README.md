# firedev-json (json10)

- Part of [firedev.io](https://github.com/darekf77/
- Helpers for OOP (Object Oriented Programming) in TypeScript.
- JSON10 is a better version of well know JSON.
- Purpose:
  + handle circural references in json objects
  + with JSON10 metadata you can stringify, parse circural objects
  + functionality similar to https://json5.org/, but with option to strinfify again to mix comments/json version

## Usage
- in firedev isomorphic libs/apps or any NodeJS apps/libs:
```ts
import { JSON10 } from 'json10';
```

- in any frontend browser apps (except firedev lib/apps)
```ts
import { JSON10 } from 'json10/browser';
```
  
Use it instead JSON
```ts
JSON10.parse({})
JSON10.stringify({})
```
