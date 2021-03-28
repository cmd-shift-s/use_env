import fs from 'fs'
import { join } from 'path'
import { Cluster } from './models'
import { clusterService, configurationService } from './services'

export interface GCloudJson {
  [configName: string]: {
    clusters: Pick<Cluster, 'name'|'location'>[]
  }
}

export const JSON_FILENAME = join(__dirname, 'gcloud.json')

export async function generateJson() {
  console.log('fetch gcloud configurations...')
  const configurations = await configurationService.list()

  const currentConfig = configurations.find(c => c.is_active === 'True')

  const gcloud: GCloudJson = {}
  function initConfig(name: string) {
    gcloud[name] = {
      clusters: []
    }
    return gcloud[name]
  }

  for (const configuration of configurations) {
    const config = initConfig(configuration.name)

    await configurationService.active(configuration.name)

    console.log(`fetch gcloud ${configuration.name} clusters...`)
    const clusters = await clusterService.list()
    config.clusters = clusters.map(c => ({ name: c.name, location: c.location }))
  }

  fs.writeFileSync(JSON_FILENAME, JSON.stringify(gcloud, null, 2))

  if (configurations.length > 1 && currentConfig) {
    await configurationService.active(currentConfig.name)
  }
}

if (module === require.main) { generateJson() }
