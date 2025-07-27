import { cloneDeep, difference, times } from '../../_utils/lodash-lite.js'
import { cloneForStorage } from '../helpers.js'
import { dbPromise, getDatabase } from '../databaseLifecycle.ts'
import {
  accountsCache,
  notificationsCache,
  setInCache,
  statusesCache,
} from '../cache.js'
import { scheduleCleanup } from '../cleanup.js'
import {
  ACCOUNTS_STORE,
  NOTIFICATION_TIMELINES_STORE,
  NOTIFICATIONS_STORE,
  STATUS_TIMELINES_STORE,
  STATUSES_STORE,
  THREADS_STORE,
} from '../constants.js'
import {
  createThreadId,
  createThreadKeyRange,
  createTimelineId,
} from '../keys.js'
import { cacheStatus } from './cacheStatus.js'
import { rehydrated } from '../../_actions/rehydrateStatusOrNotification.js'

export function putStatus(statusesStore: IDBObjectStore, status: any) {
  try {
    statusesStore.put(cloneForStorage(status))
  } catch (e) {
    console.warn(e)
  }
}

function putAccount(accountsStore: IDBObjectStore, account: any) {
  try {
    // sometimes pleroma or akkoma gives us "account": {}
    if (account.acct) {
      accountsStore.put(cloneForStorage(account))
    }
  } catch (e) {
    console.warn(e)
  }
}

function putNotification(
  notificationsStore: IDBObjectStore,
  notification: any,
) {
  try {
    notificationsStore.put(cloneForStorage(notification))
  } catch (e) {
    console.warn(e)
  }
}

export function storeStatus(
  statusesStore: IDBObjectStore,
  accountsStore: IDBObjectStore,
  status: any,
) {
  if (status[rehydrated]) {
    console.warn(new Error('attempt to store hydrated status in db'))
    return
  }
  putStatus(statusesStore, status)
  putAccount(accountsStore, status.account)
  if (status.reblog) {
    putStatus(statusesStore, status.reblog)
    putAccount(accountsStore, status.reblog.account)
  }
}

function storeNotification(
  notificationsStore: IDBObjectStore,
  statusesStore: IDBObjectStore,
  accountsStore: IDBObjectStore,
  notification: any,
) {
  if (notification.status) {
    storeStatus(statusesStore, accountsStore, notification.status)
  }
  putAccount(accountsStore, notification.account)
  putNotification(notificationsStore, notification)
}

async function insertTimelineNotifications(
  instanceName: string,
  timeline: string,
  notifications: any[],
) {
  for (const notification of notifications) {
    setInCache(notificationsCache, instanceName, notification.id, notification)
    setInCache(
      accountsCache,
      instanceName,
      notification.account.id,
      notification.account,
    )
    if (notification.status) {
      setInCache(
        statusesCache,
        instanceName,
        notification.status.id,
        cloneDeep(notification.status),
      )
    }
  }
  const db = await getDatabase(instanceName)
  await dbPromise(
    db,
    [
      NOTIFICATION_TIMELINES_STORE,
      NOTIFICATIONS_STORE,
      ACCOUNTS_STORE,
      STATUSES_STORE,
    ] as const,
    'readwrite',
    (stores) => {
      const [timelineStore, notificationsStore, accountsStore, statusesStore] =
        stores
      for (const notification of notifications) {
        storeNotification(
          notificationsStore,
          statusesStore,
          accountsStore,
          notification,
        )
        timelineStore.put(
          notification.id,
          createTimelineId(timeline, notification.id),
        )
      }
    },
  )
}

async function insertTimelineStatuses(
  instanceName: string,
  timeline: string,
  statuses: any[],
) {
  for (const status of statuses) {
    cacheStatus(status, instanceName)
  }
  const db = await getDatabase(instanceName)
  await dbPromise(
    db,
    [STATUS_TIMELINES_STORE, STATUSES_STORE, ACCOUNTS_STORE] as const,
    'readwrite',
    (stores) => {
      const [timelineStore, statusesStore, accountsStore] = stores
      for (const status of statuses) {
        storeStatus(statusesStore, accountsStore, status)
        timelineStore.put(status.id, createTimelineId(timeline, status.id))
      }
    },
  )
}

async function insertStatusThread(
  instanceName: string,
  statusId: string,
  statuses: any[],
) {
  for (const status of statuses) {
    cacheStatus(status, instanceName)
  }
  const db = await getDatabase(instanceName)
  await dbPromise(
    db,
    [THREADS_STORE, STATUSES_STORE, ACCOUNTS_STORE] as const,
    'readwrite',
    (stores) => {
      const [threadsStore, statusesStore, accountsStore] = stores
      const req = threadsStore.getAllKeys(createThreadKeyRange(statusId))
      req.onsuccess = () => {
        const existingKeys = req.result
        const newKeys = times(statuses.length, (i) =>
          createThreadId(statusId, i),
        )
        const keysToDelete = difference(existingKeys, newKeys)
        for (const key of keysToDelete) {
          threadsStore.delete(key)
        }
      }
      statuses.forEach((otherStatus, i) => {
        storeStatus(statusesStore, accountsStore, otherStatus)
        threadsStore.put(otherStatus.id, createThreadId(statusId, i))
      })
    },
  )
}

export async function insertTimelineItems(
  instanceName: string,
  timeline: string,
  timelineItems: any[],
) {
  console.log(
    'insertTimelineItems',
    instanceName,
    timeline,
    timelineItems.length,
    'items',
  )
  /* no await */ scheduleCleanup()
  if (timeline === 'notifications' || timeline === 'notifications/mentions') {
    return insertTimelineNotifications(instanceName, timeline, timelineItems)
  } else if (timeline.startsWith('status/')) {
    const statusId = timeline.split('/').slice(-1)[0]!
    return insertStatusThread(instanceName, statusId, timelineItems)
  } else {
    return insertTimelineStatuses(instanceName, timeline, timelineItems)
  }
}

export async function insertStatus(instanceName: string, status: any) {
  cacheStatus(status, instanceName)
  const db = await getDatabase(instanceName)
  await dbPromise(
    db,
    [STATUSES_STORE, ACCOUNTS_STORE] as const,
    'readwrite',
    ([statusesStore, accountsStore]) => {
      storeStatus(statusesStore, accountsStore, status)
    },
  )
}
