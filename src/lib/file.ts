import fs from 'fs'

export function readFileSync(filename: string) {
  if (fs.existsSync(filename)) {
    return JSON.parse(fs.readFileSync(filename).toString())
  } else {
    return null
  }
}
