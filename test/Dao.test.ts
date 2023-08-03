import { assert, expect } from 'chai';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import hre from 'hardhat';
import { ECredit, GovernorContract, Smub, TimeLock } from '../typechain-types';
import {
  ADDRESS_ZERO,
  MIN_DELAY,
  PROPOSAL_DESCRIPTION,
  QUORUM_PERCENTAGE,
  VOTING_DELAY,
  VOTING_PERIOD,
} from '../helper-hardhat-config';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import moveBlocks from '../utils/move-blocks';
import { moveTime } from '../utils/move-time';

describe('DAO tests', () => {
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
    await eCredit.delegate(deployer.address); // Increases checkpoint by 1
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
    await expect(smub.setExco(0, 'Jin Han')).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
  });

  it('Can propose, vote, queue and execute', async () => {
    /** Propose */
    const encodedSetExcoCall = smub.interface.encodeFunctionData('setExco', [
      0,
      'Jin Han',
    ]);
    let proposalId: bigint = BigInt(0);
    governorContract = await governorContract.addListener(
      'ProposalCreated',
      (pid) => {
        proposalId = pid;
      }
    );
    await expect(
      await (
        await governorContract.propose(
          [await smub.getAddress()],
          [0],
          [encodedSetExcoCall],
          PROPOSAL_DESCRIPTION
        )
      ).wait(1)
    )
      .to.emit(governorContract, 'ProposalCreated')
      .withArgs(
        proposalId,
        deployer.address,
        [await smub.getAddress()],
        [0],
        [''],
        [encodedSetExcoCall],
        anyValue,
        anyValue,
        PROPOSAL_DESCRIPTION
      );
    // const proposalTx = await governorContract.propose(
    //   [await smub.getAddress()],
    //   [0],
    //   [encodedSetExcoCall],
    //   PROPOSAL_DESCRIPTION
    // );
    // await proposalTx.wait(1);
    await moveBlocks(VOTING_DELAY + 1);

    // The Proposal State is an enum data type, defined in the IGovernor contract.
    // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
    let proposalState = await governorContract.state(proposalId);
    assert.equal(proposalState.toString(), '1'); // Active state

    /** Vote */
    const voteWay = 1;
    const reason = 'My reason for voting';
    const voteTx = await governorContract.castVoteWithReason(
      proposalId,
      voteWay,
      reason
    );
    await voteTx.wait(1);
    await moveBlocks(VOTING_PERIOD + 1);
    proposalState = await governorContract.state(proposalId);
    assert.equal(proposalState.toString(), '4'); // Successful state

    /** Queue */
    const descriptionHash = hre.ethers.id(PROPOSAL_DESCRIPTION);
    const queueTx = await governorContract.queue(
      [await smub.getAddress()],
      [0],
      [encodedSetExcoCall],
      descriptionHash
    );
    await queueTx.wait(1);
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);

    proposalState = await governorContract.state(proposalId);
    assert.equal(proposalState.toString(), '5');

    /** Execute */
    const executeTx = await governorContract.execute(
      [await smub.getAddress()],
      [0],
      [encodedSetExcoCall],
      descriptionHash
    );
    await executeTx.wait(1);
    await moveBlocks(1);
    proposalState = await governorContract.state(proposalId);
    assert.equal(proposalState.toString(), '7');
  });
});
