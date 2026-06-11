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
  if (coverUrl) {
    if (isOpenLibrary(coverUrl)) {
      return <Image src={coverUrl} alt={title} className={className} width={96} height={144} />
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverUrl} alt={title} className={className} loading='lazy' decoding='async' />
  }
  if (!placeholderClassName) return null
  return (
    <div className={`flex shrink-0 items-center justify-center ${placeholderClassName}`}>
      📖
    </div>
  )
}
