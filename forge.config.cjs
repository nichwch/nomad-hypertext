const path = require("path");
const fs = require("node:fs");
const glob = require("glob");
module.exports = {
  packagerConfig: {
    // asar: true,
    osxSign: {}, // object must exist even if empty
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  // plugins: [
  //   {
  //     name: "@electron-forge/plugin-auto-unpack-natives",
  //     config: {},
  //   },
  // ],
  hooks: {
    packageAfterPrune(config, buildPath) {
      if (process.platform === "darwin") {
        const dirs = glob.sync(
          path.join(buildPath, "node_modules/**/node_gyp_bins"),
          {
            onlyDirectories: true,
          }
        );

        for (const directory of dirs) {
          fs.rmdirSync(directory, { recursive: true, force: true });
        }
      }
    },
  },
};
