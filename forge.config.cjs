const path = require("path");
const fs = require("node:fs/promises");
module.exports = {
  packagerConfig: {
    asar: true,
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
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
  // hooks: {
  //   packageAfterPrune: async (_config, buildPath) => {
  //     const gypPath = path.join(
  //       buildPath,
  //       "node_modules",
  //       "../../../../../../../../../../../../../usr/local/Cellar/python@3.11/3.11.5/Frameworks/Python.framework/Versions/3.11/bin/python3.11",
  //       "build",
  //       "node_gyp_bins"
  //     );
  //     await fs.rm(gypPath, { recursive: true, force: true });
  //   },
  // },
};
