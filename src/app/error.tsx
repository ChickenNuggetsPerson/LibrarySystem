'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    <Card className='w-md'>
      <CardContent>
        <h1 className='font-bold text-2xl text-text'>Whoops! There was an error...</h1>
        <Separator />

        <p className='text-text font-mono'>Message:</p>
        <div className='bg-background rounded-2xl' style={{ padding: 15 }}>
          <p className='text-text font-mono'>{error.message}</p>
        </div>

        <div style={{ height: 30 }}></div>

        <Button className="w-full" onClick={returnClick}>
          <div className="primary-button text-center">
            Back to Home
          </div>
        </Button>
      </CardContent>
    </Card>
  )
}