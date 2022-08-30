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
    value: t(`transaction.description.wrapName`),
  },
  {
    label: 'info',
    value: t(`transaction.info.wrapName`),
  },
  {
    label: 'name',
    value: name,
    type: 'name',
  },
]

const transaction = async (signer: JsonRpcSigner, ens: PublicENS, data: Data) =>
  ens.wrapName.populateTransaction(data.name, { wrappedOwner: await signer.getAddress(), signer })

export default { displayItems, transaction } as Transaction<Data>
