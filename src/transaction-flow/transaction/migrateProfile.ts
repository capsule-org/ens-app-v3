import type { TFunction } from 'react-i18next'
import { PublicENS, TransactionDisplayItem, Transaction } from '@app/types'
import type { JsonRpcSigner } from '@ethersproject/providers'

type Data = {
  name: string
}

const displayItems = (
  { name }: Data,
  t: TFunction<'translation', undefined>,
): TransactionDisplayItem<'name'>[] => [
  {
    label: 'action',
    value: t(`transaction.description.migrateProfile`),
  },
  {
    label: 'info',
    value: t(`transaction.info.migrateProfile`),
  },
  {
    label: 'name',
    value: name,
    type: 'name',
  },
]

const transaction = async (signer: JsonRpcSigner, ens: PublicENS, data: Data) => {
  const profile = await ens.getProfile(data.name)
  if (!profile) throw new Error('No profile found')
  if (!profile.records) throw new Error('No records found')
  const { contentHash } = profile.records
  const resolverAddress = (await ens.contracts!.getPublicResolver()!).address
  let migratableContentHash: string | undefined
  if (contentHash) {
    if (typeof contentHash === 'string') {
      migratableContentHash = contentHash
    } else if (typeof contentHash === 'object' && contentHash.decoded) {
      migratableContentHash = `${contentHash.protocolType}://${contentHash.decoded}`
    }
  }

  const migratableProfile = {
    contentHash: migratableContentHash,
    texts: profile.records.texts as {
      key: string
      value: string
    }[],
    coinTypes: profile.records.coinTypes?.map((coinType) => ({
      key: coinType.key as string,
      value: (coinType as any).addr as string,
    })),
  }

  return ens.setRecords.populateTransaction(data.name, {
    records: migratableProfile,
    resolverAddress,
    signer,
  })
}

export default { displayItems, transaction } as Transaction<Data>
