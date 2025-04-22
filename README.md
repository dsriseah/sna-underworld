# sna-underworld
submission for New JAMshire 2024

UPDATE: This release uses the public release of [URSYS](https://github.com/dsriseah/ursys/) version 2025-0422, and no longer needs to live inside an URSYS framework to run.

## QUICK START

_tested under MacOS terminal_

> [!WARNING]
> This codebase was designed to work with Visual Studio Code and [Node Version Manager](https://github.com/nvm-sh/nvm) (nvm). For more details about my preferred setup, see the [URSYS installation](https://github.com/dsriseah/ursys/wiki/Installation) page. 

**First Time Setup**
```
cd <your_dev_directory>
git clone https://github.com/dsriseah/sna-underworld.git
cd sna-underworld
nvm install
nvm use
npm ci
```

**Run the Game Server**
```
npm run dev
```
After that, browse to `http://localhost:8080` and explore. Open the Javascript console for debug messages. NOTE: The console is formatted for Chrome-based browsers and may look weird on Firefox or Safari.

## POKING AROUND

This codebase is written largely in Typescript, and should run on any unix-like system. I'm using MacOS, but it should work without problems on Linux and Windows WSL if you have the required development tools installed: `git`, `nvm`. 

The source files are in `app-source`. Top-level files are used as entry points for the bundler (esbuild). In this release, there are:
- `game-boot.ts` - The client-side app which imports modules in the `client` subdirectory. 
- `server.mts` - a stub server extension (just there for show)

The `client` directory has the game logic. It runs entirely on the client currently with no server synchronization.
- `client/game-launch.ts` - The game component loader that selects what modules to run. It also starts the game.
- `client/game-mcp.ts` - A rudimentary game loop controller.
- `client/game-state.ts` - A rudimentary shared game state object.

SNA has a rudimentary component system made of modules that self-initialize according to an internal lifecycle, and these are loaded by `client/game-launch.ts`. The stub components themselves are stubbed-out in the `client` directory, including typical game engine modules.

There are various "games" in the `client/games` directory which were used for staged development during the week-long game jam. The `game-launch.ts` file specifies which game is loaded through the import of `GAME` at the top.
