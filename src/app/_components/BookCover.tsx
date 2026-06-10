type Props = {
  coverUrl: string | null;
  title: string;
  className: string;
  placeholderClassName?: string;
};

export const BookCover = ({ coverUrl, title, className, placeholderClassName }: Props) => {
  if (coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverUrl} alt={title} className={className} />
  }
  if (!placeholderClassName) return null
  return (
    <div className={`flex shrink-0 items-center justify-center ${placeholderClassName}`}>
      📖
    </div>
  )
}
