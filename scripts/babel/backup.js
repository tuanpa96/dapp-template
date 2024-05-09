/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs").promises;
const path = require("path");

async function renameBabelFileToBackup() {
  const projectRoot = path.join(__dirname, "../..");
  const babelRcPath = path.join(projectRoot, ".babelrc.js");
  const babelBackupPath = path.join(projectRoot, ".babel_");

  try {
    const babelRcExits = await fs
      .access(babelRcPath)
      .then(() => true)
      .catch(() => false);

    if (babelRcExits) {
      await fs.rename(babelRcPath, babelBackupPath);
    }
  } catch (e) {
    console.error("Error renaming .babelrc.js to .babel_: ", e);
  }
}

renameBabelFileToBackup();
