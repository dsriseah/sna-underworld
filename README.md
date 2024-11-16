# jamshire-underworld
submission for New JAMshire 2024

This repo is designed to live in a directory called `sna-underworld` that is inside an unreleased version of the [URSYS](https://github.com/dsriseah/ursys/) monorepo, which is what is providing the `@ursys/core` package through a `file:` URL in `package.json`. Eventually URSYS will be stable and made available as a library.

### BUILD INSTRUCTIONS FOR THE BRAVE 

_tested under MacOS terminal_

> [!WARNING]
>  You must have node version manager (nvm) and Xcode Command Line Utilities installed. See [URSYS installation](https://github.com/dsriseah/ursys/wiki/Installation) for details.

Open terminal and then...
```
cd <your_dev_directory>

git clone https://github.com/dsriseah/ursys.git
npm ci

cd ursys
git clone https://github.com/dsriseah/jamshire-underworld.git sna-jamshire
cd sna-jamshire
npm ci
npm run dev
```
