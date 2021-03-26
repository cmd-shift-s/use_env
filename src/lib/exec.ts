import { exec } from 'child_process'

const isDryRun = process.env.DRY_RUN

export function execCommand(cmd: string) {
  console.log('EXEC:', cmd)
  return new Promise<string>((resolve, reject) => {
    if (isDryRun) {
      return resolve('')
    }

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      if (stdout) {
        console.log(stdout)
        resolve(stdout)
      } else {
        console.log(stderr)
        resolve(stderr)
      }
    })
  })
}
