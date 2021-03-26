import { CommandModule } from 'yargs'
import { prompt } from 'enquirer'
import { execCommand } from '../lib/exec'
import { parseStrToArrayJson } from '../lib/parse'

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

interface GCloudCommandOptions {
  withClusterCredential?: boolean
}

interface ActiveGCloudConfigurationParams extends GCloudCommandOptions {
  env: string
}

async function activeGCloudConfiguration({ env, withClusterCredential }: ActiveGCloudConfigurationParams) {
  const cmd = `gcloud config configurations activate ${env}`

  await execCommand(cmd)
    .then(msg => console.log(msg))

  if (withClusterCredential) {
    const list = await execCommand('gcloud container clusters list')
    console.log(list)

    const clusters = parseStrToArrayJson<Cluster>(list!, CLUSTER_PROPERTIES)
    const clusterNames = clusters.map(c => c.name)

    let cluster: Cluster | undefined

    if (clusterNames.length === 0) {
      console.log('Not found clusters')
    } else if (clusterNames.length === 1) {
      cluster = clusters[0]
    } else {
      const res = await prompt<{name: string}>({
        type: 'select',
        name: 'name',
        message: 'Pick a cluster',
        required: true,
        choices: clusterNames
      })

      cluster = clusters.find(c => c.name === res.name)
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
    // env
    yargs.command<GCloudCommandOptions>('prod', 'production', () => {}, (args) => {
      activeGCloudConfiguration({
        env: 'prod',
        ...args,
      })
    })
    yargs.command<GCloudCommandOptions>('dev', 'development', () => {}, (args) => {
      activeGCloudConfiguration({
        env: 'dev',
        ...args,
      })
    })

    // options
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
