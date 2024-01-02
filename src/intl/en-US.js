export default {
  // Home page, basic <title> and <description>
  appName: 'Enafore',
  appDescription: 'A somewhat unstable fediverse client with better support for Akkoma, glitch-soc, and Iceshrimp instances.',
  homeDescription: `
    <p>
      Enafore is a somewhat unstable fediverse client with better support for Akkoma, glitch-soc, and Iceshrimp instances.
    </p>
    <p>
      Get started by logging in to an instance:
    </p>`,
  logIn: 'Log in',
  footer: `
    <p>
      Enafore is <a rel="noopener" target="_blank" href="https://github.com/enafore/enafore">open-source software</a> distributed under the
      <a rel="noopener" target="_blank"
         href="https://github.com/enafore/enafore/blob/main/LICENSE">AGPL License</a>.
      Here is the <a href="/settings/about#privacy-policy" rel="prefetch">privacy policy</a>.
    </p>
  `,
  // Manifest
  newStatus: 'New post',
  // Generic UI
  loading: 'Loading',
  okay: 'OK',
  cancel: 'Cancel',
  alert: 'Alert',
  close: 'Close',
  error: 'Error: {error}',
  errorShort: 'Error:',
  // Relative timestamps
  justNow: 'just now',
  // Navigation, page titles
  navItemLabel: `
    {label} {selected, select,
      true {(current page)}
      other {}
    } {name, select,
      notifications {{count, plural,
        =0 {}
        one {(1 notification)}
        other {({count} notifications)}
      }}
      community {{count, plural,
        =0 {}
        one {(1 follow request)}
        other {({count} follow requests)}
      }}
      other {}
    }
  `,
  blockedUsers: 'Blocked users',
  bookmarks: 'Bookmarks',
  directMessages: 'Direct messages',
  favorites: 'Favorites',
  reactions: 'Reactions',
  federated: 'Federated',
  bubble: 'Bubble',
  home: 'Home',
  local: 'Local',
  notifications: 'Notifications',
  mutedUsers: 'Muted users',
  pinnedStatuses: 'Pinned posts',
  followRequests: 'Follow requests',
  followRequestsLabel: `Follow requests {hasFollowRequests, select,
    true {({count})}
    other {}
  }`,
  list: 'List',
  search: 'Search',
  pageHeader: 'Page header',
  goBack: 'Go back',
  back: 'Back',
  profile: 'Profile',
  federatedTimeline: 'Federated timeline',
  bubbleTimeline: 'Bubble timeline',
  localTimeline: 'Local timeline',
  // community page
  community: 'Community',
  pinnableTimelines: 'Pinnable timelines',
  timelines: 'Timelines',
  lists: 'Lists',
  instanceSettings: 'Instance settings',
  notificationMentions: 'Notification mentions',
  profileWithMedia: 'Profile with media',
  profileWithReplies: 'Profile with replies',
  hashtag: 'Hashtag',
  // not logged in
  profileNotLoggedIn: 'A user timeline will appear here when logged in.',
  bookmarksNotLoggedIn: 'Your bookmarks will appear here when logged in.',
  directMessagesNotLoggedIn: 'Your direct messages will appear here when logged in.',
  favoritesNotLoggedIn: 'Your favorites will appear here when logged in.',
  federatedTimelineNotLoggedIn: 'Your federated timeline will appear here when logged in.',
  bubbleTimelineNotLoggedIn: 'Your bubble timeline will appear here when logged in.',
  bubbleTimelineNotSupported: 'The bubble timeline isn\'t supported by your instance.',
  localTimelineNotLoggedIn: 'Your local timeline will appear here when logged in.',
  searchNotLoggedIn: 'You can search once logged in to an instance.',
  communityNotLoggedIn: 'Community options appear here when logged in.',
  listNotLoggedIn: 'A list will appear here when logged in.',
  notificationsNotLoggedIn: 'Your notifications will appear here when logged in.',
  notificationMentionsNotLoggedIn: 'Your notification mentions will appear here when logged in.',
  statusNotLoggedIn: 'A thread will appear here when logged in.',
  tagNotLoggedIn: 'A hashtag timeline will appear here when logged in.',
  // Notification subpages
  filters: 'Filters',
  all: 'All',
  mentions: 'Mentions',
  // Follow requests
  approve: 'Approve',
  reject: 'Reject',
  // Hotkeys
  hotkeys: 'Hotkeys',
  global: 'Global',
  timeline: 'Timeline',
  media: 'Media',
  globalHotkeys: `
    {leftRightChangesFocus, select,
      true {
        <li><kbd>→</kbd> to go to the next focusable element</li>
        <li><kbd>←</kbd> to go to the previous focusable element</li>
      }
      other {}
    }
    <li>
      <kbd>1</kbd> - <kbd>6</kbd>
      {leftRightChangesFocus, select,
        true {}
        other {or <kbd>←</kbd>/<kbd>→</kbd>}
      }
      to switch columns
    </li>
    <li><kbd>7</kbd> or <kbd>c</kbd> to compose a new post</li>
    <li><kbd>s</kbd> or <kbd>/</kbd> to search</li>
    <li><kbd>g</kbd> + <kbd>h</kbd> to go home</li>
    <li><kbd>g</kbd> + <kbd>n</kbd> to go to notifications</li>
    <li><kbd>g</kbd> + <kbd>l</kbd> to go to the local timeline</li>
    <li><kbd>g</kbd> + <kbd>b</kbd> to go to the bubble timeline</li>
    <li><kbd>g</kbd> + <kbd>t</kbd> to go to the federated timeline</li>
    <li><kbd>g</kbd> + <kbd>c</kbd> to go to the community page</li>
    <li><kbd>g</kbd> + <kbd>d</kbd> to go to the direct messages page</li>
    <li><kbd>g</kbd> + <kbd>i</kbd> to go to the instances page</li>
    <li><kbd>h</kbd> or <kbd>?</kbd> to toggle the help dialog</li>
    <li><kbd>Backspace</kbd> to go back, close dialogs</li>
  `,
  timelineHotkeys: `
    <li><kbd>j</kbd> or <kbd>↓</kbd> to activate the next post</li>
    <li><kbd>k</kbd> or <kbd>↑</kbd> to activate the previous post</li>
    <li><kbd>.</kbd> to show more and scroll to top</li>
    <li><kbd>o</kbd> to open</li>
    <li><kbd>f</kbd> to favorite</li>
    <li><kbd>b</kbd> to boost</li>
    <li><kbd>r</kbd> to reply</li>
    <li><kbd>Escape</kbd> to close reply</li>
    <li><kbd>a</kbd> to bookmark</li>
    <li><kbd>i</kbd> to open images, video, or audio</li>
    <li><kbd>y</kbd> to show or hide sensitive media</li>
    <li><kbd>m</kbd> to mention the author</li>
    <li><kbd>p</kbd> to open the author's profile</li>
    <li><kbd>l</kbd> to open the card's link in a new tab</li>
    <li><kbd>x</kbd> to show or hide text behind content warning</li>
    <li><kbd>z</kbd> to show or hide all content warnings in a thread</li>
  `,
  mediaHotkeys: `
    <li><kbd>←</kbd> / <kbd>→</kbd> to go to next or previous</li>
  `,
  // Community page, tabs
  tabLabel: `{label} {current, select,
    true {(Current)}
    other {}
  }`,
  pageTitle: `
    {hasNotifications, select,
      true {({count})}
      other {}
    }
    {name}
    ·
    {showInstanceName, select,
      true {{instanceName}}
      other {{appName}}
    }
  `,
  pinLabel: `{label} {pinnable, select,
    true {
      {pinned, select,
        true {(Pinned page)}
        other {(Unpinned page)}
      }
    }
    other {}
  }`,
  pinPage: 'Pin {label}',
  // Status composition
  composeStatus: 'Compose post',
  postStatus: 'Post',
  contentWarning: 'Content warning',
  dropToUpload: 'Drop to upload',
  invalidFileType: 'Invalid file type',
  composeLabel: "What's on your mind?",
  autocompleteDescription: 'When autocomplete results are available, press up or down arrows and enter to select.',
  mediaUploads: 'Media uploads',
  edit: 'Edit',
  delete: 'Delete',
  description: 'Description',
  descriptionLabel: 'Describe for visually impaired (image, video) or auditorily impaired (audio, video) people',
  markAsSensitive: 'Mark media as sensitive',
  // Polls
  youVotedFor: 'You voted for',
  createPoll: 'Create poll',
  removePollChoice: 'Remove choice {index}',
  pollChoiceLabel: 'Choice {index}',
  multipleChoice: 'Multiple choice',
  pollDuration: 'Poll duration',
  fiveMinutes: '5 minutes',
  thirtyMinutes: '30 minutes',
  oneHour: '1 hour',
  sixHours: '6 hours',
  twelveHours: '12 hours',
  oneDay: '1 day',
  threeDays: '3 days',
  sevenDays: '7 days',
  never: 'Never',
  addEmoji: 'Insert emoji',
  addMedia: 'Add media (images, video, audio)',
  addPoll: 'Add poll',
  removePoll: 'Remove poll',
  postPrivacyLabel: 'Change post privacy (currently {label})',
  addContentWarning: 'Add content warning',
  removeContentWarning: 'Remove content warning',
  altLabel: 'Describe for visually impaired people',
  extractText: 'Extract text from image',
  extractingText: 'Extracting text…',
  extractingTextCompletion: 'Extracting text ({percent}% complete)…',
  unableToExtractText: 'Unable to extract text.',
  // Account options
  followAccount: 'Follow {account}',
  unfollowAccount: 'Unfollow {account}',
  blockAccount: 'Block {account}',
  unblockAccount: 'Unblock {account}',
  muteAccount: 'Mute {account}',
  unmuteAccount: 'Unmute {account}',
  showReblogsFromAccount: 'Show boosts from {account}',
  hideReblogsFromAccount: 'Hide boosts from {account}',
  showDomain: 'Unblock {domain}',
  hideDomain: 'Block {domain}',
  reportAccount: 'Report {account}',
  mentionAccount: 'Mention {account}',
  copyLinkToAccount: 'Copy link to account',
  copiedToClipboard: 'Copied to clipboard',
  // Media dialog
  navigateMedia: 'Navigate media items',
  showPreviousMedia: 'Show previous media',
  showNextMedia: 'Show next media',
  enterPinchZoom: 'Pinch-zoom mode',
  exitPinchZoom: 'Exit pinch-zoom mode',
  showMedia: `Show {index, select,
    1 {first}
    2 {second}
    3 {third}
    other {fourth}
  } media {current, select,
    true {(current)}
    other {}
  }`,
  previewFocalPoint: 'Preview (focal point)',
  enterFocalPoint: 'Enter the focal point (X, Y) for this media',
  muteNotifications: 'Mute notifications as well',
  muteAccountConfirm: 'Mute {account}?',
  mute: 'Mute',
  unmute: 'Unmute',
  zoomOut: 'Zoom out',
  zoomIn: 'Zoom in',
  // Reporting
  reportingLabel: 'You are reporting {account} to the moderators of {instance}.',
  additionalComments: 'Additional comments',
  forwardDescription: 'Forward to the moderators of {instance} as well?',
  forwardLabel: 'Forward to {instance}',
  unableToLoadStatuses: 'Unable to load recent posts: {error}',
  report: 'Report',
  noContent: '(No content)',
  noStatuses: 'No posts to report',
  // Status options
  unpinFromProfile: 'Unpin from profile',
  pinToProfile: 'Pin to profile',
  muteConversation: 'Mute conversation',
  unmuteConversation: 'Unmute conversation',
  bookmarkStatus: 'Bookmark post',
  unbookmarkStatus: 'Unbookmark post',
  deleteAndRedraft: 'Delete and redraft',
  reportStatus: 'Report post',
  translateStatus: 'Translate post',
  reactToStatus: 'React to post',
  quoteStatus: 'Quote post',
  shareStatus: 'Share post',
  copyLinkToStatus: 'Copy link to post',
  // Account profile
  profileForAccount: 'Profile for {account}',
  statisticsAndMoreOptions: 'Stats and more options',
  statuses: 'Posts',
  follows: 'Follows',
  followers: 'Followers',
  moreOptions: 'More options',
  followersLabel: 'Followed by {count}',
  followingLabel: 'Follows {count}',
  followLabel: 'Follow',
  unfollowLabel: 'Unfollow',
  unrequestLabel: 'Cancel request',
  unfollowingLabel: 'Unfollowing...',
  unblockingLabel: 'Unblocking...',
  unrequestingLabel: 'Canceling...',
  requestingLabel: 'Requesting...',
  notify: 'Subscribe to {account}',
  denotify: 'Unsubscribe from {account}',
  subscribedAccount: 'Subscribed to account',
  unsubscribedAccount: 'Unsubscribed from account',
  unblock: 'Unblock',
  nameAndFollowing: 'Name and following',
  clickToSeeAvatar: 'Click to see avatar',
  opensInNewWindow: '{label} (opens in new window)',
  blocked: 'Blocked',
  domainHidden: 'Domain blocked',
  muted: 'Muted',
  followsYou: 'Follows you',
  locked: 'This account is locked. The owner manually reviews who can follow them.',
  avatarForAccount: 'Avatar for {account}',
  fields: 'Fields',
  accountHasMoved: '{account} has moved:',
  profilePageForAccount: 'Profile page for {account}',
  verified: 'Verified',
  // About page
  about: 'About',
  aboutApp: 'About Enafore',
  aboutAppDescription: `
  <p>
    Enafore is <a rel="noopener" target="_blank" href="https://github.com/enafore/enafore">open-source</a> software.
  </p>

  <div class="donate-banner ui-settings">
    <h2>Want to support Enafore development?</h2>
    <a rel="noopener" target="_blank" href="https://github.com/enafore/enafore#donate" class="button primary">Donate</a>
  </div>

  <h2 id="privacy-policy">Privacy Policy</h2>

  <p>
    Enafore does not store any personal information on its servers,
    including but not limited to names, email addresses,
    IP addresses, posts, and photos.
  </p>

  <p>
    Enafore is a static site hosted on Github Pages. All data is stored locally in your browser and shared with the fediverse
    instance(s) you connect to.
  </p>

  <p>
    Approximately once per day Enafore will send a request proxied through your instance so I can collect some general statistics. None of your personal information is sent. Unless you're on a single user instance.
  </p>

  <h2>Credits</h2>

  <p>
    Icons provided by <a rel="noopener" target="_blank" href="http://fontawesome.io/">Font Awesome</a>.
  </p>

  <p>
    Logo thanks to "sailboat" by Gregor Cresnar from
    <a rel="noopener" target="_blank" href="https://thenounproject.com/">the Noun Project</a>.
  </p>

  <p>
    Enafore is licensed under the <a rel="noopener" target="_blank" href="https://github.com/enafore/enafore/blob/main/LICENSE">GNU Affero General Public License</a>.
  </p>
  
  <h2>Version</h2>
  
  <p>
    You are running Enafore version <code class="enafore-version"></code>.
  </p>`,
  // Settings
  settings: 'Settings',
  general: 'General',
  generalSettings: 'General settings',
  showSensitive: 'Show sensitive media by default',
  showAllSpoilers: 'Expand content warnings by default',
  showPlain: 'Show a plain gray color for sensitive media',
  allSensitive: 'Treat all media as sensitive',
  largeMedia: 'Show large inline images and videos',
  autoplayGifs: 'Autoplay animated GIFs',
  hideCards: 'Hide link preview cards',
  underlineLinks: 'Underline links in posts and profiles',
  accessibility: 'Accessibility',
  reduceMotion: 'Reduce motion in UI animations',
  disableTappable: 'Disable tappable area on entire post',
  removeEmoji: 'Remove emoji from user display names',
  shortAria: 'Use short article ARIA labels',
  theme: 'Theme',
  themeForInstance: 'Theme for {instance}',
  disableCustomScrollbars: 'Disable custom scrollbars',
  bottomNav: 'Place the navigation bar at the bottom of the screen',
  centerNav: 'Center the navigation bar',
  preferences: 'Preferences',
  hotkeySettings: 'Hotkey settings',
  disableHotkeys: 'Disable all hotkeys',
  leftRightArrows: 'Left/right arrow keys change focus rather than columns/media',
  guide: 'Guide',
  reload: 'Reload',
  disableFollowRequestCount: 'Hide follow request count',
  hideLongPosts: 'Collapse long posts without content warnings',
  // Wellness settings
  wellness: 'Wellness',
  wellnessSettings: 'Wellness settings',
  wellnessDescription: `Wellness settings are designed to reduce the addictive or anxiety-inducing aspects of social media.
    Choose any options that work well for you.`,
  enableAll: 'Enable all',
  metrics: 'Metrics',
  hideFollowerCount: 'Hide follower counts (capped at 10)',
  hideReblogCount: 'Hide boost counts',
  hideFavoriteCount: 'Hide favorite and reaction counts',
  hideUnread: 'Hide unread notifications count (i.e. the red dot)',
  // The quality that makes something seem important or interesting because it seems to be happening now
  immediacy: 'Immediacy',
  showAbsoluteTimestamps: 'Show absolute timestamps (e.g. "March 3rd") instead of relative timestamps (e.g. "5 minutes ago")',
  ui: 'UI',
  grayscaleMode: 'Show emojis, images, and videos in grayscale',
  wellnessFooter: `These settings are partly based on guidelines from the
    <a rel="noopener" target="_blank" href="https://humanetech.com">Center for Humane Technology</a>.`,
  // This is a link: "You can filter or disable notifications in the _instance settings_"
  filterNotificationsPre: 'You can filter or disable notifications in the',
  filterNotificationsText: 'instance settings',
  filterNotificationsPost: '',
  // Custom tooltips, like "Disable _infinite scroll_", where you can click _infinite scroll_
  // to see a description. It's hard to properly internationalize, so we just break up the strings.
  disableInfiniteScrollPre: 'Disable',
  disableInfiniteScrollText: 'infinite scroll',
  disableInfiniteScrollDescription: `When infinite scroll is disabled, new posts will not automatically appear at
             the bottom or top of the timeline. Instead, buttons will allow you to
             load more content on demand.`,
  disableInfiniteScrollPost: '',
  // Instance settings
  loggedInAs: 'Logged in as',
  homeTimelineFilters: 'Home timeline filters',
  notificationFilters: 'Notification filters',
  pushNotifications: 'Push notifications',
  // Add instance page
  storageError: `It seems Enafore cannot store data locally. Is your browser in private mode
          or blocking cookies? Enafore stores all data locally, and requires LocalStorage and
          IndexedDB to work correctly.`,
  javaScriptError: 'You must enable JavaScript to log in.',
  enterInstanceName: 'Enter instance name',
  instanceColon: 'Instance:',
  // Custom tooltip, concatenated together
  getAnInstancePre: "Don't have an",
  getAnInstanceText: 'instance',
  getAnInstanceDescription: 'An instance is your Mastodon home server, such as mastodon.social or cybre.space.',
  getAnInstancePost: '?',
  joinMastodon: 'Join Mastodon!',
  instancesYouveLoggedInTo: "Instances you've logged in to:",
  addAnotherInstance: 'Add another instance',
  youreNotLoggedIn: "You're not logged in to any instances.",
  currentInstanceLabel: `{instance} {current, select,
    true {(current instance)}
    other {}
  }`,
  // Link text
  logInToAnInstancePre: '',
  logInToAnInstanceText: 'Log in to an instance',
  logInToAnInstancePost: 'to start using Enafore.',
  // Another custom tooltip
  showRingPre: 'Always show',
  showRingText: 'focus ring',
  showRingDescription: `The focus ring is the outline showing the currently focused element. By default, it's only
    shown when using the keyboard (not mouse or touch), but you may choose to always show it.`,
  showRingPost: '',
  instances: 'Instances',
  addInstance: 'Add instance',
  homeTimelineFilterSettings: 'Home timeline filter settings',
  showReblogs: 'Show boosts',
  showReplies: 'Show replies',
  switchOrLogOut: 'Switch to or log out of this instance',
  switchTo: 'Switch to this instance',
  switchToInstance: 'Switch to instance',
  switchToNameOfInstance: 'Switch to {instance}',
  logOut: 'Log out',
  logOutOfInstanceConfirm: 'Log out of {instance}?',
  notificationFilterSettings: 'Notification filter settings',
  // Push notifications
  browserDoesNotSupportPush: "Your browser doesn't support push notifications.",
  deniedPush: 'You have denied permission to show notifications.',
  pushNotificationsNote: 'Note that you can only have push notifications for one instance at a time.',
  pushSettings: 'Push notification settings',
  newFollowers: 'New followers',
  reblogs: 'Boosts',
  pollResults: 'Poll results',
  subscriptions: 'Subscribed posts',
  needToReauthenticate: 'You need to reauthenticate in order to enable push notification. Log out of {instance}?',
  failedToUpdatePush: 'Failed to update push notification settings: {error}',
  // Themes
  chooseTheme: 'Choose a theme',
  darkBackground: 'Dark background',
  lightBackground: 'Light background',
  themeLabel: `{label} {default, select,
    true {(default)}
    other {}
  }`,
  animatedImage: 'Animated image: {description}',
  showImage: `Show {animated, select,
    true {animated}
    other {}
  } image: {description}`,
  playVideoOrAudio: `Play {audio, select,
    true {audio}
    other {video}
  }: {description}`,
  accountFollowedYou: '{name} followed you, {account}',
  accountSignedUp: '{name} signed up, {account}',
  accountRequestedFollow: '{name} requested to follow you, {account}',
  accountReported: '{name} filed a report, {account}',
  reblogCountsHidden: 'Boost counts hidden',
  favoriteCountsHidden: 'Favorite counts hidden',
  reactionCountsHidden: 'Reaction counts hidden',
  rebloggedTimes: `Boosted {count, plural,
    one {1 time}
    other {{count} times}
  }`,
  favoritedTimes: `Favorited {count, plural,
    one {1 time}
    other {{count} times}
  }`,
  reactedTimes: `Reacted to {count, plural,
    one {1 time}
    other {{count} times}
  }`,
  pinnedStatus: 'Pinned post',
  rebloggedYou: 'boosted your post',
  favoritedYou: 'favorited your post',
  reacted: 'reacted with an emoji',
  followedYou: 'followed you',
  edited: 'edited their post',
  requestedFollow: 'requested to follow you',
  reported: 'filed a report',
  signedUp: 'signed up',
  posted: 'posted',
  pollYouCreatedEnded: 'A poll you created has ended',
  pollYouVotedEnded: 'A poll you voted on has ended',
  reblogged: 'boosted',
  favorited: 'favorited',
  unreblogged: 'unboosted',
  unfavorited: 'unfavorited',
  showSensitiveMedia: 'Show sensitive media',
  hideSensitiveMedia: 'Hide sensitive media',
  clickToShowSensitive: 'Sensitive content. Click to show.',
  longPost: 'Long post',
  // Accessible status labels
  accountRebloggedYou: '{account} boosted your post',
  accountFavoritedYou: '{account} favorited your post',
  accountEdited: '{account} edited their post',
  rebloggedByAccount: 'Boosted by {account}',
  contentWarningContent: 'Content warning: {spoiler}',
  hasMedia: 'has media',
  hasPoll: 'has poll',
  shortStatusLabel: '{privacy} post by {account}',
  // Privacy types
  public: 'Public',
  unlisted: 'Unlisted',
  followersOnly: 'Followers-only',
  direct: 'Direct',
  // Themes
  themeRoyal: 'Light',
  themeScarlet: 'Scarlet',
  themeSeafoam: 'Seafoam',
  themeHotpants: 'Hotpants',
  themeTangerine: 'Tangerine',
  themeOaken: 'Oaken',
  themeMajesty: 'Majesty',
  themeGecko: 'Gecko',
  themeGrayscale: 'Grayscale',
  themeOzark: 'Ozark',
  themeCobalt: 'Cobalt',
  themeSorcery: 'Sorcery',
  themePunk: 'Punk',
  themeEmber: 'Ember',
  themeRiot: 'Riot',
  themeHacker: 'Hacker',
  themeMastodon: 'Mastodon',
  themePitchBlack: 'Pitch Black',
  themeDarkGrayscale: 'Dark Grayscale',
  // Polls
  voteOnPoll: 'Vote on poll',
  pollChoices: 'Poll choices',
  vote: 'Vote',
  pollDetails: 'Poll details',
  refresh: 'Refresh',
  expires: 'Ends',
  expired: 'Ended',
  voteCount: `{count, plural,
    one {1 vote}
    other {{count} votes}
  }`,
  // Status interactions
  clickToShowThread: '{time} - click to show thread',
  showMore: 'Show more',
  showLess: 'Show less',
  closeReply: 'Close reply',
  cannotReblogFollowersOnly: 'Cannot be boosted because this is followers-only',
  cannotReblogDirectMessage: 'Cannot be boosted because this is a direct message',
  reblog: 'Boost',
  reply: 'Reply',
  replyToThread: 'Reply to thread',
  favorite: 'Favorite',
  unfavorite: 'Unfavorite',
  // timeline
  loadingMore: 'Loading more…',
  loadMore: 'Load more',
  showCountMore: 'Show {count} more',
  nothingToShow: 'Nothing to show.',
  // status thread page
  statusThreadPage: 'Thread page',
  status: 'Post',
  // toast messages
  blockedAccount: 'Blocked account',
  unblockedAccount: 'Unblocked account',
  unableToBlock: 'Unable to block account: {error}',
  unableToUnblock: 'Unable to unblock account: {error}',
  bookmarkedStatus: 'Bookmarked post',
  unbookmarkedStatus: 'Unbookmarked post',
  unableToBookmark: 'Unable to bookmark: {error}',
  unableToUnbookmark: 'Unable to unbookmark: {error}',
  cannotPostOffline: 'You cannot post while offline',
  unableToPost: 'Unable to post: {error}',
  statusDeleted: 'Post deleted',
  unableToDelete: 'Unable to delete post: {error}',
  cannotFavoriteOffline: 'You cannot favorite while offline',
  cannotUnfavoriteOffline: 'You cannot unfavorite while offline',
  unableToFavorite: 'Unable to favorite: {error}',
  unableToUnfavorite: 'Unable to unfavorite: {error}',
  followedAccount: 'Followed account',
  unfollowedAccount: 'Unfollowed account',
  unableToFollow: 'Unable to follow account: {error}',
  unableToUnfollow: 'Unable to unfollow account: {error}',
  accessTokenRevoked: 'The access token was revoked, logged out of {instance}',
  loggedOutOfInstance: 'Logged out of {instance}',
  failedToUploadMedia: 'Failed to upload media: {error}',
  mutedAccount: 'Muted account',
  unmutedAccount: 'Unmuted account',
  unableToMute: 'Unable to mute account: {error}',
  unableToUnmute: 'Unable to unmute account: {error}',
  mutedConversation: 'Muted conversation',
  unmutedConversation: 'Unmuted conversation',
  unableToMuteConversation: 'Unable to mute conversation: {error}',
  unableToUnmuteConversation: 'Unable to unmute conversation: {error}',
  unpinnedStatus: 'Unpinned post',
  unableToPinStatus: 'Unable to pin post: {error}',
  unableToUnpinStatus: 'Unable to unpin post: {error}',
  unableToRefreshPoll: 'Unable to refresh poll: {error}',
  unableToVoteInPoll: 'Unable to vote in poll: {error}',
  cannotReblogOffline: 'You cannot boost while offline.',
  cannotUnreblogOffline: 'You cannot unboost while offline.',
  failedToReblog: 'Failed to boost: {error}',
  failedToUnreblog: 'Failed to unboost: {error}',
  submittedReport: 'Submitted report',
  failedToReport: 'Failed to report: {error}',
  approvedFollowRequest: 'Approved follow request',
  rejectedFollowRequest: 'Rejected follow request',
  unableToApproveFollowRequest: 'Unable to approve follow request: {error}',
  unableToRejectFollowRequest: 'Unable to reject follow request: {error}',
  searchError: 'Error during search: {error}',
  hidDomain: 'Hid domain',
  unhidDomain: 'Unhid domain',
  unableToHideDomain: 'Unable to hide domain: {error}',
  unableToUnhideDomain: 'Unable to unhide domain: {error}',
  showingReblogs: 'Showing boosts',
  hidingReblogs: 'Hiding boosts',
  unableToShowReblogs: 'Unable to show boosts: {error}',
  unableToHideReblogs: 'Unable to hide boosts: {error}',
  unableToShare: 'Unable to share: {error}',
  unableToSubscribe: 'Unable to subscribe: {error}',
  unableToUnsubscribe: 'Unable to unsubscribe: {error}',
  showingOfflineContent: 'Internet request failed. Showing offline content.',
  youAreOffline: 'You seem to be offline. You can still read posts while offline.',
  // Snackbar UI
  updateAvailable: 'App update available.',
  // Word/phrase filters
  wordFilters: 'Word filters',
  noFilters: 'You don\'t have any word filters.',
  wordOrPhrase: 'Word or phrase',
  contexts: 'Contexts',
  addFilter: 'Add filter',
  editFilter: 'Edit filter',
  filterHome: 'Home and lists',
  filterNotifications: 'Notifications',
  filterPublic: 'Public timelines',
  filterThread: 'Conversations',
  filterAccount: 'Profiles',
  filterUnknown: 'Unknown',
  expireAfter: 'Expire after',
  whereToFilter: 'Where to filter',
  irreversible: 'Irreversible',
  wholeWord: 'Whole word',
  save: 'Save',
  updatedFilter: 'Updated filter',
  createdFilter: 'Created filter',
  failedToModifyFilter: 'Failed to modify filter: {error}',
  deletedFilter: 'Deleted filter',
  required: 'Required',
  // Dialogs
  profileOptions: 'Profile options',
  copyLink: 'Copy link',
  emoji: 'Emoji',
  editMedia: 'Edit media',
  shortcutHelp: 'Shortcut help',
  statusOptions: 'Status options',
  confirm: 'Confirm',
  closeDialog: 'Close dialog',
  postPrivacy: 'Post privacy',
  localOnly: 'Local only',
  contentType: 'Content type',
  contentTypeLabel: 'Change content type (currently {label})',
  homeOnInstance: 'Home on {instance}',
  statusesTimelineOnInstance: 'Statuses: {timeline} timeline on {instance}',
  statusesHashtag: 'Statuses: #{hashtag} hashtag',
  statusesThread: 'Statuses: thread',
  statusesAccountTimeline: 'Statuses: account timeline',
  statusesList: 'Statuses: list',
  notificationsOnInstance: 'Notifications on {instance}',
  // Details
  statusEdited: 'Edited'
}
