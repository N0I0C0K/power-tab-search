import { nanoid } from 'nanoid'
import { SentenceDict, TransformDict, WordDict } from '@src/types'
import { MessageHandler, sendMessage } from '@src/shared/helper/message'
import refreshOnUpdate from 'virtual:reload-on-update-in-view'
refreshOnUpdate('pages/content/injected/parseContent')

type TextElement = {
  text: string
  node: Node
}

let textElements: TextElement[] = []
let idNodeDict: {
  [key: string]: Node
} = {}

async function getAllTextRecursion(node: Node | undefined) {
  if (node === undefined) {
    return
  }
  if (node.nodeType === Node.TEXT_NODE) {
    console.log('deep')
    textElements.push({
      text: node.textContent ?? '',
      node: node,
    })
  } else {
    for (const child of node.childNodes) {
      await getAllTextRecursion(child)
    }
  }
}

async function refreshTextElemnts() {
  textElements = []
  await getAllTextRecursion(document.getElementById('editor-1'))
}

async function generateDictFromTexts(): Promise<TransformDict> {
  idNodeDict = {}
  const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
  const wordDict: WordDict = {}
  const id2Sentence: SentenceDict = {}
  for (const { node, text } of textElements) {
    const textId = nanoid()
    const insertObj = {
      id: textId,
      sentence: text,
    }
    idNodeDict[textId] = node
    id2Sentence[textId] = text

    for (const seg of segmenter.segment(text)) {
      if (!(seg.segment in wordDict)) {
        wordDict[seg.segment] = []
      }
      wordDict[seg.segment].push(insertObj)
    }
  }
  return {
    wordDict,
    sentenceDict: id2Sentence,
  }
}

setTimeout(() => {
  refreshTextElemnts().then(async () => {
    const transformData = await generateDictFromTexts()
    await sendMessage('submitWordDict', transformData)
  })
}, 1000)

const messageHandler = new MessageHandler()
messageHandler.addHandler('jumpToTab', (data, sender, sendResp) => {
  if (data.nodeId !== undefined && data.nodeId in idNodeDict) {
    const node = idNodeDict[data.nodeId]
    node.parentElement.scrollIntoView()
    sendResp({
      success: true,
    })
    return
  }
  sendResp({
    success: false,
  })
})
