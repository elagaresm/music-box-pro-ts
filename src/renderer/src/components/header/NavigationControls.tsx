import { IoIosArrowBack as ArrowBack, IoIosArrowForward as ArrowForward } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'

export default function NavigationControls() {
  const navigate = useNavigate()

  return (
    <>
      <button>
        <ArrowBack
          onClick={() => navigate(-1)}
          className="text-outline mr-1 hover:text-white text-xl"
        />
      </button>
      <button>
        <ArrowForward
          onClick={() => navigate(1)}
          className="text-outline mr-1 hover:text-white text-xl"
        />
      </button>
    </>
  )
}
