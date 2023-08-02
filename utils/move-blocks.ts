import { network } from 'hardhat';

export default async function moveBlocks(amount: number) {
  for (let i = 0; i < amount; i++) {
    await network.provider.request({
      method: 'evm_mine',
      params: [],
    });
  }
}
