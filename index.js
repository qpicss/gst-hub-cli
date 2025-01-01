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
import axios from 'axios';
import { spawn } from 'child_process';
const tokenStoragePath = 'jwtStorage.enc';
const encryptionKey = Buffer.from('46e57e8f7d58de59b4fc8c1843705c0134168a984826f53a26d12dae75280914', 'hex');
//console.log(encryptionKey.toString('hex')); // Example key, replace with a secure key
const iv = crypto.randomBytes(16); //
//console.log(process.argv);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
let test = process.argv;
//console.log(chalk.yellow(figlet.textSync("GST-HUB CLI", { horizontalLayout: "full" }))  );

async function saveEncryptedToken(token) {
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Store the IV and encrypted token
  const data = { iv: iv.toString('hex'), token: encrypted };
  fs.writeFileSync(tokenStoragePath, JSON.stringify(data), 'utf8');
  console.log("Token encrypted and saved.");
}
async function cloneGitRepo(repoUrl) {
 // console.log(chalk.green(`Cloning..., ${repoUrl}!`));
  var link = repoUrl;
  var comm;
  if (fs.existsSync('./git')) {
 //   console.log('exists')
    comm = `cd ./git && git clone ${link}`;
  }
  else {
 //   console.log('NOT exists')
    comm = `mkdir git && cd ./git && git clone ${link}`;
  }
  exec(comm, (err, stdout, stderr) => {
    if (err) {
      return;
    }
  });
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
async function getAuthToken() {
  const storedToken = await readEncryptedToken();
  if (storedToken) {
 //   console.log("Stored token:");
    const decoded = jwt.decode(storedToken);
  //  console.log("Decoded token:", decoded);
    return storedToken;
  } else {
    return false;
  }
}
  async function startEnvironment() {
    // Implementation for starting the environment
  //  console.log(chalk.green(`Starting Docker..., Run!`));

  try {
    const process = spawn('docker-compose', ['-f', 'docker-compose.yaml', 'up'], {
      cwd: './AppDeployment/server',
      detached: true,
      stdio: 'ignore'
    });

    process.unref(); // Allow the process to continue running independently

    console.log('Environment started successfully.');
  } catch (err) {
    console.log(`Error starting environment: ${err.message}`);
  }
  }

  async function stopEnvironment() {
    // Implementation for stopping the environment
    exec('docker ps -a -q', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting container names: ${error.message}`);
        return;
      }
      const containerIds = stdout.trim().split('\n');
      if (containerIds.length === 0) {
        console.log('No containers to stop.');
        return;
      }
      exec(`docker stop ${containerIds.join(' ')}`, (stopError, stopStdout, stopStderr) => {
        if (stopError) {
          console.error(`Error stopping environment: ${stopError.message}`);
          return;
        }
        console.log(`Environment stopped successfully: ${stopStdout}`);
      });
    });
  }

  async function updateEnvironment() {
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
  return;
  }

  async function checkEnvironmentStatus() {
    // Implementation for checking the environment status
    exec('docker ps', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error checking environment status: ${error.message}`);
        return;
      }
  
      // Split stdout into lines and print each line
      stdout.split('\n').forEach((line) => {
        if (line.trim()) { // Check if the line is not empty
          console.log(`stdout: ${line}`);
        }
      });
  
      // Split stderr into lines and print each line
      stderr.split('\n').forEach((line) => {
        if (line.trim()) { // Check if the line is not empty
          console.error(`stderr: ${line}`);
        }
      });
    });
  }

  async function purgeEnvironment() {
    // Implementation for purging the environment
    exec('docker ps -a --format "{{.Names}}"', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting container names: ${error.message}`);
        return;
      }

      const containerNames = stdout.split('\n').filter(name => name.trim() !== '');
      if (containerNames.length === 0) {
        console.log('No containers to purge.');
        return;
      }

      containerNames.forEach(name => {
        exec(`docker stop ${name} && docker rm ${name}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error purging container ${name}: ${error.message}`);
            return;
          }
          console.log(`Container ${name} purged successfully: ${stdout}`);
        });
      });
    });
  }

  async function cloneGstRepo(servicePath) {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.log("No valid authentication token found");
        await showAuthHelp();
        return;
      }
      
      const url = servicePath;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `jwt ${token}`
        }
      });

      if (response.status === 200) {
        console.log("Successfully retrieved service data");
        // Write response data to file
        const operationId = response.data.operationId || 'default';
        const outputDir = './gst';
        
        // Create operations directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir);
        }

        // Write data to JSON file named after operationId
        const outputPath = path.join(outputDir, `${operationId}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
        console.log(`Wrote data to ${outputPath}`);
        return response.data;
      } else {
        console.log(`Failed to retrieve service data: ${response.statusText}`);
      }

    } catch (error) {
      if (error.response) {
        // Server responded with error
        console.log(`Error: ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        // Request made but no response
        console.log("Error: No response received from server");
      } else {
        // Error setting up request
        console.log(`Error: ${error.message}`);
      }
    }
  }


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

          try {
            const token = test[3]; // Assuming the token is passed as the third argument
            if (token) {
              try {
                const decoded = jwt.decode(token, { complete: true });

                if (decoded) {
                  const currentTime = Math.floor(Date.now() / 1000);
                  if (decoded.payload.exp && decoded.payload.exp < currentTime) {
                    console.log("Token is expired.");
                   
                  }
                  else{
                    await saveEncryptedToken(token);
                    console.log("Token is valid and saved.");
                  }
                }
                else{
                  await saveEncryptedToken(token);
                    console.log("Token is not a valid  JWT.");
                }
               
              }  catch (error) {
                console.log("Failed to decode token:", error.message);
              }
            } else {
              console.log("No token provided.");
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
        if (test[3] === '-u' && test[5] === '-p' && test[4] && test[6]) {
          const username = test[4];
          const password = test[6];
          try {
            const response = await axios({
              method: 'post',
              url: 'https://gst-hub.com/token',
              auth: {
                username: username,
                password: password
              },
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.data && response.data.token) {
              await saveEncryptedToken(response.data.token);
              console.log(chalk.green("Successfully logged in and saved token."));
            } else {
              console.log(chalk.red("Invalid response from server - no token received."));
            }
          } catch (error) {
            console.log(chalk.red("Login failed:"), error.response?.data?.message || error.message);
          }
        } else {
          console.log(chalk.yellow("Usage: gst -login -u <username> -p <password>"));
        }
        break;
    }
  } else {
    /// console.log(await getAuthToken());
    if (await getAuthToken()) {
      switch (test[2]) {
        case '-i':
       //  console.log('1');
          showInteractive();
          break;
        case '-new':
          if (test[3]) {
            newProject(test[3]);
          } else {
            console.log(chalk.red("Error: No project name provided"));
          }
         
          break;
        case '-c':
        case '--clone':
          if (test[3] === 'git') {
            if (test[4]) {

              cloneGitRepo(test[4]);
            } else {
              console.log(chalk.red("Error: No git repository URL provided"));
            }
          } else if (test[3] === 'gst') {
            if (test[4]) {
              console.log(chalk.green(`Cloning GST repository..., ${test[4]}!`));
              cloneGstRepo(test[4]);
            } else {
              console.log(chalk.red("Error: No GST repository name provided")); 
            }
          }
          break;
        case '-list':
          console.log('5');
          showInteractive();
          break;
        case '-env':
          if (test[3]) {
            switch (test[3]) {
              case 'start':
                await startEnvironment();
                break;
              case 'stop':
                await stopEnvironment();
                break;
              case 'update':
                await updateEnvironment();
                break;
              case 'status':
                await checkEnvironmentStatus();
                break;
              case 'purge':
                await purgeEnvironment();
                break;
              default:
                console.log(chalk.red("Error: Invalid environment command"));
                break;
            }
          } else {
            console.log(chalk.red("Error: No environment command provided"));
          }
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

}
else {
  showinHelp()
}
async function newProject(projectName) {
  {
    if (fs.existsSync('AppDeployment')) {
      console.log(chalk.yellow('Project already exists in directory'));
      return;
    }
    else{
      console.log(chalk.green(`Create New Project... ,// ${projectName}!`));
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
    }
    
  }
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
                        newProject(answers.name);
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
                        return;
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
                        cloneGitRepo(answers.name);
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
                  startEnvironment();
                    return;
                  }
                if (answers.name == 'purge') {
                  //docker stop $(docker ps -a -q)
                  purgeEnvironment();
                  return;
                }
                if (answers.name == 'stop') {
                  stopEnvironment();
                  return;
                }
                if (answers.name == 'status') {
                  checkEnvironmentStatus();
                  return;
                }
                if (answers.name == 'update')
                {
                  updateEnvironment();
                  return; 
                }

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
