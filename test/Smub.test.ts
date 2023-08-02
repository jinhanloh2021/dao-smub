import { assert, expect } from 'chai';
import hre from 'hardhat';
import { ECredit, GovernorContract, Smub, TimeLock } from '../typechain-types';
import {
  ADDRESS_ZERO,
  MIN_DELAY,
  QUORUM_PERCENTAGE,
  VOTING_DELAY,
  VOTING_PERIOD,
} from '../helper-hardhat-config';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('Smub unit tests', () => {
  let eCredit: ECredit,
    timeLock: TimeLock,
    governorContract: GovernorContract,
    smub: Smub;
  let deployer: HardhatEthersSigner, nonDeployer: HardhatEthersSigner;

  beforeEach(async () => {
    /** Setup Accounts */
    [deployer, nonDeployer] = await hre.ethers.getSigners();

    /** Deploy contracts */
    /** 01 - Deploy eCredit Token */
    const eCreditFactory = await hre.ethers.getContractFactory('ECredit');
    eCredit = await eCreditFactory.deploy();
    await eCredit.waitForDeployment();
    const eCreditAddress = await eCredit.getAddress();

    /** 02 - Deploy TimeLock */
    const timeLockFactory = await hre.ethers.getContractFactory('TimeLock');
    timeLock = await timeLockFactory.deploy(
      MIN_DELAY,
      [],
      [],
      deployer.address
    );
    await timeLock.waitForDeployment();
    const timeLockAddress = await timeLock.getAddress();
    // console.log(`TimeLock deployed at: ${timeLockAddress}`);

    /** 03 - Deploy Governor Contract */
    const governorContractFactory = await hre.ethers.getContractFactory(
      'GovernorContract'
    );
    governorContract = await governorContractFactory.deploy(
      eCreditAddress,
      timeLockAddress,
      VOTING_DELAY,
      VOTING_PERIOD,
      QUORUM_PERCENTAGE
    );
    await governorContract.waitForDeployment();
    const govContractAddress = await governorContract.getAddress();

    /** 04 - Setup Contract Roles */
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();
    const proposerTx = await timeLock.grantRole(
      proposerRole,
      govContractAddress
    ); // only governor can propose
    await proposerTx.wait(1);
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO); // Everyone can execute
    await executorTx.wait(1);
    const revokeTx = await timeLock.revokeRole(adminRole, deployer); // No TimeLock admin
    await revokeTx.wait(1);

    /** 05 - Deploy Smub contract */
    const smubContractFactory = await hre.ethers.getContractFactory('Smub');
    smub = await smubContractFactory.deploy();
    await smub.waitForDeployment();
    const smubAddress = await smub.getAddress();

    const transferOwnerTx = await smub.transferOwnership(timeLockAddress);
    transferOwnerTx.wait(1);
  });

  it('Should only allow GovernorContract to update EXCO', async () => {
    await expect(
      smub.connect(nonDeployer).setExco(0, 'Jin Han')
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
