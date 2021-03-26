import fs from 'fs'

export function readFileSync(filename: string) {
  return JSON.parse(fs.readFileSync(filename).toString())
}
