import { CommandModule } from 'yargs'
import { prompt } from 'enquirer'
import { execCommand } from '../lib/exec'

interface Cluster {
  name: string
  location: string
  master_version: string
  master_ip: string
  machine_type: string
  node_version: string
  num_nodes: string
  status: string
}
const CLUSTER_PROPERTIES: Array<keyof Cluster> = [
  'name', 'location', 'master_version', 'master_ip', 'machine_type', 'node_version', 'num_nodes', 'status',
]

function parseClusters(str: string) {
  // remove header and lastline
  const list = str.split('\n').slice(1, -1)

  const clusters: Record<string, Cluster> = {}

  for (const item of list) {
    const cluster = item
      .replace(/\s+/g, ' ')
      .split(' ')
      .reduce((cluster, val, index) => {
        const property = CLUSTER_PROPERTIES[index]
        cluster[property] = val
        return cluster
      }, {} as Cluster)

    clusters[cluster.name] = cluster
  }

  return clusters
}

async function activeGcloudConfiguration({
  env,
  withClusterCredential = false,
}: {env: string, withClusterCredential: boolean}) {
  const cmd = `gcloud config configurations activate ${env}`

  await execCommand(cmd)
    .then(msg => console.log(msg))

  if (withClusterCredential) {
    const list = await execCommand('gcloud container clusters list')
    console.log(list)

    const clusters = parseClusters(list!)
    const clusterNames = Object.keys(clusters)

    let cluster: Cluster | undefined

    if (clusterNames.length === 0) {
      console.log('Not found clusters')
    } else if (clusterNames.length === 1) {
      cluster = clusters[clusterNames[0]]
    } else {
      const res = await prompt<{name: string}>({
        type: 'select',
        name: 'name',
        message: 'Pick a cluster',
        required: true,
        choices: clusterNames
      })

      cluster = clusters[res.name]
    }

    if (!cluster) {
      return
    }

    await execCommand(`gcloud container clusters get-credentials ${cluster.name} --zone=${cluster.location}`)
      .then(msg => console.log(msg))
  }
}

const command: CommandModule = {
  command: 'gcloud <env>',
  aliases: 'gk',
  describe: 'google cloud platform',
  builder: yargs => {
    // for env
    yargs.command<{withClusterCredential: boolean}>('prod', 'production', () => {}, (args) => {
      activeGcloudConfiguration({
        env: 'prod',
        withClusterCredential: args.withClusterCredential
      })
    })
    yargs.command<{withClusterCredential: boolean}>('dev', 'development', () => {}, (args) => {
      activeGcloudConfiguration({
        env: 'dev',
        withClusterCredential: args.withClusterCredential
      })
    })

    yargs
      .option('with-cluster-credential', {
        type: 'boolean',
        describe: 'get cluster credential for kubernetes',
      })

    return yargs
  },
  handler: args => {}
}

module.exports = command
