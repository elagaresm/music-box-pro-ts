function Collage({ images }: { images: string[] }): JSX.Element {
  if (images.length === 1) {
    return <img src={images[0]} alt="artist thumbnail" className="w-full rounded aspect-square" />
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2">
      {images.map((image, index) => {
        return <img key={index} src={image} alt="artist thumbnail" className="object-cover" />
      })}
    </div>
  )
}

export default Collage
