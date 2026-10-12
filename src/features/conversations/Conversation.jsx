import { zodResolver } from '@hookform/resolvers/zod'
import { MessageCircle, Send } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Skeleton from '../../components/ui/Skeleton'
import { cn } from '../../lib/cn'
import { formatDateOnly } from '../../lib/formatDate'
import { useToast } from '../../components/ui/toast-context'
import { useMessages, useSendMessage } from './hooks'

const schema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Tulis pesan dulu, ya.')
    .max(1000, 'Pesan terlalu panjang.'),
})

export function Conversation({ kode, viewer }) {
  const { data, isLoading, isError, refetch } = useMessages(kode)
  const sendMessage = useSendMessage(kode)
  const toast = useToast()
  const listRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { body: '' } })

  useEffect(() => {
    if (data && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [data])

  const labelFor = (message) => {
    if (viewer === 'santri') {
      return message.from === 'santri' ? 'Kamu' : 'Petugas'
    }
    return message.from === 'santri' ? 'Pelapor' : message.senderName || 'Petugas'
  }

  const isOwn = (message) =>
    viewer === 'santri' ? message.from === 'santri' : message.from === 'petugas'

  const onSubmit = async (values) => {
    try {
      await sendMessage.mutateAsync(values.body)
      reset()
    } catch (error) {
      toast.showToast(error?.message ?? 'Pesan gagal dikirim.', 'error')
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-xl">Percakapan</h2>
      <p className="mt-0.5 text-sm text-body">
        {viewer === 'santri'
          ? 'Balasan petugas akan muncul di sini.'
          : 'Pelapor selalu tampil sebagai "Pelapor".'}
      </p>

      <div
        ref={listRef}
        className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1"
      >
        {isLoading ? (
          <>
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="ml-auto h-14 w-2/3" />
          </>
        ) : isError ? (
          <ErrorState
            title="Percakapan gagal dimuat"
            message="Coba muat ulang percakapan."
            onRetry={refetch}
          />
        ) : data?.length ? (
          data.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex flex-col gap-1 rounded-2xl px-4 py-3',
                isOwn(message)
                  ? 'self-end bg-primary text-white'
                  : 'self-start bg-band-1 text-navy',
              )}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className={isOwn(message) ? 'text-white' : 'text-primary'}>
                  {labelFor(message)}
                </span>
                <span className={isOwn(message) ? 'text-white/70' : 'text-body'}>
                  {formatDateOnly(message.createdAt)}
                </span>
              </div>
              <p data-pre-wrap className="text-sm">
                {message.body}
              </p>
            </div>
          ))
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="Belum ada pesan"
            description="Pesan pertama bisa membuka jalan untuk dibantu."
            className="border-none bg-transparent py-6"
          />
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex items-end gap-2"
        autoComplete="off"
        noValidate
      >
        <div className="flex-1">
          <label htmlFor="message-body" className="sr-only">
            Pesan
          </label>
          <textarea
            id="message-body"
            rows={2}
            autoComplete="off"
            placeholder="Tulis pesan…"
            className={cn(
              'w-full rounded-2xl border bg-white px-4 py-3 text-navy placeholder:text-body/60 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/30',
              errors.body ? 'border-danger' : 'border-border',
            )}
            {...register('body')}
          />
          {errors.body ? (
            <p role="alert" className="mt-1 text-sm text-danger">
              {errors.body.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" size="icon" loading={isSubmitting} aria-label="Kirim pesan">
          <Send aria-hidden="true" className="size-5" />
        </Button>
      </form>
    </Card>
  )
}
