import { execCommand } from '../../../lib/exec'
import { parseStrToArrayJson } from '../../../lib/parse'
import { Cluster } from '../models'

export async function list() {
  const clusterProperties: Array<keyof Cluster> = [
    'name', 'location', 'master_version', 'master_ip', 'machine_type', 'node_version', 'num_nodes', 'status',
  ]

  const cmd = 'gcloud container clusters list'
  const str = await execCommand(cmd)

  const clusters = parseStrToArrayJson<Cluster>(str, clusterProperties)
  return clusters
}

export async function getCredentials(cluster: Cluster) {
  return await execCommand(`gcloud container clusters get-credentials ${cluster.name} --zone=${cluster.location}`)
}
