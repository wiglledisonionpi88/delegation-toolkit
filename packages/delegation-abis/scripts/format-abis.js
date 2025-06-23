const fs = require('fs');
const path = require('path');

// Directory containing the JSON ABI files
const inputDir = './src/raw';
// Output directory for the TypeScript files
const outputDir = './src/formatted';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Export ts in an index file
function addExportToIndexFile(fileName) {
  const indexStream = fs.createWriteStream('./src/index.ts', {
    flags: 'a',
  });

  indexStream.write(`export * as ${fileName} from './formatted/${fileName}'\n`);

  indexStream.end();
}

// Recursive function to process files and directories
function processDirectory(directory) {
  fs.readdir(directory, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    const ignoreList = ['utils', 'build-info'];
    entries.forEach((entry) => {
      if (!ignoreList.includes(path.basename(directory))) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          // Recurse into subdirectories
          processDirectory(fullPath);
        } else if (path.extname(entry.name) === '.json') {
          // Process JSON files
          processFile(fullPath, entry.name);
        }
      }
    });
  });
}

// Function to process each JSON file
function processFile(filePath, fileName) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${fileName}:`, err);
      return;
    }

    try {
      const abi = JSON.parse(data);
      const tsContent = `export const abi = ${JSON.stringify(
        abi.abi,
        null,
        2,
      )} as const;\n

export const bytecode = \"${abi.bytecode.object}\" as const;`;
      const outputFilePath = path.join(
        outputDir,
        `${path.basename(fileName, '.json')}.ts`,
      );

      fs.writeFile(outputFilePath, tsContent, (err) => {
        if (err) {
          console.error(`Error writing TypeScript file for ${fileName}:`, err);
        } else {
          console.log(
            `TypeScript file generated for ${fileName}: ${outputFilePath}`,
          );
          addExportToIndexFile(path.basename(fileName, '.json'));
        }
      });
    } catch (parseError) {
      console.error(`Error parsing JSON from ${fileName}:`, parseError);
    }
  });
}

// Start processing from the input directory
processDirectory(inputDir);
