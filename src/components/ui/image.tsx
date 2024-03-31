import React, { useState, useEffect, useRef } from 'react'
import { Skeleton } from './skeleton'
import { twMerge } from 'tailwind-merge'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(props => {
  const [loaded, setLoaded] = useState<'loading' | 'success' | 'failed'>('loading')
  const loadRef = useRef(loaded)
  useEffect(() => {
    loadRef.current = loaded
  }, [loaded])
  useEffect(() => {
    setTimeout(() => {
      if (loadRef.current !== 'success') {
        setLoaded('failed')
      }
    }, 2000)
  }, [])
  const className = twMerge('h-10 w-10', props.className)
  return (
    <div>
      {loaded !== 'failed' ? (
        <img
          {...props}
          alt=""
          onLoad={() => {
            setLoaded('success')
          }}
          style={{
            width: loaded !== 'success' ? '0px' : 'auto',
          }}
          className={loaded === 'success' ? className : ''}
        />
      ) : null}
      {loaded !== 'success' ? <Skeleton className={className} /> : null}
    </div>
  )
})

Image.displayName = 'Image'
