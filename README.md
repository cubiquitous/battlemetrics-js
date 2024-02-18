⚠️ **THIS IS A VERY UNSTABLE IMPLEMENTATION DUE TO THE UNSTABILITY OF BATTLEMETRICS ITSELF** ⚠️

this is an implementation of [GnomeSlayer's](https://github.com/Gnomeslayer) [Battlemetrics API wrapper](https://github.com/Gnomeslayer/battlemetrics) written in JS. In general, all implementation was kept the same, with some small differences that will be documented. One of the main differences of mine and Gnome's implementation is that I won't deal with any errors. is up to you, the user to use `try/catch` to deal with erros. I did this because I believe that only you, the end user will know the best way to deal with errors;

# Install

```sh
npm install battlemetrics-wapprer
```

# Usage

You can use as any other js library.

```js
import Battlemetrics from "battlemetrics-wrapper";

const bm = new Battlemetrics("yourToken");

// needs to use an async function.
(async () => {
  try {
    const userInfo = bm.player.info("usernumber"); // needs to be a number not a string
    console.dir(userInfo, { depth: null });
  } catch (err) {
    console.log(userInfo);
  }
})();
```

For your safety I recommend you to use a `.env` file and add to `.gitignore` file so you don't leak your token in case you publish your code online via git. for using `.env`
files is also necessary to install `dotenv` with `npm install dotenv`

```js
import Battlemetrics from "battlemetrics-wrapper";
import { configDotenv } from "dotenv";

configDotenv();

const { TOKEN } = process.env;
const bm = new Battlemetrics(TOKEN);
```

more examples can be found at examples/examples.js

# Types

unfortunately due to health issues I'm only able to working in this project in a slowly pace. that doesn't mean that I'll ignore the project from now on, just that it can take a little while for me to do some things.

when my friend @gnomeslayer invited me to convert his wrapper to JS I thought that it would be a fast project.And usually would be, but due to my health it took way more than I expected. Due to that I decided to release as it is, functional, but with the typing imcomplete. all that it means is that autocomplete won't always show the proper info. the library is working as it is.

# CONTRIBUTING

to contribute to this project you need to:

- first open an issue in the issue tracker.
- ask if you can make a PR if you wish.

That's it. I welcome contributions from the community!

Note: **NO MISPELLING PR WILL BE ACCEPTED**;

# Contact

You can contact me on Discord, simply add me: cubiquitous or, you can join the official Battlemetrics discord and @cubiquitous there.

# Want to support?

This repo will always be free, but if you want to show your support, you can donate to me directly here [![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/cubiquitous)
