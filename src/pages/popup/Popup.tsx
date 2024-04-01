import '@pages/popup/Popup.css'

import React, { useState, useMemo } from 'react'

import withSuspense from '@src/shared/hoc/withSuspense'
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary'
import { SearchResultDict, SearchResultItem, SearchResultValue } from '@src/types'
import { Button } from '@src/components/ui/button'
import { Input } from '@src/components/ui/input'
import { sendMessage, sendMessageToTab } from '@shared/helper/message'
import { Image } from '@src/components/ui/image'
import { Typography } from '@src/components/ui/Typography'
import { splitTextBySegment } from '@src/shared/helper/segment'

async function jumpToTab(result: SearchResultItem, windowId: number, tabId: number) {
  await chrome.windows.update(windowId, {
    focused: true,
  })
  await chrome.tabs
    .update(tabId, {
      active: true,
    })
    .then(val => {
      sendMessageToTab(val.id!, 'jumpToTab', {
        tabId: val.id!,
        nodeId: result.nodeId,
      })
    })
}

const ResultItem: React.FC<{ res: SearchResultValue; query?: string[] }> = ({ res, query }) => {
  return (
    <div className="flex flex-col p-2 gap-2">
      <div className="flex gap-2 items-center">
        <Image src={res.tabInfo.icon ?? ''} />
        <Typography variant="h4">{res.tabInfo.title}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        {res.match.map(val => {
          return (
            <div key={val.nodeId} className="flex flex-row items-center rounded-sm p-1">
              <Typography variant="p" highLihgt={query} className="flex-1">
                {val.subTitle}
              </Typography>
              <Button
                variant={'ghost'}
                onClick={() => {
                  jumpToTab(val, res.tabInfo.windowId, res.tabInfo.tabId)
                }}>
                Jump
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Popup = () => {
  const [text, setText] = useState('')
  const [query, setQuery] = useState<string[]>([])
  const [result, setResult] = useState<SearchResultDict>({
    '12121': {
      tabInfo: {
        tabId: 1,
        title: 'Test Title',
        windowId: 11,
      },
      match: [{ nodeId: '111', score: 1, subTitle: 'test!test2' }],
    },
  })
  const [segment] = useState(new Intl.Segmenter('zh', { granularity: 'word' }))
  const splitText = useMemo(() => {
    return (text: string): string[] => {
      return splitTextBySegment(text, segment)
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
            setQuery(words)
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
        {result === undefined
          ? null
          : Object.keys(result).map(tabId => {
              return <ResultItem key={tabId} res={result[tabId]} query={query} />
            })}
      </div>
    </div>
  )
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>)
