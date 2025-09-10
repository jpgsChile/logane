// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../RaffleContractV2.sol";

contract DeployRaffleV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy RaffleContractV2
        address feeRecipient = deployer; // Use deployer as fee recipient for testing
        address treasury = deployer; // Use deployer as treasury for testing
        address initialOwner = deployer; // Use deployer as initial owner
        
        RaffleContractV2 raffleContract = new RaffleContractV2(
            feeRecipient,
            treasury,
            initialOwner
        );
        
        console.log("RaffleContractV2 deployed at:", address(raffleContract));
        
        // Configure some basic settings
        // Note: Token addresses will be set later when real tokens are available
        // raffleContract.setTokenAddress(
        //     RaffleContractV2.PaymentToken.USDT, 
        //     address(0) // Will be set later
        // );
        // raffleContract.setTokenAddress(
        //     RaffleContractV2.PaymentToken.USDC, 
        //     address(0) // Will be set later
        // );
        
        // Verify the deployer as a user for testing
        raffleContract.verifyUser(deployer, true);
        
        vm.stopBroadcast();
        
        console.log("Deployment completed successfully!");
        console.log("Contract address:", address(raffleContract));
    }
}
