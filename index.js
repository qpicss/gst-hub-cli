#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import figlet from "figlet";

//console.log(process.argv);

let test = process.argv; 
console.log(chalk.yellow(figlet.textSync("GST-HUB CLI", { horizontalLayout: "full" }))  );

if(test[2] && test[2].includes('--'))
{
    program
    .version("1.0.0")
    .description("GST-HUB CLI")
    .option("--OpenAPI <Name> ", "Object name")
    .option("--OperationId <Name> ", "Object name")
    .option("--Schema <Name> ", "Object name")
    .action((options) => {
      console.log(chalk.blue(`Cloning OpenAPI, ${options.OpenAPI}!`));
      console.log(chalk.green(`Cloning OperationId, ${options.OperationId}!`));
      console.log(chalk.red(`Cloning Schema, ${options.Schema}!`));
    })
}
else
{
    program.action(() => {
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
  });
  
 
}



program.parse(process.argv);

