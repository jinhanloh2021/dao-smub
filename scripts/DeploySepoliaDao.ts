import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ECredit, GovernorContract, Smub, TimeLock } from '../typechain-types';
import hre from 'hardhat';
import {
  ADDRESS_ZERO,
  MIN_DELAY_STAGE,
  VOTING_DELAY_STAGE,
  VOTING_PERIOD_STAGE,
  QUORUM_PERCENTAGE_STAGE,
} from '../helper-hardhat-config';

/**
 * @run yarn hardhat run scripts/DeploySepoliaDao.ts --network sepolia
 * @notice STAGING DEPLOYMENT: Deploys the entire DAO to Sepolia Testnet
 * 1 - Deploy eCredit Token
 * 2 - Deploy TimeLock
 * 3 - Deploy GovernorContract
 * 4 - Grant and Revoke TimeLock roles
 * 5 - Deploy Smub and transfer ownership to TimeLock
 *
 * @throws Verification error because tried to verify right after deployment. Not critical.
 * @throws Gas error. Network is busy and gas estimation by provider just fails. Re-run deployment and it should work.
 */

export default async function deploySepoliaDAO(hre: HardhatRuntimeEnvironment) {
  console.log(`${'-'.repeat(13)}Deployment on Sepolia${'-'.repeat(13)}`);

  const [deployer] = await hre.ethers.getSigners();

  /** 01 - Deploy eCredit Token */
  const eCreditFactory = await hre.ethers.getContractFactory('ECredit');
  console.log(`Deploying eCredit...`);
  const eCredit: ECredit = await eCreditFactory.deploy();
  await eCredit.waitForDeployment();
  await eCredit.delegate(deployer.address);
  const eCreditAddress = await eCredit.getAddress();
  console.log(`ECredit deployed at: ${eCreditAddress}`);
  console.log('-'.repeat(48));

  //   /** 02 - Deploy TimeLock */
  const timeLockFactory = await hre.ethers.getContractFactory('TimeLock');
  console.log(`Deploying TimeLock...`);
  const timeLock: TimeLock = await timeLockFactory.deploy(
    MIN_DELAY_STAGE,
    [],
    [],
    deployer.address
  );
  await timeLock.waitForDeployment();
  const timeLockAddress = await timeLock.getAddress();
  console.log(`TimeLock deployed at: ${timeLockAddress}`);
  console.log('-'.repeat(48));

  /** 03 - Deploy Governor Contract */
  console.log('Deploying GovernorContract...');
  const governorContractFactory = await hre.ethers.getContractFactory(
    'GovernorContract'
  );
  const governorContract: GovernorContract =
    await governorContractFactory.deploy(
      eCreditAddress,
      timeLockAddress,
      VOTING_DELAY_STAGE,
      VOTING_PERIOD_STAGE,
      QUORUM_PERCENTAGE_STAGE
    );
  await governorContract.waitForDeployment();
  const govContractAddress = await governorContract.getAddress();
  console.log(`GovernorContract deployed at: ${govContractAddress}`);
  console.log('-'.repeat(48));

  //   /** 04 - Setup Contract Roles */
  console.log(`Setting up TimeLock roles...`);
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();
  const proposerTx = await timeLock.grantRole(proposerRole, govContractAddress); // only governor can propose
  await proposerTx.wait(1);
  console.log(`Proposer set`);
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO); // Everyone can execute
  await executorTx.wait(1);
  console.log(`Executor set`);
  const revokeTx = await timeLock.revokeRole(adminRole, deployer); // No TimeLock admin
  await revokeTx.wait(1);
  console.log(`Admin revoked`);
  console.log('-'.repeat(48));

  /** 05 - Deploy Smub contract */
  const smubContractFactory = await hre.ethers.getContractFactory('Smub');
  console.log(`Deploying Smub contract...`);
  const smub: Smub = await smubContractFactory.deploy();
  await smub.waitForDeployment();
  const smubAddress = await smub.getAddress();
  console.log(`Smub deployed at: ${smubAddress}`);
  const transferOwnerTx = await smub.transferOwnership(timeLockAddress);
  transferOwnerTx.wait(1);
  console.log(`Transferred ownership to: ${await smub.owner()}`);
  console.log('-'.repeat(48));
  console.log(`Staging deployment completed`);
  console.log(`-`.repeat(48));

  /** 06- Verify Contracts */
  console.log(`Verify contracts`);
  try {
    console.log(`Verifying eCredit...`);
    await hre.run('verify:verify', {
      address: eCreditAddress,
      constructorArguments: [],
    });
  } catch (e: any) {
    console.error(e);
  }
  try {
    console.log(`Verifying TimeLock...`);
    await hre.run('verify:verify', {
      address: timeLockAddress,
      constructorArguments: [MIN_DELAY_STAGE, [], [], deployer.address],
      contract: 'contracts/governance_standard/TimeLock.sol:TimeLock',
    });
  } catch (e: any) {
    console.error(e);
  }
  try {
    console.log(`Verifying GovernanceContract...`);
    await hre.run('verify:verify', {
      address: govContractAddress,
      constructorArguments: [
        eCreditAddress,
        timeLockAddress,
        VOTING_DELAY_STAGE,
        VOTING_PERIOD_STAGE,
        QUORUM_PERCENTAGE_STAGE,
      ],
    });
  } catch (e: any) {
    console.error(e);
  }
  try {
    console.log(`Verifying Smub...`);
    await hre.run('verify:verify', {
      address: smubAddress,
      constructorArguments: [],
    });
  } catch (e: any) {
    console.error(e);
  }
  console.log(`Verification completed`);
  console.log(`-`.repeat(48));
}

/**
 * Deployed contracts - Sepolia
 *
 * GovernorContract: 0x574D20e8762d2DBFa380aCD8c8CD7ff9A697c647
 * Smub: 0x09a25d4581Ff8153789ddE5Ecb54767AF98E669F
 * TimeLock: 0xA106F55cFDc29085e767A4f767EA450E5eD88215
 * ECredit: 0xe17280dA6a3b09C5Cec58765808478ceEbE83b66
 */

deploySepoliaDAO(hre)
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
