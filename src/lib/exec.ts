import { exec } from 'child_process'

export function execCommand(cmd: string) {
  console.log('EXEC:', cmd)
  return new Promise<string | null>((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      }
      if (stdout) {
        resolve(stdout)
      }
      if (stderr) {
        resolve(stderr)
      }
      resolve(null)
    })
  })
}
