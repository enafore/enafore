import { DEFAULT_THEME } from '../../_utils/themeEngine.js'
import { mark, stop } from '../../_utils/marks.js'
import {
  MAX_STATUS_CHARS,
  MAX_STATUS_MEDIA_ATTACHMENTS,
  MAX_STATUS_POLL_OPTIONS
} from '../../_static/statuses.js'
import { MEDIA_ALT_CHAR_LIMIT } from '../../_static/media.js'
import { POLL_EXPIRY_OPTIONS } from '../../_static/polls.js'

function computeForInstance (store, computedKey, key, defaultValue) {
  store.compute(
    computedKey,
    [key, 'currentInstance'],
    (instanceData, currentInstance) =>
      (currentInstance && instanceData[currentInstance]) || defaultValue
  )
}

export function instanceComputations (store) {
  mark('instanceComputations')
  computeForInstance(store, 'currentTheme', 'instanceThemes', DEFAULT_THEME)
  computeForInstance(
    store,
    'currentVerifyCredentials',
    'verifyCredentials',
    null
  )
  computeForInstance(store, 'currentInstanceInfo', 'instanceInfos', null)
  computeForInstance(store, 'pinnedPage', 'pinnedPages', '/local')
  computeForInstance(store, 'lists', 'instanceLists', [])
  computeForInstance(store, 'filters', 'instanceFilters', [])
  computeForInstance(
    store,
    'currentStatusModifications',
    'statusModifications',
    null
  )
  computeForInstance(store, 'currentCustomEmoji', 'customEmoji', [])
  computeForInstance(store, 'currentComposeData', 'composeData', {})
  computeForInstance(
    store,
    'currentPushSubscription',
    'pushSubscriptions',
    null
  )
  computeForInstance(
    store,
    'currentInstanceDataReady',
    'instanceDataReady',
    null
  )
  computeForInstance(store, 'currentLastContentType', 'lastContentTypes', null)

  store.compute(
    'isUserLoggedIn',
    ['currentInstance', 'loggedInInstances'],
    (currentInstance, loggedInInstances) =>
      !!(
        currentInstance &&
        Object.keys(loggedInInstances).includes(currentInstance)
      )
  )

  store.compute(
    'loggedInInstancesAsList',
    ['currentInstance', 'loggedInInstances', 'loggedInInstancesInOrder'],
    (currentInstance, loggedInInstances, loggedInInstancesInOrder) => {
      return loggedInInstancesInOrder.map((instanceName) => {
        return Object.assign(
          {
            current: currentInstance === instanceName,
            name: instanceName
          },
          loggedInInstances[instanceName]
        )
      })
    }
  )

  store.compute(
    'currentInstanceData',
    ['currentInstance', 'loggedInInstances'],
    (currentInstance, loggedInInstances) => {
      return Object.assign(
        {
          name: currentInstance
        },
        loggedInInstances[currentInstance]
      )
    }
  )

  store.compute(
    'currentPostTypes',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (currentInstanceInfo) {
        if (typeof currentInstanceInfo.pleroma === 'object') { return currentInstanceInfo.pleroma.metadata.post_formats }
        let _a, _b
        if (
          typeof ((_b =
            (_a = currentInstanceInfo.configuration) === null ||
            _a === undefined
              ? undefined
              : _a.statuses) === null || _b === undefined
            ? undefined
            : _b.supported_mime_types) === 'object'
        ) {
          return currentInstanceInfo.configuration.statuses.supported_mime_types
        }
        if (
          typeof currentInstanceInfo.version === 'string' &&
          /\+(glitch|cat|nya|types)/.test(currentInstanceInfo.version)
        ) { return ['text/plain', 'text/markdown', 'text/html'] }
      }
      return ['text/plain']
    }
  )

  store.compute(
    'currentSupportedToggles',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      let _a, _b
      return (_b =
        (_a =
          currentInstanceInfo === null || currentInstanceInfo === undefined
            ? undefined
            : currentInstanceInfo.configuration) === null || _a === undefined
          ? undefined
          : _a.statuses) === null || _b === undefined
        ? undefined
        : _b.supported_toggles
    }
  )

  store.compute(
    'currentPleromaFeatures',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (currentInstanceInfo) {
        if (typeof currentInstanceInfo.pleroma === 'object') { return currentInstanceInfo.pleroma.metadata.features }
      } else return null
    }
  )

  store.compute(
    'fedibirdCapabilities',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (currentInstanceInfo) {
        if (typeof currentInstanceInfo.fedibird_capabilities === 'object') { return currentInstanceInfo.fedibird_capabilities }
      } else return null
    }
  )

  store.compute(
    'currentReactionApi',
    ['currentPleromaFeatures', 'fedibirdCapabilities'],
    (currentPleromaFeatures, fedibirdCapabilities) => {
      return {
        customEmojiReactions: currentPleromaFeatures
          ? currentPleromaFeatures.includes('custom_emoji_reactions')
          : true,
        externReactions: true,
        isPleroma: !!currentPleromaFeatures,
        isFedibird: !!fedibirdCapabilities
      }
    }
  )

  store.compute(
    'bubbleTimelineEnabled',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (currentInstanceInfo) {
        if (typeof currentInstanceInfo.nodeInfo === 'object') {
          if (
            currentInstanceInfo.nodeInfo !== null &&
            typeof currentInstanceInfo.nodeInfo.metadata === 'object' &&
            currentInstanceInfo.nodeInfo.metadata !== null
          ) {
            const localBubbleInstances =
              currentInstanceInfo.nodeInfo.metadata.localBubbleInstances
            return localBubbleInstances
              ? localBubbleInstances.length > 0
              : false
          } else return false
        } else return null // need updated instanceinfo
      } else return false
    }
  )

  store.compute(
    'accessToken',
    ['currentInstanceData'],
    (currentInstanceData) =>
      currentInstanceData && currentInstanceData.access_token
  )

  store.compute(
    'maxStatusChars',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (currentInstanceInfo) {
        if (currentInstanceInfo.max_toot_chars) {
          // unofficial api used in glitch-soc and pleroma
          return currentInstanceInfo.max_toot_chars
        }
        if (
          currentInstanceInfo.configuration &&
          currentInstanceInfo.configuration.statuses &&
          currentInstanceInfo.configuration.statuses.max_characters
        ) {
          return currentInstanceInfo.configuration.statuses.max_characters
        }
      }
      return MAX_STATUS_CHARS
    }
  )

  store.compute(
    'maxMediaDescChars',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (currentInstanceInfo) {
        if (
          currentInstanceInfo.configuration &&
          currentInstanceInfo.configuration.media_attachments &&
          currentInstanceInfo.configuration.media_attachments.description_limit
        ) {
          return currentInstanceInfo.configuration.media_attachments.description_limit
        }
        return MEDIA_ALT_CHAR_LIMIT
      }
    }
  )

  store.compute(
    'maxStatusMediaAttachments',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (
        currentInstanceInfo &&
        currentInstanceInfo.configuration &&
        currentInstanceInfo.configuration.statuses &&
        currentInstanceInfo.configuration.statuses.max_media_attachments
      ) {
        return currentInstanceInfo.configuration.statuses.max_media_attachments
      }
      return MAX_STATUS_MEDIA_ATTACHMENTS
    }
  )

  store.compute(
    'maxStatusPollOptions',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (
        currentInstanceInfo &&
        currentInstanceInfo.poll_limits &&
        currentInstanceInfo.poll_limits.max_options
      ) {
        return currentInstanceInfo.poll_limits.max_options
      }
      if (
        currentInstanceInfo &&
        currentInstanceInfo.configuration &&
        currentInstanceInfo.configuration.polls &&
        currentInstanceInfo.configuration.polls.max_options
      ) {
        return currentInstanceInfo.configuration.polls.max_options
      }
      return MAX_STATUS_POLL_OPTIONS
    }
  )

  store.compute(
    'maxStatusPollOptionLength',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      if (
        currentInstanceInfo &&
        currentInstanceInfo.poll_limits &&
        currentInstanceInfo.poll_limits.max_option_chars
      ) {
        return currentInstanceInfo.poll_limits.max_option_chars
      }
      if (
        currentInstanceInfo &&
        currentInstanceInfo.configuration &&
        currentInstanceInfo.configuration.polls &&
        currentInstanceInfo.configuration.polls.max_characters_per_option
      ) {
        return currentInstanceInfo.configuration.polls.max_characters_per_option
      }
      return MAX_STATUS_POLL_OPTIONS
    }
  )

  store.compute(
    'statusPollExpiryOptions',
    ['currentInstanceInfo'],
    (currentInstanceInfo) => {
      /* eslint-disable camelcase */
      const { min_expiration, max_expiration } = (currentInstanceInfo &&
        currentInstanceInfo.poll_limits &&
        currentInstanceInfo.poll_limits) ||
        (currentInstanceInfo &&
          currentInstanceInfo.configuration &&
          currentInstanceInfo.configuration.polls) || {
        min_expiration: 300,
        max_expiration: 2629746
      }
      return POLL_EXPIRY_OPTIONS.filter(e => e.value >= min_expiration && e.value <= max_expiration)
    }
  )

  stop('instanceComputations')
}
