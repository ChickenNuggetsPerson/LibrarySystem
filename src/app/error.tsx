'use client' // Error boundaries must be Client Components

import Divider from '@/components/Forms/Divider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  function returnClick() {
    reset()
    router.replace("/")
  }

  return (
    <div className='card w-md'>
      <h1 className='font-bold text-2xl text-text'>Whoops! There was an error...</h1>
      <Divider mb={10} />

      <p className='text-text font-mono'>Message:</p>
      <div className='bg-background rounded-2xl' style={{ padding: 15 }}>
        <p className='text-text font-mono'>{error.message}</p>
      </div>

      <div style={{ height: 30 }}></div>

      <button className="w-full" onClick={returnClick}>
        <div className="primary-button text-center">
          Back to Home
        </div>
      </button>

    </div>
  )
}