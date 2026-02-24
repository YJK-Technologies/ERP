const AdmZip = require("adm-zip");
const fs = require("fs");

const zipFile = (inputFilePath) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(inputFilePath)) {
        return reject(`❌ File not found: ${inputFilePath}`);
      }

      const zip = new AdmZip();
      const outputPath = inputFilePath.replace(".pdf", ".zip");

      zip.addLocalFile(inputFilePath);
      zip.writeZip(outputPath);

      resolve(outputPath);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = zipFile;
