export type WordDictVal = {
  id: string
  sentence: string
}

export type WordDict = {
  [word: string]: WordDictVal[]
}

export type SearchResult = {
  tabId: number
  icon: string
  title: string
  subTitle: string
  nodeId: string
  score: number
}

export type SentenceDict = {
  [nodeId: string]: string
}

export type Action = 'submitWordDict' | 'searchFromWords'

export type Message<T> = {
  actionName: Action
  data: T
}

export type TransformDict = {
  wordDict: WordDict
  sentenceDict: SentenceDict
}
