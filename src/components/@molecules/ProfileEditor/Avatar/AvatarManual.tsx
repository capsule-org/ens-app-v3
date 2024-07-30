/* eslint-disable no-multi-assign */

import { sha256 } from '@noble/hashes/sha256'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { bytesToHex } from 'viem'
import { useAccount, useSignTypedData } from 'wagmi'

import { Button, Dialog, Helper, Input } from '@ensdomains/thorin'

import { useChainName } from '@app/hooks/chain/useChainName'

type AvatarUploadResult =
  | {
      message: string
    }
  | {
      error: string
      status: number
    }

type AvatarManualProps = {
  name: string
  handleCancel: () => void
  handleSubmit: (type: 'manual', uri: string, display?: string) => void
}

function isValidHttpUrl(value: string) {
  let url

  try {
    url = new URL(value)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

const dataURLToBytes = (dataURL: string) => {
  const base64 = dataURL.split(',')[1]
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return bytes
}

export function AvatarManual({ name, handleCancel, handleSubmit }: AvatarManualProps) {
  const { t } = useTranslation('transactionFlow')
  const queryClient = useQueryClient()
  const chainName = useChainName()

  const { address } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
  const [value, setValue] = useState<string>('')

  const {
    mutate: signAndUpload,
    isPending,
    error,
  } = useMutation<void, Error>({
    mutationFn: async () => {
      let baseURL = process.env.NEXT_PUBLIC_AVUP_ENDPOINT || `https://euc.li`
      if (chainName !== 'mainnet') {
        baseURL = `${baseURL}/${chainName}`
      }
      const endpoint = `${baseURL}/${name}`

      const dataURL = await fetch(value)
        .then((res) => res.blob())
        .then((blob) => {
          return new Promise<string>((res) => {
            const reader = new FileReader()

            reader.onload = (e) => {
              if (e.target) res(e.target.result as string)
            }

            reader.readAsDataURL(blob)
          })
        })

      const urlHash = bytesToHex(sha256(dataURLToBytes(dataURL)))
      const expiry = `${Date.now() + 1000 * 60 * 60 * 24 * 7}`

      const sig = await signTypedDataAsync({
        primaryType: 'Upload',
        domain: {
          name: 'Ethereum Name Service',
          version: '1',
        },
        types: {
          Upload: [
            { name: 'upload', type: 'string' },
            { name: 'expiry', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'hash', type: 'string' },
          ],
        },
        message: {
          upload: 'avatar',
          expiry,
          name,
          hash: urlHash,
        },
      })
      const fetched = (await fetch(endpoint, {
        method: 'PUT',
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiry,
          dataURL,
          sig,
          unverifiedAddress: address,
        }),
      }).then((res) => res.json())) as AvatarUploadResult

      if ('message' in fetched && fetched.message === 'uploaded') {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const {
              queryKey: [params],
            } = query
            if (params !== 'ensAvatar') return false
            return true
          },
        })
        return handleSubmit('manual', endpoint, value)
      }

      if ('error' in fetched) {
        throw new Error(fetched.error)
      }

      throw new Error('Unknown error')
    },
  })

  return (
    <>
      <Dialog.Heading title={t('input.profileEditor.tabs.avatar.dropdown.enterManually')} />
      <Dialog.Content>
        <Input
          label={t('input.profileEditor.tabs.avatar.label')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Dialog.Content>
      {error && (
        <Helper data-testid="avatar-upload-error" type="error">
          {error.message}
        </Helper>
      )}
      <Dialog.Footer
        leading={
          <Button colorStyle="accentSecondary" onClick={() => handleCancel()}>
            {t('action.back', { ns: 'common' })}
          </Button>
        }
        trailing={
          <Button
            disabled={isPending || !isValidHttpUrl(value)}
            colorStyle={error ? 'redSecondary' : undefined}
            onClick={() => signAndUpload()}
          >
            {error ? t('action.tryAgain', { ns: 'common' }) : t('action.confirm', { ns: 'common' })}
          </Button>
        }
      />
    </>
  )
}
