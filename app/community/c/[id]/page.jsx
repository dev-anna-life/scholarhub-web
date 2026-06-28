'use client'
import CommunityView from '../../../../src/views/CommunityView'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams()
  return <CommunityView communityId={params.id} />
}
