import '@pages/popup/Popup.css'

import React, { useState, useMemo } from 'react'

import withSuspense from '@src/shared/hoc/withSuspense'
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary'
import { Button } from '@src/components/ui/button'
import { Input } from '@src/components/ui/input'
import { sendMessage } from '@shared/helper/message'

import { splitTextBySegment } from '@src/shared/helper/segment'

import lastSearchResultStorage from '@src/shared/storages/lastResultStorage'
import useStorage from '@src/shared/hooks/useStorage'
import { ResultItem } from './ResultItem'
import { ResultDisplay } from './ResultDisplay'

const Popup = () => {
  const [text, setText] = useState('')
  const result = useStorage(lastSearchResultStorage)
  const [query, setQuery] = useState<string[]>(result.query)
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
              lastSearchResultStorage.set({
                query: words,
                result: data.result,
                time: Date(),
              })
              console.log(data)
            })
          }}>
          Search
        </Button>
      </div>
      {result && result.result && result.result.length > 0 ? (
        <ResultDisplay query={query} resultList={result.result} />
      ) : null}
    </div>
  )
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>)
