/** TimeLock Constructor */
export const MIN_DELAY = 3600; // ~ 1 hour. Delay between successful vote and execute, ie queue time

/** GovernanceContract Constructor */
export const VOTING_PERIOD = 5; // Blocks
export const VOTING_DELAY = 1; // Between proposal and active voting phase
export const QUORUM_PERCENTAGE = 4; // Min percentage of members needed for vote

/** */
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

/** Used in box.interface.encodeFunctionData, which is then used in governor.propose*/
export const NEW_STORE_VALUE = 77;
export const BOX_FUNC = 'store';

/** Used in governor.propose as raw, and in queue as descriptionHash */
export const PROPOSAL_DESCRIPTION = 'My Description about the proposal';

export const developmentChains = ['hardhat', 'localhost'];
export const proposalsFile = 'proposals.json';
