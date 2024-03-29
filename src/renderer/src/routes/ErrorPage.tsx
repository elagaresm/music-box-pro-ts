import { useRouteError, Link } from "react-router-dom"
import React from 'react'

const ErrorPage = () => {
  const error = useRouteError()

  console.log(error)

  return (
    <div className="text-white">
      <h1>Error page</h1>
      <Link to="/" className="bg-white text-black rounded-md px-2 hover:text-red-300">Go back to the main page</Link>
    </div>
  )
}

export default ErrorPage
