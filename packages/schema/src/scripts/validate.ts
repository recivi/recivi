/**
 * Validate the given résumé data files against the Récivi spec.
 */

import { readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'

import chalk from 'chalk'
import { Command } from 'commander'
import { ZodError } from 'zod'

import { resumeSchema } from '@/index' // Import from the barrel file.

/**
 * Convert the file name into a file path. This function will resolve
 * relative paths to the current working directory and leave absolute
 * paths unmodified.
 *
 * @param file the name of the file received at the command line
 * @returns the resolved file path
 */
function resolveFilePath(file: string): string {
  if (isAbsolute(file)) {
    return file
  }
  const resolvedFile = resolve(process.cwd(), file)
  console.log(chalk.blue('VAL'), `Resolved: ${resolvedFile}`)
  return resolvedFile
}

/**
 * Read the file at the given path.
 *
 * @param file the path to the file to read
 * @returns {string} the content of the file
 */
function readTextFile(file: string): string {
  const filePath = resolveFilePath(file)
  return readFileSync(filePath, 'utf-8')
}

/**
 * Validate the résumé data against the Récivi schema.
 *
 * @param file the name of the file to validate
 * @returns {boolean} whether the file is valid or not
 */
function isValidResume(file: string): boolean {
  try {
    const content = readTextFile(file)
    const data = JSON.parse(content)
    resumeSchema.parse(data)

    console.log(chalk.green('VAL'), chalk.bold(file), chalk.green('Valid'))
    return true
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(
        chalk.red('VAL'),
        chalk.bold(file),
        chalk.red('Invalid, see errors below:'),
      )

      error.issues.forEach((err) => {
        const errorText = `\n${JSON.stringify(err, null, 2)}`
        console.log(chalk.red(errorText.replace(/\n/g, chalk.dim('\n...'))))
      })
    } else {
      console.log(chalk.red('VAL'), chalk.bold(file), chalk.red(error))
    }
  }
  return false
}

/**
 * This is the main entrypoint of the program, that gets called with
 * the command line arguments.
 *
 * It also sets the exit code based on the overall validity of all data
 * files.
 *
 * @param files the names of the files to validate
 */
function main(files: string[]) {
  console.log(chalk.blue('VAL'), 'Validation start')

  const validities = files.map((file) => {
    console.log(chalk.blue('VAL'), `Validating file: ${file}`)
    return isValidResume(file)
  })

  if (validities.includes(false)) {
    // At least one file was invalid.
    console.log(chalk.red('VAL'), '× Validation failure')
    process.exit(1)
  } else {
    console.log(chalk.green('VAL'), '⚡️ Validation success')
  }
}

const program = new Command()
program
  .name('validate')
  .description('Validate the given résumé data files against the Récivi spec.')
  .argument('<files...>', 'path to the résumé data files')
  .action(main)
program.parse()
