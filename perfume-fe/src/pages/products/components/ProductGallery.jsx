import { useMemo, useState } from 'react'

const ProductGallery = ({ images = [], thumbnail, name }) => {
  const allImages = useMemo(() => {
    const list = Array.isArray(images) ? images : []
    const urls = list
      .slice()
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
      .map((i) => i?.url)
      .filter(Boolean)

    if (thumbnail && !urls.includes(thumbnail)) urls.unshift(thumbnail)
    return urls
  }, [images, thumbnail])

  const [activeIndex, setActiveIndex] = useState(0)

  const activeUrl = allImages[activeIndex] || thumbnail

  return (
    <div className="w-full">
      <div className="relative w-full bg-white border border-black/5 rounded-2xl overflow-hidden">
        <img
          src={activeUrl}
          alt={name}
          className="block w-full aspect-square object-contain"
          loading="lazy"
        />
      </div>

      {allImages.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
          {allImages.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              className={`bg-white border rounded-xl overflow-hidden cursor-pointer ${
                idx === activeIndex ? 'border-black/40' : 'border-black/10 hover:border-black/25'
              } transition-colors`}
              onClick={() => setActiveIndex(idx)}
            >
              <img
                src={url}
                alt={`${name}-${idx}`}
                className="block w-full aspect-square object-contain"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ProductGallery

