import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ECredit, GovernorContract, Smub, TimeLock } from '../typechain-types';
import hre from 'hardhat';
import {
  ADDRESS_ZERO,
  MIN_DELAY,
  QUORUM_PERCENTAGE,
  VOTING_DELAY,
  VOTING_PERIOD,
} from '../helper-hardhat-config';

/**
 * @run yarn hardhat run scripts/DeployDao.ts
 * @notice HARDHAT DEPLOYMENT: Deploys the entire DAO to Hardhat
 * 1 - Deploy eCredit Token
 * 2 - Deploy TimeLock
 * 3 - Deploy GovernorContract
 * 4 - Grant and Revoke TimeLock roles
 * 5 - Deploy Smub and transfer ownership to TimeLock
 */

export default async function deployHardhatDAO(hre: HardhatRuntimeEnvironment) {
  console.log(
    `${'-'.repeat(13)}Deployment on ${hre.network.name}${'-'.repeat(13)}`
  );

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  /** 01 - Deploy eCredit Token */
  const eCreditFactory = await hre.ethers.getContractFactory('ECredit');
  const eCredit: ECredit = await eCreditFactory.deploy();
  await eCredit.waitForDeployment();
  await eCredit.delegate(deployer.address);
  const eCreditAddress = await eCredit.getAddress();
  console.log(`ECredit deployed at: ${eCreditAddress}`);

  /** 02 - Deploy TimeLock */
  const timeLockFactory = await hre.ethers.getContractFactory('TimeLock');
  const timeLock: TimeLock = await timeLockFactory.deploy(
    MIN_DELAY,
    [],
    [],
    deployer.address
  );
  await timeLock.waitForDeployment();
  const timeLockAddress = await timeLock.getAddress();
  console.log(`TimeLock deployed at: ${timeLockAddress}`);

  /** 03 - Deploy Governor Contract */
  const governorContractFactory = await hre.ethers.getContractFactory(
    'GovernorContract'
  );
  const governorContract: GovernorContract =
    await governorContractFactory.deploy(
      eCreditAddress,
      timeLockAddress,
      VOTING_DELAY,
      VOTING_PERIOD,
      QUORUM_PERCENTAGE
    );
  await governorContract.waitForDeployment();
  const govContractAddress = await governorContract.getAddress();
  console.log(`GovernorContract deployed at: ${govContractAddress}`);

  /** 04 - Setup Contract Roles */
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();
  const proposerTx = await timeLock.grantRole(proposerRole, govContractAddress); // only governor can propose
  await proposerTx.wait(1);
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO); // Everyone can execute
  await executorTx.wait(1);
  const revokeTx = await timeLock.revokeRole(adminRole, deployer); // No TimeLock admin
  await revokeTx.wait(1);

  /** 05 - Deploy Smub contract */
  const smubContractFactory = await hre.ethers.getContractFactory('Smub');
  const smub: Smub = await smubContractFactory.deploy();
  await smub.waitForDeployment();
  const smubAddress = await smub.getAddress();
  console.log(`Smub deployed at: ${smubAddress}`);
  const transferOwnerTx = await smub.transferOwnership(timeLockAddress);
  transferOwnerTx.wait(1);
  console.log(`Smub owner: ${await smub.owner()}`);
  console.log('-'.repeat(48));
}

deployHardhatDAO(hre)
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
