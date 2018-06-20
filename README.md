
# Jhora

Jhora means bag, this is a banking desktop app built using github's electron, nodejs, angularjs, sqlite3. It records Cr, Dr transections and generates reports based on records. This is built for educational purpose.

Truly tiny desktop app which can be used for educational purpose that included SQLite support. See the [blog post](http://blog.arrayofbytes.co.uk/?p=379) for more.

```
git clone https://github.com/optimistanoop/jhora.git
cd jhora
npm install
npm start
```

## To install dependency packages in windows OS

`npm i -g windows-build-tools`

## After that (if required)

`npm i sqlite3 --build-from-source`

## Building a release package

Releases can only be built on the target platform.

`npm run release`

## DB path

Windows -  `C:\Users\Administrator\AppData\Roaming\db.db`

Mac -  `/Users/<USER_NAME>/Library/Application Support/db.db`

Linux -  `/home/<USER_NAME>/.config/db.db`

## Using native modules

If you wish to use native modules, you must run `npm run postinstall` after first install of the module.

## Thanks to...

* Built on top of: https://github.com/sjmelia/electron-boilerplate-sqlite
* Primary inspiration: https://github.com/szwacz/electron-boilerplate
* SQLite JS: https://github.com/bytheway/electron-sqlite3/

