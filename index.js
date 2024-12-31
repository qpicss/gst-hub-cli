#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import figlet from "figlet";
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const tokenStoragePath = 'jwtStorage.enc';
const encryptionKey = crypto.randomBytes(32); // Example key, replace with a secure key
const iv = crypto.randomBytes(16); //
//console.log(process.argv);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
let test = process.argv;
//console.log(chalk.yellow(figlet.textSync("GST-HUB CLI", { horizontalLayout: "full" }))  );
var auth;
async function saveEncryptedToken(token) {
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Store the IV and encrypted token
  const data = { iv: iv.toString('hex'), token: encrypted };
  fs.writeFileSync(tokenStoragePath, JSON.stringify(data), 'utf8');
  console.log("Token encrypted and saved.");
}

// Function to read and decrypt the token
async function readEncryptedToken() {
  if (fs.existsSync(tokenStoragePath)) {
    const data = JSON.parse(fs.readFileSync(tokenStoragePath, 'utf8'));
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(data.iv, 'hex'));
    let decrypted = decipher.update(data.token, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  return null;
}

// Example usage

program
  .version("1.0.0")
  .description("GST-HUB CLIZ")
  .option("-i ", "Int")
  .option("-new  -p <Name> ", "New")
  .option("-c --clone -t <Name>", "Clone")
  .action((options) => {
    console.log(chalk.blue(`Cloning OpenAPI, ${options.OpenAPI}!`));
    console.log(chalk.green(`Cloning OperationId, ${options.OperationId}!`));
    console.log(chalk.red(`Cloning Schema, ${options.Schema}!`));
  });
//console.log(test);
if (test[2] && (test[2].includes('--') || test[2].includes('-'))) {
  if (test[2] === '-token' || test[2] === '-login') {
    switch (test[2]) {
      case '-token':
        if (test[2] === '-token' && test[3]) { // Ensure the token is provided
          const token = test[3];
          try {
            const token = test[3]; // Assuming the token is passed as the third argument
            if (token) {
              try {
                const decoded = jwt.decode(token);
                console.log("Token received:", token);
                console.log("Decoded token:", decoded);

                // Encrypt and save the token
                saveEncryptedToken(token);
              } catch (error) {
                console.log("Failed to decode token:", error.message);
              }
            } else {
              console.log("No token provided.");
            }
            const storedToken = await readEncryptedToken();
            if (storedToken) {
              console.log("Stored token:");
              const decoded = jwt.decode(storedToken);

              console.log("Decoded token:", decoded);
            } else {
              console.log("No token found in storage.");
            }

            // Handle token logic here
          } catch (error) {
            console.log("Failed to decode token:", error.message);
            // Handle decoding error
          }
        } else {
          console.log("No token provided.");
          // Handle missing token case
        }
        break;
      case '-login':
        console.log('2');
        break;
    }
  }
  if (auth) {
    switch (test[2]) {
      case '-i':
        console.log('1');
        showInteractive();
        break;
      case '-new':
        console.log('2');
        showInteractive();
        break;
      case '-c':
      case '--clone':
        console.log('3');
        showInteractive();
        break;
      case '-s':
      case '--status':
        console.log('4');
        showInteractive();
        break;
      case '-list':
        console.log('5');
        showInteractive();
        break;
      case '-env':
        console.log('6');
        showInteractive();
        break;
      default:
        console.log('7');
        showinHelp()
        break;
    }

  }
  else {
    showAuthHelp()


  }
}
else {
  showinHelp()
}

async function showAuthHelp() {
  inquirer
    .prompt([
      {
        type: "text",
        name: "Text",
        message: "No authorization was found: \n\tRun  gst -token {{token}} or gst -login -u {{user}} -p {{password}}\n Press any key to continue...",

      },
    ]).then((result) => {
      const input = result.Text.trim();

      if (input.startsWith("gst -token")) {
        const token = input.split(" ")[2];
        if (token) {
          try {
            const decoded = jwt.decode(token);
            console.log("Token received:", token);
            console.log("Decoded token:", decoded);
            // Handle token logic here
          } catch (error) {
            console.log("Failed to decode token:", error.message);
            // Handle decoding error
          }
        } else {
          console.log("No token provided.");
          // Handle missing token case
        }
      } else if (input.startsWith("gst -login")) {
        const parts = input.split(" ");
        const userIndex = parts.indexOf("-u");
        const passIndex = parts.indexOf("-p");

        if (userIndex !== -1 && passIndex !== -1 && parts[userIndex + 1] && parts[passIndex + 1]) {
          const user = parts[userIndex + 1];
          const password = parts[passIndex + 1];
          console.log("User and password received:", user, password);
          // Handle login logic here
        } else {
          console.log("Incomplete login credentials.");
          // Handle missing user or password case
        }
      } else {
        console.log("Invalid input format.");
        // Handle invalid input format
      }
    });


}
function showinHelp() {
  program.action(() => {
    inquirer
      .prompt([
        {
          type: "text",
          name: "Text",
          message: "For interactive menu: \n\tRun  gst -i or gst -h for cli help\n Press any key to continue...",

        },
      ]).then((result) => {

      });
  });
  program.parse();
}
async function showInteractive() {
  const pathToFileOrDir = './AppDeployment';

  // Check if the file or directory exists synchronously
  if (fs.existsSync(pathToFileOrDir)) {
    // console.log(`The file or directory at '${pathToFileOrDir}' exists.`);
    var menu = ["Clone Options", "Env"];
  } else {
    //console.log(`The file or directory at '${pathToFileOrDir}' does not exist.`);
    var menu = ["New Project", "Clone Options"];
  }
  program.action(async () => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message: "Options:",
          choices: menu,
        },
      ])
      .then((result) => {
        // console.log(result)
        if (result.choice == "New Project")
          program.action(() => {
            inquirer
              .prompt([
                {
                  type: "input",
                  name: "name",
                  message: "Project Name",

                },
              ])
              .then((pname) => {

                if (!fs.existsSync(pathToFileOrDir)) {
                  // if (fs.existsSync('./AppDeployment')) {
                  program.action(() => {
                    inquirer
                      .prompt([
                        {
                          type: "list",
                          name: "name",
                          message: "Deployment type",
                          choices: ["NodeJs", "External Provider"],
                        },
                      ])
                      .then((answers) => {
                        console.log(chalk.green(`Create New Project... ,${pname.name}// ${answers.name}!`));
                        var link = 'https://github.com/GST-hub-Admin/AppDeployment.git';
                        exec(`git clone ${link}`, (err, stdout, stderr) => {
                          if (err) {
                            // node couldn't execute the command
                            return;
                          }
                          exec(`cd /AppDeployment && npm install`, (err, stdout, stderr) => {
                            if (err) {
                              // node couldn't execute the command
                              return;
                            }

                            // the *entire* stdout and stderr (buffered)
                            console.log(`stdout: ${stdout}`);
                            console.log(`stderr: ${stderr}`);
                            console.log(`Done.`);
                            return;
                          });
                          // the *entire* stdout and stderr (buffered)
                          console.log(`stdout: ${stdout}`);
                          console.log(`stderr: ${stderr}`);
                          console.log(`Done.`);
                          return;
                        });
                      });
                  });
                }
                else {
                  program.action(() => {
                    inquirer
                      .prompt([
                        {
                          type: "text",
                          name: "Text",
                          message: "Create new project or run in an existing project directory",

                        },
                      ]).then((result) => {

                      });
                  });
                  program.parse();
                }

                program.parse();
              });
          });
        if (result.choice == "Clone Options")
          program.action(() => {
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "name",
                  message: "Repo type:",
                  choices: ["gst", "git"],
                },
              ])
              .then((answers) => {
                if (answers.name == 'git')
                  program.action(() => {
                    inquirer
                      .prompt([
                        {
                          type: "input",
                          name: "name",
                          message: "Artifact Repo Link:",
                        },
                      ])
                      .then((answers) => {
                        console.log(chalk.green(`Cloning..., ${answers.name}!`));

                        var link = answers.name;
                        var comm;
                        if (fs.existsSync('./git')) {
                          console.log('exists')
                          comm = `cd ./git && git clone ${link}`;
                        }
                        else {

                          console.log('NOT exists')
                          comm = `mkdir git && cd ./git && git clone ${link}`;
                        }
                        exec(comm, (err, stdout, stderr) => {
                          if (err) {
                            // node couldn't execute the command
                            return;
                          }

                          // the *entire* stdout and stderr (buffered)
                          // console.log(`stdout: ${stdout}`);
                          console.log(`stderr: ${stderr}`);
                          console.log(`Done`);
                          return;
                        });
                        return;

                      });
                  });


                if (answers.name == 'gst')
                  program.action(() => {
                    inquirer
                      .prompt([
                        {
                          type: "input",
                          name: "name",
                          message: "Artifact Name and Version:",
                        },
                      ])
                      .then((answers) => {
                        console.log(chalk.green(`Hey there, ${answers.name}!`));
                      });
                  });
                program.parse();
              });
          });
        if (result.choice == "Env")
          program.action(() => {
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "name",
                  message: "Repo type:",
                  choices: ["start", "stop", "update", "status", 'purge'],
                },
              ])
              .then((answers) => {
                if (answers.name == 'start') {

                  console.log(chalk.green(`Starting Docker..., Run!`));

                  exec(`cd ./AppDeployment/server && docker-compose -f docker-compose.yaml up`, (err, stdout, stderr) => {
                    if (err) {
                      console.log(`stderr: ${err}`);
                      console.log(`Done`);
                      // node couldn't execute the command
                      return;
                    }


                    return;
                  });

                }
                if (answers.name == 'purge') {
                  //docker stop $(docker ps -a -q)

                  console.log(chalk.green(`Starting Docker..., Run!`));

                  exec("docker stop $(docker ps) && docker rm $(docker ps)", (err, stdout, stderr) => {
                    if (err) {
                      console.log(`stderr: ${err}`);
                      console.log(`Done`);
                      // node couldn't execute the command
                      return;
                    }

                    // the *entire* stdout and stderr (buffered)
                    // console.log(`stdout: ${stdout}`);
                    console.log(`out: ${stdout}`);
                    console.log(`Done`);
                    return;
                  });
                }

                if (answers.name == 'stop') {
                  //docker stop $(docker ps -a -q)

                  console.log(chalk.green(`Starting Docker..., Run!`));

                  exec("docker stop $(docker ps)", (err, stdout, stderr) => {
                    if (err) {
                      console.log(`stderr: ${err}`);
                      console.log(`Done`);
                      // node couldn't execute the command
                      return;
                    }

                    // the *entire* stdout and stderr (buffered)
                    // console.log(`stdout: ${stdout}`);
                    console.log(`out: ${stdout}`);
                    console.log(`Done`);
                    return;
                  });
                }
                if (answers.name == 'status') {
                  console.log(chalk.green(`Starting Docker..., Run!`));

                  exec(`docker images`, (err, stdout, stderr) => {
                    if (err) {
                      console.log(`stderr: ${err}`);
                      console.log(`Done`);
                      // node couldn't execute the command
                      return;
                    }

                    // the *entire* stdout and stderr (buffered)
                    // console.log(`stdout: ${stdout}`);
                    console.log(`Out: ${stdout}`);
                    console.log(`Done`);

                  });
                }
                if (answers.name == 'update')
                  program.action(() => {
                    inquirer
                      .prompt([
                        {
                          type: "list",
                          name: "name",
                          message: "Repo type:",
                          choices: ["gst", "git"],
                        },
                      ])
                      .then((answers) => {
                        if (answers.name == 'git') {
                          //compare folders
                          moveJsonFilesToCommonDirectory('./git', './AppDeployment/resources', { recursive: true });


                        }

                        if (answers.name == 'gst')
                          program.action(() => {
                            inquirer
                              .prompt([
                                {
                                  type: "input",
                                  name: "name",
                                  message: "Artifact Name and Version:",
                                },
                              ])
                              .then((answers) => {
                                console.log(chalk.green(`Hey there, ${answers.name}!`));
                              });
                          });
                        program.parse();
                      });
                  });
                program.parse();
              });
            return;
          });
        program.parse();
      });
  });

  /**/
  program.parse(process.argv);
}

async function moveJsonFilesToCommonDirectory(sourceDir, targetDir) {
  try {
    // Ensure the target directory exists
    await mkdir(targetDir, { recursive: true });

    // Get all entries (files and directories) in the source directory
    const entries = await readdir(sourceDir);

    // Loop through each entry in the source directory
    for (const entry of entries) {
      const entryPath = path.join(sourceDir, entry);

      // Check if the entry is a directory
      const entryStat = await stat(entryPath);
      if (entryStat.isDirectory()) {
        // Read files in the subdirectory
        const files = await readdir(entryPath);

        // Filter and move only .json files to the target directory
        for (const file of files) {
          if (path.extname(file) === '.json') {
            const oldPath = path.join(entryPath, file);
            const newPath = path.join(targetDir, file);

            // Move the .json file to the target directory
            await rename(oldPath, newPath);
            console.log(`Moved ${file} to ${targetDir}`);
            console.log(`OK`);


          }


        }
        exec(`cd AppDeployment && npm install && node generate.js`, (err, stdout, stderr) => {


          if (err) {
            console.log(err);
            return;
          }
          /*exec(`npm install`, (err, stdout, stderr) => {


                      if (err) {
                        console.log(err);
                        return;
                      }
                    exec(`node generate.js`, (err, stdout, stderr) => {


                      if (err) {
                        console.log(err);
                        return;
                      }
                    
                      // the *entire* stdout and stderr (buffered)
                     // console.log(`stdout: ${stdout}`);
                      console.log(`stderr: ${stderr}`);
                      console.log(`Done`);
                      return;
                    });
                      // the *entire* stdout and stderr (buffered)
                     // console.log(`stdout: ${stdout}`);
                      console.log(`stderr: ${stderr}`);
                      console.log(`Done`);
                      return;
                    });*/

          // the *entire* stdout and stderr (buffered)
          // console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          console.log(`Done`);
          return;
        });
      }
    }
  } catch (error) {
    console.error("Error moving JSON files:", error);
  }
}
