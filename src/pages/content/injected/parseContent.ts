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

function isInViewport(element: Element) {
  const rect = element.getBoundingClientRect()
  return rect.top >= 10 && rect.left >= 10
}

function getAllTextRecursion(node: Node | undefined) {
  if (node === undefined) {
    return
  }
  if (node.nodeType === Node.TEXT_NODE && isInViewport(node.parentElement)) {
    const text = node.textContent.trim().toLocaleLowerCase()
    if (text.length > 0) {
      textElements.push({
        text: text ?? '',
        node: node,
      })
    }
  }
  for (const child of node.childNodes) {
    getAllTextRecursion(child)
  }
}

async function refreshTextElemnts() {
  textElements = []
  await getAllTextRecursion(document.getElementsByTagName('body')[0])
}

async function generateDictFromTexts(): Promise<TransformDict> {
  idNodeDict = {}
  const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
  const wordDict: WordDict = {}
  const id2Sentence: SentenceDict = {}
  const ln = textElements.length
  textElements.forEach(({ node, text }, idx) => {
    const textId = nanoid()
    const insertObj = {
      id: textId,
      sentence: text,
    }
    idNodeDict[textId] = node
    if (text.length < 10) {
      console.log(text)
      id2Sentence[textId] =
        (idx > 0 ? textElements[idx - 1].text : '') + text + (idx < ln - 1 ? textElements[idx + 1].text : '')
      console.log(id2Sentence[textId])
    } else {
      id2Sentence[textId] = text
    }

    for (const seg of segmenter.segment(text)) {
      const segText = seg.segment.trim()
      if (segText.length === 0) {
        continue
      }
      if (!(segText in wordDict)) {
        wordDict[segText] = []
      }
      wordDict[segText].push(insertObj)
    }
  })

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
messageHandler.addHandler('jumpToTab', async (data, sender, sendResp) => {
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
