function Collage({ images }: { images: string[] }): JSX.Element {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2">
      {images.map((image, index) => {
        return <img key={index} src={image} alt="cover" className="w-full h-full object-cover" />
      })}
    </div>
  )
}

export default Collage
