#!/usr/bin/env node
import yargs from 'yargs'

// eslint-disable-next-line no-unused-expressions
yargs(process.argv.slice(2))
  .commandDir('commands')
  .demandCommand()
  // 자동 완성 명령어가 계속 나와서 주석처리
  // .completion()
  .help()
  .version(false)
  .argv
