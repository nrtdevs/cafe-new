import { useCallback, useState } from 'react'

function HandleModal(): [boolean, () => void] {
  const [showModal, setShowModal] = useState<any>(false)

  const handleModal = useCallback(() => {
    // log(showModal, 'sad', !showModal)
    setShowModal(!showModal)
  }, [showModal])

  return [showModal, handleModal]
}

export { HandleModal as useModal }
