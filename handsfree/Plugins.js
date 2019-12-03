import { set, get } from 'lodash'

/**
 * Adds a callback (we call it a plugin) to be called after every tracked frame
 * @param {String} name The plugin name
 * @param {Function} callback The callback to run
 */
const Handsfree = window.Handsfree

Handsfree.use = function(name, opts = {}) {
  // Make sure we have an options object
  if (typeof opts === 'function') {
    opts = {
      onFrame: opts
    }
  }

  // Assign defaults
  set(
    Handsfree.plugins,
    name,
    Object.assign(
      {
        // Whether the plugin is enabled by default
        enabled: true,
        // A set of default config values the user can override during instanciation
        config: {},
        // (instance) => Called on every frame
        onFrame: null,
        // (instance) => Called when the plugin is first used
        onUse: null,
        // (instance) => Called when the plugin is enabled
        onEnable: null,
        // (instance) => Called when the plugin is disabled
        onDisable: null
      },
      opts
    )
  )
  const plugin = get(Handsfree.plugins, name)

  // Run onUse callbacks and apply config overrides
  if (Handsfree.instances.length) {
    Object.keys(Handsfree.instances).forEach((instanceId) => {
      const instance = Handsfree.instances[instanceId]
      !plugin.wasOnUseCalled && plugin.onUse && plugin.onUse(instance)

      // Assign config
      const handsfreePluginConfig = get(instance.config.plugin, name)
      if (typeof handsfreePluginConfig === 'object') {
        Object.assign(plugin.config, handsfreePluginConfig)
      }
    })

    plugin.wasOnUseCalled = true
  }
}

/**
 * Enable plugins
 * - Calls onEnable for each instance
 */
Handsfree.enable = function(name) {
  const plugin = get(Handsfree.plugins, name)
  plugin.enabled = true

  Handsfree.instances.forEach((instance) => {
    plugin.onEnable && plugin.onEnable(instance)
  })
}

/**
 * Recurses through the plugins object, calling their onUse
 */
Handsfree.prototype.runOnUse = function(payload) {
  // Plugins have .enabled, so lets run them
  if (payload.hasOwnProperty('enabled')) {
    !payload.wasOnUseCalled && payload.onUse && payload.onUse(this)
    payload.wasOnUseCalled = true

    // Otherwise loop through each property
  } else {
    Object.keys(payload).forEach((key) => {
      this.runOnUse(payload[key])
    })
  }
}

/**
 * Recurses through the plugins object, calling their onFrame
 */
Handsfree.prototype.runOnFrame = function(payload) {
  // Plugins have .enabled, so lets run them
  if (payload.hasOwnProperty('enabled')) {
    payload.enabled && payload.onFrame && payload.onFrame(this)

    // Otherwise loop through each property
  } else {
    Object.keys(payload).forEach((key) => {
      this.runOnFrame(payload[key])
    })
  }
}

/**
 * Disable plugins
 * - Calls onDisable for each instance
 */
Handsfree.disable = function(name) {
  const plugin = get(Handsfree.plugins, name)
  plugin.enabled = false

  Handsfree.instances.forEach((instance) => {
    plugin.onDisable && plugin.onDisable(instance)
  })
}

require('./plugins/head/vertScroll')
require('./plugins/head/click')
require('./plugins/head/morphs')
require('./plugins/head/pointer')
