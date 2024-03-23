import type {
  Action,
  Message,
  SearchResult,
  TransformDict,
  WordDictVal,
} from '../../types'

const tabDicts: {
  [tabId: number]: {
    tab: chrome.tabs.Tab
    data: TransformDict
  }
} = {}

const messageHandleList:{
  [action:Action]: 
} = {}

chrome.runtime.onMessage.addListener(
  (msg: Message<any>, sender, senderResp) => {
    console.log(msg)
    const senderTab = sender.tab
    console.log(senderTab)
    tabDicts[senderTab?.id ?? 0] = {
      tab: senderTab!,
      data: msg,
    }
  }
)

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
    .sort((lt, rt) => lt.score - rt.score)
    .slice(0, 4)
}

async function searchFromWords(words: string[]): Promise<SearchResult[]> {
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
