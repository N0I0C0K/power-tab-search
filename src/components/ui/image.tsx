import React, { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { FC } from 'react'
import { Skeleton } from './skeleton'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  asChild?: boolean
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(props => {
  const [loaded, setLoaded] = useState<'loading' | 'success' | 'failed'>('loading')
  const loadRef = useRef(loaded)
  useEffect(() => {
    loadRef.current = loaded
  }, [loaded])
  useEffect(() => {
    setTimeout(() => {
      console.log(loadRef)
      if (loadRef.current !== 'success') {
        setLoaded('failed')
      }
    }, 1000)
  }, [])
  return (
    <>
      {loaded !== 'failed' ? (
        <img
          {...props}
          alt=""
          onLoad={() => {
            setLoaded('success')
          }}
          style={{
            width: loaded !== 'success' ? '1px' : 'auto',
          }}
        />
      ) : null}
      {loaded !== 'success' ? <Skeleton className="h-10 w-10" /> : null}
    </>
  )
})

Image.displayName = 'Image'
