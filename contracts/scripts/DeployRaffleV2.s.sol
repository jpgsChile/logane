// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../RaffleContractV2.sol";

contract DeployRaffleV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");
        address treasury = vm.envAddress("TREASURY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        RaffleContractV2 raffleContract = new RaffleContractV2(
            feeRecipient,
            treasury,
            msg.sender
        );
        
        // Configure token addresses for mainnet/testnet
        address usdtAddress = vm.envOr("USDT_ADDRESS", address(0));
        address usdcAddress = vm.envOr("USDC_ADDRESS", address(0));
        
        if (usdtAddress != address(0)) {
            raffleContract.setTokenAddress(RaffleContractV2.PaymentToken.USDT, usdtAddress);
        }
        
        if (usdcAddress != address(0)) {
            raffleContract.setTokenAddress(RaffleContractV2.PaymentToken.USDC, usdcAddress);
        }
        
        // Configure VRF if available
        address vrfCoordinator = vm.envOr("VRF_COORDINATOR", address(0));
        bytes32 keyHash = vm.envOr("VRF_KEY_HASH", bytes32(0));
        uint256 vrfFee = vm.envOr("VRF_FEE", uint256(0));
        
        if (vrfCoordinator != address(0)) {
            raffleContract.setVRFConfig(vrfCoordinator, keyHash, vrfFee);
        }
        
        vm.stopBroadcast();
        
        console.log("RaffleContractV2 deployed at:", address(raffleContract));
    }
}
