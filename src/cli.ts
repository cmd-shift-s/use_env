#!/usr/bin/env node
import yargs from 'yargs'

const services = ['gcloud']

// eslint-disable-next-line no-unused-expressions
yargs(process.argv.slice(2))
  .commandDir('commands')
  .command<{service?: string}>('gen-json [service]', 'generate json', yargs => {
    yargs.positional('service', {
      type: 'string',
      choices: services
    })
    return yargs
  }, async(argv) => {
    async function callJsonGenerator(service: string) {
      const generator = require(`./commands/${service}/generate-json`)
      await generator.generateJson()
    }

    if (argv.service) {
      callJsonGenerator(argv.service)
    } else {
      for (const service of services) {
        callJsonGenerator(service)
      }
    }
  })
  .demandCommand()
  // 자동 완성 명령어가 계속 나와서 주석처리
  // .completion()
  .help()
  .version(false)
  .argv
