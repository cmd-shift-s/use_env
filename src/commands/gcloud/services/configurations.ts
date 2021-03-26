import { execCommand } from '../../../lib/exec'
import { parseStrToArrayJson } from '../../../lib/parse'
import { Configuration } from '../models'

export async function active(name: string) {
  return await execCommand(`gcloud config configurations activate ${name}`)
}

export async function list() {
  const configurationProperties: Array<keyof Configuration> = [
    'name', 'is_active', 'account', 'project', 'compute_default_zone', 'compute_default_region',
  ]

  const cmd = 'gcloud config configurations list'
  const str = await execCommand(cmd)

  const configurations = parseStrToArrayJson<Configuration>(str, configurationProperties)
  return configurations
}
