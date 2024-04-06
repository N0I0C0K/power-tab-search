import { BaseStorage, createStorage, StorageType } from '@shared/storages/base'
import type { SearchResultDict } from '@src/types'

type SearchResult = {
  query: string[]
  time: string
  result: SearchResultDict
}

const lastSearchResultStorage = createStorage<SearchResult>(
  'last-search-result',
  {
    query: [],
    time: '',
    result: {},
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
)
export default lastSearchResultStorage
