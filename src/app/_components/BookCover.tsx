'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  coverUrl: string | null;
  title: string;
  className: string;
  placeholderClassName?: string;
};

const isOpenLibrary = (url: string) => {
  try {
    return new URL(url).hostname === 'covers.openlibrary.org'
  } catch {
    return false
  }
}

export const BookCover = ({ coverUrl, title, className, placeholderClassName }: Props) => {
  const [loaded, setLoaded] = useState(false)

  if (coverUrl) {
    const handleLoad = () => setLoaded(true)
    const skeletonClass = `book-cover-skeleton ${loaded ? 'is-loaded' : ''} ${className}`

    if (isOpenLibrary(coverUrl)) {
      return (
        <div className={skeletonClass}>
          <Image
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover"
            width={96}
            height={144}
            onLoad={handleLoad}
          />
        </div>
      )
    }
    return (
      <div className={skeletonClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading='lazy'
          decoding='async'
          onLoad={handleLoad}
        />
      </div>
    )
  }
  if (!placeholderClassName) return null
  return (
    <div className={`flex shrink-0 items-center justify-center ${placeholderClassName}`}>
      📖
    </div>
  )
}
