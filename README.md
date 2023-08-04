<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">SMUB DAO</h3>

  <p align="center">
    SMU Blockchain DAO
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#code-rundown">Code Rundown</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

### SMUB DAO Deployment and Testing

This Hardhat project is for writing, testing and deploying the SMU Blockchain Club DAO. This implements the Governance, TimeLock and ERC20Votes interfaces from @openzeppelin/contracts. The governed contract stores the SMUB EXCO members names. This allows the DAO to vote on and decide the EXCO members in the club.

Deployment is done on both Hardhat and the Sepolia testnet and testing on Hardhat.

See frontend app [here](https://github.com/jinhanloh2021/smub-dao-front)

YouTube walkthrough [here](https://youtu.be/G5uPGDqy9LY)

### Built With

- Hardhat
- OpenZeppelin
- Typescript

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

- yarn

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/jinhanloh2021/dao-smub.git
   ```
2. Install NPM packages
   ```sh
   yarn
   ```
3. See .example.env for the environment variables. You will need a Sepolia RPC URL as a provider, and your Sepolia private key as a signer.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Run tests

```sh
yarn hardhat test
```

Run deployment on Hardhat

```sh
yarn hardhat run scripts/DeployHardhatDao.ts
```

Run deployment on Sepolia

```sh
yarn hardhat run scripts/DeploySepoliaDao.ts
```

Generate a code coverage report for tests

```sh
yarn hardhat coverage
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Code Rundown

See [YouTube](https://youtu.be/G5uPGDqy9LY) for full rundown

The governed contract is `Smub.sol` which is owned by the DAO. Hence the setExco function can only be called if a proposal passes. This enforces governance on the values that the s_exco mapping, which represents the EXCO members, can be.

The Governance contract and TimeLock contracts were simple because they were copied from OpenZeppelin. However, debugging and reading these interfaces was not easy, as I needed to dig into the code to understand the functions that I am extending. And also to understand how exactly does the Governance work with the TimeLock and the Token.

Deployment has to be done in the correct order to resolve dependencies. eg. Deploy TimeLock before GovernanceContract, as we require the TimeLock address in the GovernanceContract constructor. There are also small nuances such as granting and revoking roles on the TimeLock, so that only the GovernanceContract can propose, and there is no admin. This ensures the TimeLock can only be controlled through the DAO and not an individual account. It is a complex process to deploy 4 contracts that are tightly coupled.

Testing was straightforward apart from the integration tests. Listening for events on Hardhat network was very hard to debug. And having to manually manipulate the chain to increase its block number and time was an added challenge, as I needed to simulate time passing and blocks being mined.

The multi-step process of propose, vote, queue, execute was difficult to test individually as each step relies on the previous. Hence the integrated testing was done in a single test, which is not ideal.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [x] Hardhat deployment
- [x] Sepolia deployment
- [x] Automated contract verification
- [x] Unit testing
- [ ] Staging tests (done manually now on website)

See the [open issues](https://github.com/jinhanloh2021/dao-smub/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Project Link: [https://github.com/jinhanloh2021/dao-smub](https://github.com/jinhanloh2021/dao-smub)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [SMU Blockchain Club](https://www.instagram.com/smublockchain/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
