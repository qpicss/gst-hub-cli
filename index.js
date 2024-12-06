#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import figlet from "figlet";
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
//console.log(process.argv);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
let test = process.argv; 
console.log(chalk.yellow(figlet.textSync("GST-HUB CLI", { horizontalLayout: "full" }))  );
var auth =true;
program
.version("1.0.0")
.description("GST-HUB CLI")
.option("-i ", "Int")
.option("-new  -p <Name> ", "New")
.option("-c --clone -t <Name>", "Clone")
.action((options) => {
  console.log(chalk.blue(`Cloning OpenAPI, ${options.OpenAPI}!`));
  console.log(chalk.green(`Cloning OperationId, ${options.OperationId}!`));
  console.log(chalk.red(`Cloning Schema, ${options.Schema}!`));
});
//console.log(test);
if(auth)
{

  if(test[2] && (test[2].includes('--')||test[2].includes('-')))
    {
      switch (test[2])
      {
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
    else
    {
      showinHelp()
      
     
    }
}
else
{
  showAuthHelp()
}

function showAuthHelp()
{

    inquirer
      .prompt([
        {
          type: "text",
          name: "Text",
          message: "No authorization was found: \n\tRun  gst -token {{token}} or gst -login -u {{user}} -p {{password}}\n Press any key to continue...",
          
        },
      ]).then((result) => {
        
      });


}
function showinHelp()
{
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
function showInteractive()
{
     program.action(() => {
        inquirer
          .prompt([
            {
              type: "list",
              name: "choice",
              message: "Options:",
              choices: ["New Project", "Clone Options", "Env"],
            },
          ])
          .then((result) => {
           // console.log(result)
            if(result.choice == "New Project")
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

                    if (!fs.existsSync('C:\\Users\\nulll\\Desktop\\Finace\\gst-hub\\gst-hub-cli\\AppDeployment')) {
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
                            
                              // the *entire* stdout and stderr (buffered)
                              console.log(`stdout: ${stdout}`);
                              console.log(`stderr: ${stderr}`);
                              console.log(`Done.`);
                            });
                          });
                      });
                  }
                  else
                  {
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
            if(result.choice == "Clone Options")
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
                      if(answers.name=='git')
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
                            exec(`cd ./git && git clone ${link}`, (err, stdout, stderr) => {
                              if (err) {
                                // node couldn't execute the command
                                return;
                              }
                            
                              // the *entire* stdout and stderr (buffered)
                             // console.log(`stdout: ${stdout}`);
                              console.log(`stderr: ${stderr}`);
                              console.log(`Done`);
                            });

                          });
                      });
                    
                    
                      if(answers.name=='gst')
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
            if(result.choice == "Env")
              program.action(() => {
                  inquirer
                    .prompt([
                      {
                        type: "list",
                        name: "name",
                        message: "Repo type:",
                        choices: ["start", "stop", "update"],
                      },
                    ])
                    .then((answers) => {
                      if(answers.name=='start')
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
                            exec(`git clone ${link}`, (err, stdout, stderr) => {
                              if (err) {
                                console.log(`stderr: ${err}`);
                              console.log(`Done`);
                                // node couldn't execute the command
                                return;
                              }
                            
                              // the *entire* stdout and stderr (buffered)
                              // console.log(`stdout: ${stdout}`);
                              console.log(`stderr: ${stderr}`);
                              console.log(`Done`);
                            });

                          });
                      });
                      if(answers.name=='stop')
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
                    
                      if(answers.name=='update')
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
                              if(answers.name=='git')
                              {
                                //compare folders
                                moveJsonFilesToCommonDirectory('C:\\Users\\nulll\\Desktop\\Finace\\gst-hub\\gst-hub-cli\\git', 'C:\\Users\\nulll\\Desktop\\Finace\\gst-hub\\gst-hub-cli\\AppDeployment\\resources', {recursive: true});

                              }
                              /**program.action(() => {
                                inquirer
                                  .prompt([
                                    {
                                      type: "text",
                                      name: "name",
                                      message: "Artifact Repo Link:",
                                    },
                                  ])
                                  .then((answers) => {
                                    console.log(chalk.green(`Cloning..., ${answers.name}!`));
                                    
                                    var link = answers.name;
                                    exec(`cd ./git && git clone ${link}`, (err, stdout, stderr) => {
                                      if (err) {
                                        // node couldn't execute the command
                                        return;
                                      }
                                    
                                      // the *entire* stdout and stderr (buffered)
                                     // console.log(`stdout: ${stdout}`);
                                      console.log(`stderr: ${stderr}`);
                                      console.log(`Done`);
                                    });
        
                                  });
                              }); */
                            
                            
                              if(answers.name=='gst')
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
                  }
              }
          }
      }
  } catch (error) {
      console.error("Error moving JSON files:", error);
  }
}
