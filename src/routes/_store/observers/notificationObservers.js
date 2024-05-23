import { setFavicon } from '../../_utils/setFavicon.js'
import { runMediumPriorityTask } from '../../_utils/runMediumPriorityTask.js'
import { store } from '../store.js'

let currentFaviconHasNotifications = false

export function notificationObservers () {
  store.observe('hasNotifications', hasNotifications => {
    if (!process.env.BROWSER) {
      return
    }
    runMediumPriorityTask(() => {
      if (currentFaviconHasNotifications === hasNotifications) {
        return
      }
      setFavicon(`/icons/favicon${hasNotifications ? '-alert' : ''}.ico`)
      currentFaviconHasNotifications = !currentFaviconHasNotifications
    })
  })
  let previousNumberOfNotifications = 0
  let audio
  store.observe('numberOfNotifications', (numberOfNotifications) => {
    const { disableNotificationSound } = store.get()
    if (!disableNotificationSound && numberOfNotifications > previousNumberOfNotifications) {
      try {
        (audio || (audio = new Audio('/boop.mp3'))).play()
      } catch (_) {
        // ignore
      }
    }
    previousNumberOfNotifications = numberOfNotifications
  })
}
