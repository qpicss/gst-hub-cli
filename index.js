#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import figlet from "figlet";

//console.log(process.argv);

let test = process.argv; 
console.log(chalk.yellow(figlet.textSync("GST-HUB CLI", { horizontalLayout: "full" }))  );
var auth =true;
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
      /*  program.action(() => {
        inquirer
          .prompt([
            {
              type: "list",
              name: "choice",
              message: "Clone options:",
              choices: ["OpenAPI", "OperationId", "Schema"],
            },
          ])
          .then((result) => {
    
            program.action(() => {
                inquirer
                  .prompt([
                    {
                      type: "input",
                      name: "name",
                      message: "Artifact name:",
                    },
                  ])
                  .then((answers) => {
                    console.log(chalk.green(`Hey there, ${answers.name}!`));
                  });
              });
            program.parse();
          });
      });*/
      
     
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
          message: "For interactive menu: \n\tRun  gst -i\n Press any key to continue...",
          
        },
      ]).then((result) => {
        
      });
  });
  program.parse([]);
}
function showInteractive()
{
  program
  .version("1.0.0")
  .description("GST-HUB CLI")
  .option("-i ", "Object name")
  .option("--OperationId <Name> ", "Object name")
  .option("--Schema <Name> ", "Object name")
  .action((options) => {
    console.log(chalk.blue(`Cloning OpenAPI, ${options.OpenAPI}!`));
    console.log(chalk.green(`Cloning OperationId, ${options.OperationId}!`));
    console.log(chalk.red(`Cloning Schema, ${options.Schema}!`));
  });
  program.parse(process.argv);
}



