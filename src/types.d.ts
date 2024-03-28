export type WordDictVal = {
  id: string
  sentence: string
}

export type WordDict = {
  [word: string]: WordDictVal[]
}

export type SuccessResponse = {
  success: boolean
  msg?: string
}

export type SearchResultItem = {
  tabId: number
  windowId: number
  icon?: string
  title: string
  subTitle: string
  nodeId: string
  score: number
}

export type SentenceDict = {
  [nodeId: string]: string
}

export type JumpToTabParams = {
  tabId: number
  nodeId?: string
}

export type Action = {
  submitWordDict: [TransformDict, void]
  searchFromWords: [string[], SearchResultItem[]]
  jumpToTab: [JumpToTabParams, SuccessResponse]
}

export type Message<T extends keyof Action> = {
  actionName: T
  data: Action[T][0]
}

export type TransformDict = {
  wordDict: WordDict
  sentenceDict: SentenceDict
}
