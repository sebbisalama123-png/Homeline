import { useState } from 'react'
import type { ImgHTMLAttributes } from 'react'

type SmartImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  wrapperClassName?: string
}

export default function SmartImage({
  wrapperClassName,
  className,
  onLoad,
  onError,
  ...props
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <span
      className={`smart-image ${isLoaded ? 'is-loaded' : ''} ${wrapperClassName ?? ''}`.trim()}
    >
      <img
        {...props}
        className={className}
        onLoad={(event) => {
          setIsLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          setIsLoaded(true)
          onError?.(event)
        }}
      />
    </span>
  )
}
