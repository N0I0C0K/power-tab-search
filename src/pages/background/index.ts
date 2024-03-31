import reloadOnUpdate from 'virtual:reload-on-update-in-background-script'
import 'webextension-polyfill'
import { MessageHandler } from '@src/shared/helper/message'
import type { SearchResultItem, TransformDict, WordDictVal } from '@src/types'

reloadOnUpdate('pages/background')

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
//reloadOnUpdate('pages/content/style.scss');

const tabDicts: {
  [tabId: number]: {
    windowId: number
    tab: chrome.tabs.Tab
    data: TransformDict
  }
} = {}

chrome.storage.session.get('tabDicts').then(res => {
  Object.assign(tabDicts, res['tabDicts'])
})

function saveTabDicts() {
  chrome.storage.session.set({
    tabDicts,
  })
}

function intersectionList(list: WordDictVal[][]): {
  id: string
  score: number
}[] {
  if (list.length === 0) return []
  const idMap = new Map<string, number>()
  for (const column of list) {
    for (const it of column) {
      if (idMap.has(it.id)) {
        idMap.set(it.id, idMap.get(it.id)! + 1)
      } else {
        idMap.set(it.id, 1)
      }
    }
  }
  return Array.from(idMap, ([key, val]) => {
    return {
      id: key,
      score: val,
    }
  })
    .sort((lt, rt) => rt.score - lt.score)
    .slice(0, 5)
}

function searchFromWords(words: string[]): SearchResultItem[] {
  const resList: SearchResultItem[] = []
  for (const tabId in tabDicts) {
    const {
      tab: tabInfo,
      data: { sentenceDict, wordDict },
    } = tabDicts[tabId]
    const hasList: WordDictVal[][] = Array.from(words, v => {
      if (v in wordDict) {
        return wordDict[v]
      }
      return []
    }).filter(l => l.length > 0)
    resList.push(
      ...intersectionList(hasList).map<SearchResultItem>(val => {
        return {
          title: tabInfo.title!,
          icon: tabInfo.favIconUrl!,
          nodeId: val.id,
          score: val.score,
          tabId: tabInfo.id!,
          subTitle: sentenceDict[val.id],
          windowId: tabInfo.windowId,
        }
      }),
    )
  }
  return resList
}

const messageHandler = new MessageHandler()
messageHandler.addHandler('submitWordDict', async (data, sender, sendResp) => {
  const senderTab = sender.tab
  tabDicts[senderTab?.id ?? 0] = {
    tab: senderTab!,
    data,
    windowId: senderTab.windowId,
  }
  saveTabDicts()
})

messageHandler.addHandler('searchFromWords', async (data, sender, sendResp) => {
  const res = searchFromWords(data)
  sendResp(res)
})

chrome.tabs.onRemoved.addListener((tabId, info) => {
  if (tabId in tabDicts) {
    delete tabDicts[tabId]
  }
  saveTabDicts()
})

chrome.commands.onCommand.addListener((command, tab) => {
  console.log(command)
  if (command === 'open_popup') {
    chrome.action.openPopup()
  }
})

console.log('background loaded')
