import { ConfigurationTarget, Extension, extensions, Uri, window, workspace } from 'vscode'
import { join } from 'path'

// force QoverySpec to be included
import './domain/QoverySpec.json'

const YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION = 'yaml.schemas'
const VSCODE_YAML_EXTENSION_ID = 'redhat.vscode-yaml'
const QOVERY_FILE_PATTERN = '*.qovery.y*ml'
const SCHEMA_FILE = Uri.file(join(__dirname, `/domain/QoverySpec.json`)).toString()

export const activate = async () => {
  const mayExtension = getYamlExtension()

  if (mayExtension !== undefined) {
    await addQoverySchemaToConfig()
    await activateYamlExtension(mayExtension)
  }
}

export const deactivate = () => {}

const getYamlExtension = () : Extension<any> | undefined => {
  const ext: Extension<any> | undefined = extensions.getExtension(VSCODE_YAML_EXTENSION_ID)
  if (!ext) {
    window.showWarningMessage('Please install \'YAML Support by Red Hat\' via the Extensions pane.')
    return undefined
  }

  return ext
}

const activateYamlExtension = async (ext: Extension<any>) => {
  const yamlPlugin = await ext.activate()

  if (!yamlPlugin) {
    window.showWarningMessage(' Please upgrade \'YAML Support by Red Hat\' via the Extensions pane.')
    return
  }
  return yamlPlugin
}

const addQoverySchemaToConfig = async () => {
  const config = workspace.getConfiguration().inspect(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION)

  if (config !== undefined) {
    await addQoverySchemaToConfigAtScope(SCHEMA_FILE, QOVERY_FILE_PATTERN, ConfigurationTarget.Global, config.globalValue)
  }
}

const addQoverySchemaToConfigAtScope = async (key: string, value: string, scope: ConfigurationTarget, valueAtScope: any) => {
  let newValue: any = {}
  if (valueAtScope) {
    newValue = Object.assign({}, valueAtScope)
  }

  Object.keys(newValue).forEach(configKey => {
    var configValue = newValue[configKey]
    if (value === configValue) {
      delete newValue[configKey]
    }
  })

  newValue[key] = value

  await workspace.getConfiguration().update(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION, newValue, scope)
}
