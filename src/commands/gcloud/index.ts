import { CommandModule } from 'yargs'
import { readFileSync } from '../../lib/file'
import { GCloudJson, JSON_FILENAME } from './generate-json'
import { Cluster } from './models'
import { clusterService, configurationService } from './services'

const gcloud: GCloudJson = readFileSync(JSON_FILENAME)

interface GCloudCommandOptions {
  withClusterCredential?: boolean
}

interface ActiveGCloudConfigurationParams extends GCloudCommandOptions {
  env: string
}

async function activeGCloudConfiguration({ env, withClusterCredential }: ActiveGCloudConfigurationParams) {
  await configurationService.active(env)

  if (withClusterCredential) {
    const clusters = gcloud[env].clusters as Cluster[]
    await clusterService.getCredentials(clusters[0])
  }
}

const command: CommandModule = {
  command: 'gcloud <env>',
  aliases: 'gk',
  describe: 'google cloud platform',
  builder: yargs => {
    const configs = Object.keys(gcloud)
    configs.forEach((name) => {
      yargs.command<GCloudCommandOptions>(
        name, 'configuration',
        (yargs) => {
          const clusters = gcloud[name].clusters
          if (clusters && clusters.length) {
            yargs
              .option('with-cluster-credential', {
                type: 'string',
                describe: 'get cluster credential for kubernetes',
                choices: clusters.map(c => c.name)
              })
          }
          return yargs
        },
        (args) => {
          activeGCloudConfiguration({
            env: name,
            ...args
          })
        })
    })

    return yargs
  },
  handler: args => {}
}

module.exports = command
