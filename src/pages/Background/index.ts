import { MessageHandler } from '@/helper/message'
import type { SearchResult, TransformDict, WordDictVal } from '@/types'

const tabDicts: {
  [tabId: number]: {
    tab: chrome.tabs.Tab
    data: TransformDict
  }
} = {}

chrome.storage.session.get('tabDicts').then((res) => {
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
  var idMap = new Map<string, number>()
  for (let column of list) {
    for (let it of column) {
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

function searchFromWords(words: string[]): SearchResult[] {
  const resList: SearchResult[] = []
  for (let tabId in tabDicts) {
    const {
      tab: tabInfo,
      data: { sentenceDict, wordDict },
    } = tabDicts[tabId]
    const hasList: WordDictVal[][] = Array.from(words, (v) => {
      if (v in wordDict) {
        return wordDict[v]
      }
      return []
    }).filter((l) => l.length > 0)
    resList.push(
      ...intersectionList(hasList).map<SearchResult>((val) => {
        return {
          title: tabInfo.title!,
          icon: tabInfo.favIconUrl!,
          nodeId: val.id,
          score: val.score,
          tabId: tabInfo.id!,
          subTitle: sentenceDict[val.id],
        }
      })
    )
  }
  return resList
}

const messageHandler = new MessageHandler()
messageHandler.addHandler('submitWordDict', (data, sender, sendResp) => {
  const senderTab = sender.tab
  tabDicts[senderTab?.id ?? 0] = {
    tab: senderTab!,
    data,
  }
  saveTabDicts()
})

messageHandler.addHandler('searchFromWords', (data, sender, sendResp) => {
  const res = searchFromWords(data)
  sendResp(res)
})

chrome.tabs.onRemoved.addListener((tabId, info) => {
  if (tabId in tabDicts) {
    delete tabDicts[tabId]
  }
  saveTabDicts()
})
