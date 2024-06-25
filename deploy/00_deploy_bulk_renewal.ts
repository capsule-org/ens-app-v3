/* eslint-disable import/no-extraneous-dependencies */
import { Interface } from '@ethersproject/abi'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { keccak256, namehash ,toBytes} from 'viem'


function makeInterfaceId(functionSignatures: string[] = []) {
  const INTERFACE_ID_LENGTH = 4;
  const interfaceIdBuffer = new Uint8Array(INTERFACE_ID_LENGTH).fill(0);

  functionSignatures
    .map(signature => keccak256(toBytes(signature))) // keccak256
    .map(hash => {
      const bytes = new Uint8Array(
        toBytes(hash).slice(0, INTERFACE_ID_LENGTH)
      ); // bytes4()
      for (let i = 0; i < INTERFACE_ID_LENGTH; i++) {
        interfaceIdBuffer[i] ^= bytes[i]; // xor
      }
    });

  return `0x${Array.from(interfaceIdBuffer)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')}`;
}

function computeInterfaceId(iface: any): any {
  return makeInterfaceId(
    Object.values(iface.functions).map((frag: any) => frag.format('sighash')),
  )
}

const labelHash = (label: string) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  if (!network.tags.use_root) {
    return true
  }

  const root = await ethers.getContract('Root', await ethers.getSigner(owner))
  const registry = await ethers.getContract('ENSRegistry', await ethers.getSigner(owner))
  const resolver = await ethers.getContract('PublicResolver', await ethers.getSigner(owner))
  const registrar = await ethers.getContract('BaseRegistrarImplementation')
  const controller = await ethers.getContract('ETHRegistrarController')
  const wrapper = await ethers.getContract('NameWrapper')
  const controllerArtifact = await deployments.getArtifact('IETHRegistrarController')

  const bulkRenewal = await deploy('BulkRenewal', {
    from: deployer,
    args: [registry.address],
    log: true,
  })

  console.log('Temporarily setting owner of eth tld to owner ')
  const tx = await root.setSubnodeOwner(labelHash('eth'), owner)
  await tx.wait()

  console.log('Set default resolver for eth tld to public resolver')
  const tx111 = await registry.setResolver(namehash('eth'), resolver.address)
  await tx111.wait()

  console.log('Set interface implementor of eth tld for bulk renewal')
  const tx2 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(new Interface(bulkRenewal.abi)),
    bulkRenewal.address,
  )
  await tx2.wait()

  console.log('Set interface implementor of eth tld for registrar controller')
  const tx3 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(new Interface(controllerArtifact.abi)),
    controller.address,
  )
  await tx3.wait()

  console.log('Set interface implementor of eth tld for name wrapper')
  const tx4 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(wrapper.interface),
    wrapper.address,
  )
  await tx4.wait()

  console.log('Set owner of eth tld back to registrar')
  const tx11 = await root.setSubnodeOwner(labelHash('eth'), registrar.address)
  await tx11.wait()

  return true
}

func.id = 'bulk-renewal'
func.tags = ['ethregistrar', 'BulkRenewal']
func.dependencies = [
  'root',
  'registry',
  'BaseRegistrarImplementation',
  'PublicResolver',
  'ETHRegistrarController',
]

export default func
