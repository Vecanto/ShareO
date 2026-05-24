import DownloadPage from '@/components/DownloadPage'

export const metadata = {
  title: 'Download — ShareO',
}

export default async function DownloadPageWrapper(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  return <DownloadPage id={params.id} />
}
