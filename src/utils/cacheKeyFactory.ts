import { useAccount } from 'wagmi'

import { useChainId } from '@app/hooks/chain/useChainId'
import type { TransactionData, TransactionItem, TransactionName } from '@app/transaction-flow/transaction'
import { UniqueTransaction } from '@app/transaction-flow/types'
import { GetDnsImportDataParameters, GetDnsOwnerParameters } from '@ensdomains/ensjs/dns'
import { GetAddressRecordParameters, GetExpiryParameters, GetNameParameters, GetOwnerParameters, GetPriceParameters, GetRecordsParameters, GetWrapperDataParameters } from '@ensdomains/ensjs/public'
import { GetDecodedNameParameters, GetNameHistoryParameters, GetSubgraphRecordsParameters } from '@ensdomains/ensjs/subgraph'
import { RegistrationParameters } from '@ensdomains/ensjs/utils'
import type { Address } from 'viem'

export const useQueryKeys = () => {
  const { address } = useAccount()
  const chainId = useChainId()

  const globalKeys = [chainId, address] as const

  return {
    graphBase: [...globalKeys, 'graph'],
    dogfood: (inputString?: string) => [...globalKeys, 'getAddr', inputString, 'dogfood'],
    transactionStageModal: {
      prepareTransaction: <TName extends TransactionName, TData extends TransactionData<TName>, TParams extends UniqueTransaction<TName, TData>>(
        params: TParams,
      ) => [params, ...globalKeys, 'prepareTransaction'] as const,
      transactionError: (transactionHash?: string) => [
        ...globalKeys,
        transactionHash,
        'transactionError',
      ],
    },
    nameSnippet: (localAddress: string) => [...globalKeys, 'getName', localAddress, 'nameSnippet'],
    moonpayRegistration: (currentExternalTransactionId: string) => [
      ...globalKeys,
      'currentExternalTransactionId',
      currentExternalTransactionId,
      'moonpayRegistration',
    ],
    avatar: {
      avatar: (name: string | null | undefined) => [...globalKeys, 'getAvatar', name, 'avatar'],
    },
    getNftImage: (params: { name: string | null | undefined; registrarAddress: Address }) => [{ ...params, chainId }, ...globalKeys, 'getNftImage'] as const,
    basicName: (normalisedName: string) => [
      ...globalKeys,
      'batch',
      'getOwner',
      'getExpiry',
      normalisedName,
      'basicName',
    ],
    basicNameRoot: (normalisedName: string) => [
      ...globalKeys,
      'batch',
      'getOwner',
      'getExpiry',
      normalisedName,
    ],
    beautifiedName: (name: string) => [...globalKeys, name, 'beautifiedName'],
    blockTimestamp: [...globalKeys, 'blockTimestamp'],
    currentBlockTimestamp: [...globalKeys, 'currentBlockTimestamp'],
    getDNSOwner: (name: string) => [...globalKeys, name, 'getDNSOwner'],
    getDNSProof: (name: string) => [...globalKeys, name, 'getDNSProof'],
    estimateGasLimitForTransactions: (transactions: TransactionItem[], extraKeys: string[]) => [
      ...globalKeys,
      ...transactions,
      ...extraKeys,
      'estimateGasLimitForTransactions',
    ],
    getRegistrationEstimate: <TParams extends { data: Omit<RegistrationParameters, 'duration' | 'secret'> }>(params: TParams) => [
      { ...params, chainId },
      ...globalKeys,
      'getRegistrationEstimate',
    ] as const,
    ethPrice: [...globalKeys, 'ethPrice'],
    exists: (name: string) => [...globalKeys, 'getOwner', name, 'exists'],
    expiry: (name: string) => [...globalKeys, 'useExpiry', name, 'expiry'],
    faucet: (localAddress?: string) => [...globalKeys, localAddress, 'faucet'],
    getABI: (name: string) => [...globalKeys, name, 'getABI'],
    getHistory: (name: string) => [...globalKeys, 'graph', name, 'getHistory'],
    hasSubnames: (name: string) => [...globalKeys, 'graph', name, 'hasSubnames'],
    subnames: (name: string, orderBy = '', orderDirection = '', search = '') => [
      ...globalKeys,
      'graph',
      'getSubnames',
      name,
      orderBy,
      orderDirection,
      search,
    ],
    namesFromAddress: (localAddress?: string) => [
      ...globalKeys,
      'graph',
      'getNames',
      localAddress,
      'namesFromAddress',
    ],
    namesFromResolvedAddress: (resolvedAddress?: string) => [
      ...globalKeys,
      'graph',
      'getNames',
      resolvedAddress,
      'namesFromResolvedAddress',
    ],
    primary: (localAddress: string) => [...globalKeys, 'getName', localAddress, 'primary'],
    getDecodedName: <TParams extends GetDecodedNameParameters>(params: TParams) => [params, ...globalKeys, 'graph', 'getDecodedName'] as const,
    getSubgraphRecords: <TParams extends GetSubgraphRecordsParameters>(params: TParams) => [
      params,
      ...globalKeys,
      'graph',
      'getSubgraphRecords',
    ] as const,
    getNameHistory: <TParams extends GetNameHistoryParameters>(params: TParams) => [
      params,
      ...globalKeys,
      'graph',
      'getNameHistory',
    ] as const,
    getAddressRecord: <TParams extends GetAddressRecordParameters>(params: TParams) => [
      params,
      ...globalKeys,
      'getAddressRecord'
    ] as const,
    getExpiry: <TParams extends GetExpiryParameters>(params: TParams) => [
      params,
      ...globalKeys,
      'getExpiry',
    ] as const,
    getName: <TParams extends GetNameParameters>(params: TParams) => [
      params,
      ...globalKeys,
      'getName',
    ] as const,
    getOwner: <TParams extends GetOwnerParameters>(params: TParams) => [params, ...globalKeys, 'getOwner'] as const,
    getPrice: <TParams extends GetPriceParameters>(params: TParams) => [params, ...globalKeys, 'getPrice'] as const,
    getRecords: <TParams extends GetRecordsParameters>(params: TParams) => [
      params,
      ...globalKeys,
      'getRecords',
    ] as const,
    getWrapperData: <TParams extends GetWrapperDataParameters>(params: TParams) => [params, ...globalKeys, 'getWrapperData'] as const,
    getDnsImportData: <TParams extends GetDnsImportDataParameters>(params: TParams) => [params, ...globalKeys, 'getDnsImportData'] as const,
    getDnsOwner: <TParams extends GetDnsOwnerParameters>(params: TParams) => [params, ...globalKeys, 'getDnsOwner'] as const,
    registrationDate: (name: string) => [...globalKeys, 'graph', name, 'registrationDate'],
    getResolver: (name: string) => [...globalKeys, name, 'getResolver'],
    resolverExists: (name: string) => [
      ...globalKeys,
      'graph',
      'getResolver',
      name,
      'resolverExists',
    ],
    resolverHasInterfaces: (interfaceNames: string, resolverAddress?: string) => [
      ...globalKeys,
      'validateResolver',
      resolverAddress,
      interfaceNames,
      'resolverHasInterfaces',
    ],
    resolverIsAuthorized: (name: string, resolver: string) => [
      ...globalKeys,
      'resolverIsAuthorised',
      name,
      resolver,
    ],
    registryResolver: (name: string) => [...globalKeys, name, 'registryResolver'],
    resolverStatus: (
      name: string,
      options: { skip?: boolean; skipCompare?: boolean },
      profileResolverAddress?: string,
    ) => [...globalKeys, name, { profileResolverAddress, options }, 'resolverStatus'],
    reverseRegistryName: (accountAddress?: string) => [
      ...globalKeys,
      accountAddress,
      'reverseRegistryName',
    ],
    isSupportedTLD: (tld: string) => [...globalKeys, tld, 'isSupportedTLD'],
    validate: (input: string) => [...globalKeys, input, 'validate'],
    validateSubnameLabel: (validationName: string) => [
      ...globalKeys,
      'createSubname',
      'getOwner',
      validationName,
      'validateSubnameLabel',
    ],
    wrapperApprovedForAll: (localAddress: string) => [
      ...globalKeys,
      localAddress,
      'wrapperApprovedForAll',
    ],
    isSafeApp: (connectorId: string | undefined) => [...globalKeys, connectorId, 'isSafeApp'],
    globalIndependent: {
      isSupportedTLD: (tld: string) => [tld, 'isSupportedTLD'],
      zorb: (input: string, type: string, bg: string, fg: string, accent: string) => [
        input,
        type,
        { bg, fg, accent },
        'zorb',
      ],
      gasCostJson: ['gasCostJson'],
      claimDomain: (name: string, syncWarning: boolean) => [
        'proverResult',
        name,
        syncWarning,
        'claimDomain',
      ],
    },
  }
}
