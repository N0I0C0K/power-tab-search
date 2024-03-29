import '@pages/popup/Popup.css'

import React, { useState, useMemo } from 'react'

import withSuspense from '@src/shared/hoc/withSuspense'
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary'
import { SearchResultItem } from '@src/types'
import { Button } from '@src/components/ui/button'
import { Input } from '@src/components/ui/input'
import { Skeleton } from '@src/components/ui/skeleton'
import { sendMessage, sendMessageToTab } from '@shared/helper/message'
import { useEffect } from 'react'
import { Image } from '@src/components/ui/image'

async function jumpToTab(result: SearchResultItem) {
  await chrome.windows.update(result.windowId, {
    focused: true,
  })
  await chrome.tabs
    .update(result.tabId, {
      active: true,
    })
    .then(val => {
      sendMessageToTab(val.id!, 'jumpToTab', {
        tabId: val.id!,
        nodeId: result.nodeId,
      })
    })
}

const ResultItem: React.FC<SearchResultItem> = res => {
  return (
    <div className="flex gap-2 p-2 shadow-sm border rounded-md duration-200 hover:shadow-lg hover:translate-x-1 cursor-pointer">
      <Image src={res.icon} />
      <div className="flex-1">
        <h3>{res.title}</h3>
        <p>{res.subTitle}</p>
      </div>
      <Button
        variant={'ghost'}
        onClick={() => {
          jumpToTab(res)
        }}>
        Jump
      </Button>
    </div>
  )
}

const Popup = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState<SearchResultItem[]>([
    {
      nodeId: '1',
      windowId: 11,
      score: 1,
      subTitle: 'test....',
      tabId: 11111,
      title: 'Test!!!',
    },
  ])
  const [segment] = useState(new Intl.Segmenter('zh', { granularity: 'word' }))
  const splitText = useMemo(() => {
    return (text: string): string[] => {
      return Array.from(segment.segment(text.toLocaleLowerCase()), v => v.segment.trim()).filter(x => x.length > 0)
    }
  }, [segment])
  return (
    <div className="App p-4 flex-col gap-2">
      <div className="flex gap-4">
        <Input
          value={text}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={true}
          placeholder="text to search"
          onChange={ev => {
            setText(ev.target.value)
          }}
        />
        <Button
          onClick={() => {
            const words = splitText(text)
            console.log(words)
            sendMessage('searchFromWords', words, data => {
              setResult(data)
              console.log(data)
            })
          }}>
          Search
        </Button>
      </div>
      <div className="flex flex-col gap-2 pt-2 pb-2">
        {result?.map(v => {
          return <ResultItem key={v.nodeId} {...v} />
        })}
      </div>
    </div>
  )
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>)
