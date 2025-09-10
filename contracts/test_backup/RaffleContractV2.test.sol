// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../RaffleContractV2.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Mock ERC20 Token para testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// Mock ERC721 NFT para testing
contract MockERC721 is ERC721 {
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("MockNFT", "MNFT") {}
    
    function mint(address to) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        return tokenId;
    }
}

contract RaffleContractV2Test is Test {
    RaffleContractV2 public raffleContract;
    MockERC20 public usdtToken;
    MockERC20 public usdcToken;
    MockERC721 public nftContract;
    
    address public owner = address(0x1);
    address public feeRecipient = address(0x2);
    address public treasury = address(0x3);
    address public user1 = address(0x4);
    address public user2 = address(0x5);
    address public user3 = address(0x6);
    
    uint256 public constant TICKET_PRICE = 0.01 ether;
    uint256 public constant MAX_PARTICIPANTS = 10;
    uint256 public constant DURATION = 3600; // 1 hora
    
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxParticipants,
        uint256 endTime,
        RaffleContractV2.PaymentToken paymentToken,
        RaffleContractV2.RaffleType raffleType
    );
    
    event ParticipantJoined(
        uint256 indexed raffleId,
        address indexed participant,
        address indexed referrer,
        uint256 participantCount
    );
    
    event RaffleDrawn(
        uint256 indexed raffleId,
        address[] winners,
        uint256 prizeCount,
        uint256 timestamp
    );
    
    event PrizeClaimed(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 prizeIndex,
        uint256 amount,
        RaffleContractV2.PrizeType prizeType
    );
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        raffleContract = new RaffleContractV2(feeRecipient, treasury, owner);
        usdtToken = new MockERC20("Tether USD", "USDT");
        usdcToken = new MockERC20("USD Coin", "USDC");
        nftContract = new MockERC721();
        
        // Configure token addresses
        raffleContract.setTokenAddress(RaffleContractV2.PaymentToken.USDT, address(usdtToken));
        raffleContract.setTokenAddress(RaffleContractV2.PaymentToken.USDC, address(usdcToken));
        
        // Verify users
        raffleContract.verifyUser(user1, true);
        raffleContract.verifyUser(user2, true);
        raffleContract.verifyUser(user3, true);
        
        // Mint tokens to users
        usdtToken.mint(user1, 1000 * 10**18);
        usdtToken.mint(user2, 1000 * 10**18);
        usdtToken.mint(user3, 1000 * 10**18);
        usdcToken.mint(user1, 1000 * 10**18);
        usdcToken.mint(user2, 1000 * 10**18);
        usdcToken.mint(user3, 1000 * 10**18);
        
        vm.stopPrank();
        
        // Approve tokens
        vm.startPrank(user1);
        usdtToken.approve(address(raffleContract), type(uint256).max);
        usdcToken.approve(address(raffleContract), type(uint256).max);
        vm.stopPrank();
        
        vm.startPrank(user2);
        usdtToken.approve(address(raffleContract), type(uint256).max);
        usdcToken.approve(address(raffleContract), type(uint256).max);
        vm.stopPrank();
        
        vm.startPrank(user3);
        usdtToken.approve(address(raffleContract), type(uint256).max);
        usdcToken.approve(address(raffleContract), type(uint256).max);
        vm.stopPrank();
    }
    
    function testCreateRaffleWithETH() public {
        vm.startPrank(user1);
        
        RaffleContractV2.Prize[] memory prizes = new RaffleContractV2.Prize[](2);
        prizes[0] = RaffleContractV2.Prize({
            name: "First Prize",
            description: "Amazing first prize",
            imageUrl: "https://example.com/prize1.jpg",
            value: 0.5 ether,
            prizeType: RaffleContractV2.PrizeType.TOKEN,
            nftContract: address(0),
            nftTokenId: 0,
            isClaimed: false
        });
        prizes[1] = RaffleContractV2.Prize({
            name: "Second Prize",
            description: "Great second prize",
            imageUrl: "https://example.com/prize2.jpg",
            value: 0.3 ether,
            prizeType: RaffleContractV2.PrizeType.TOKEN,
            nftContract: address(0),
            nftTokenId: 0,
            isClaimed: false
        });
        
        string[] memory allowedAddresses = new string[](0);
        
        vm.expectEmit(true, true, false, true);
        emit RaffleCreated(
            1,
            user1,
            "Test Raffle",
            TICKET_PRICE,
            MAX_PARTICIPANTS,
            block.timestamp + DURATION,
            RaffleContractV2.PaymentToken.ETH,
            RaffleContractV2.RaffleType.PUBLIC
        );
        
        uint256 raffleId = raffleContract.createRaffle(
            "Test Raffle",
            "A test raffle for testing",
            prizes,
            TICKET_PRICE,
            MAX_PARTICIPANTS,
            DURATION,
            RaffleContractV2.PaymentToken.ETH,
            RaffleContractV2.RaffleType.PUBLIC,
            address(0),
            allowedAddresses,
            0,
            0
        );
        
        assertEq(raffleId, 1);
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        assertEq(raffle.id, 1);
        assertEq(raffle.title, "Test Raffle");
        assertEq(raffle.ticketPrice, TICKET_PRICE);
        assertEq(raffle.maxParticipants, MAX_PARTICIPANTS);
        assertEq(raffle.creator, user1);
        assertTrue(raffle.isActive);
        assertFalse(raffle.isDrawn);
        assertEq(raffle.prizes.length, 2);
        
        vm.stopPrank();
    }
    
    function testCreateRaffleWithUSDT() public {
        vm.startPrank(user1);
        
        RaffleContractV2.Prize[] memory prizes = new RaffleContractV2.Prize[](1);
        prizes[0] = RaffleContractV2.Prize({
            name: "USDT Prize",
            description: "USDT prize",
            imageUrl: "https://example.com/usdt.jpg",
            value: 100 * 10**18,
            prizeType: RaffleContractV2.PrizeType.TOKEN,
            nftContract: address(0),
            nftTokenId: 0,
            isClaimed: false
        });
        
        string[] memory allowedAddresses = new string[](0);
        
        uint256 raffleId = raffleContract.createRaffle(
            "USDT Raffle",
            "A USDT raffle",
            prizes,
            10 * 10**18, // 10 USDT ticket price
            MAX_PARTICIPANTS,
            DURATION,
            RaffleContractV2.PaymentToken.USDT,
            RaffleContractV2.RaffleType.PUBLIC,
            address(0),
            allowedAddresses,
            0,
            0
        );
        
        assertEq(raffleId, 1);
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        assertEq(raffle.paymentToken, RaffleContractV2.PaymentToken.USDT);
        
        vm.stopPrank();
    }
    
    function testJoinRaffleWithETH() public {
        // First create a raffle
        uint256 raffleId = _createTestRaffle();
        
        vm.startPrank(user2);
        
        vm.expectEmit(true, true, true, true);
        emit ParticipantJoined(raffleId, user2, address(0), 1);
        
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        assertEq(raffle.totalParticipants, 1);
        
        address[] memory participants = raffleContract.getRaffleParticipants(raffleId);
        assertEq(participants.length, 1);
        assertEq(participants[0], user2);
        
        vm.stopPrank();
    }
    
    function testJoinRaffleWithUSDT() public {
        // Create USDT raffle
        uint256 raffleId = _createUSDTRaffle();
        
        vm.startPrank(user2);
        
        raffleContract.joinRaffle(raffleId, address(0));
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        assertEq(raffle.totalParticipants, 1);
        
        vm.stopPrank();
    }
    
    function testJoinRaffleWithReferral() public {
        uint256 raffleId = _createTestRaffle();
        
        vm.startPrank(user2);
        
        vm.expectEmit(true, true, true, true);
        emit ParticipantJoined(raffleId, user2, user1, 1);
        
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, user1);
        
        vm.stopPrank();
    }
    
    function testDrawWinners() public {
        uint256 raffleId = _createTestRaffle();
        
        // Join multiple participants
        vm.startPrank(user1);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        vm.startPrank(user2);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        vm.startPrank(user3);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        // Fast forward time to end raffle
        vm.warp(block.timestamp + DURATION + 1);
        
        // Draw winners
        vm.startPrank(user1); // Creator can draw
        
        vm.expectEmit(true, false, false, true);
        emit RaffleDrawn(raffleId, new address[](0), 2, block.timestamp);
        
        raffleContract.drawWinners(raffleId);
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        assertTrue(raffle.isDrawn);
        assertFalse(raffle.isActive);
        
        address[] memory winners = raffleContract.getRaffleWinners(raffleId);
        assertEq(winners.length, 2);
        
        vm.stopPrank();
    }
    
    function testClaimPrize() public {
        uint256 raffleId = _createTestRaffle();
        
        // Join participants and draw
        _joinAndDrawRaffle(raffleId);
        
        address[] memory winners = raffleContract.getRaffleWinners(raffleId);
        address winner = winners[0];
        
        uint256 initialBalance = winner.balance;
        
        vm.startPrank(winner);
        
        vm.expectEmit(true, true, false, true);
        emit PrizeClaimed(raffleId, winner, 0, 0, RaffleContractV2.PrizeType.TOKEN);
        
        raffleContract.claimPrize(raffleId, 0);
        
        uint256 finalBalance = winner.balance;
        assertGt(finalBalance, initialBalance);
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        assertTrue(raffle.prizes[0].isClaimed);
        
        vm.stopPrank();
    }
    
    function testPrivateRaffle() public {
        vm.startPrank(user1);
        
        RaffleContractV2.Prize[] memory prizes = new RaffleContractV2.Prize[](1);
        prizes[0] = RaffleContractV2.Prize({
            name: "Private Prize",
            description: "Private prize",
            imageUrl: "https://example.com/private.jpg",
            value: 0.5 ether,
            prizeType: RaffleContractV2.PrizeType.TOKEN,
            nftContract: address(0),
            nftTokenId: 0,
            isClaimed: false
        });
        
        string[] memory allowedAddresses = new string[](1);
        allowedAddresses[0] = _addressToString(user2);
        
        uint256 raffleId = raffleContract.createRaffle(
            "Private Raffle",
            "A private raffle",
            prizes,
            TICKET_PRICE,
            MAX_PARTICIPANTS,
            DURATION,
            RaffleContractV2.PaymentToken.ETH,
            RaffleContractV2.RaffleType.PRIVATE,
            address(0),
            allowedAddresses,
            0,
            0
        );
        
        vm.stopPrank();
        
        // user2 should be able to join
        vm.startPrank(user2);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        // user3 should not be able to join
        vm.startPrank(user3);
        vm.expectRevert("Not allowed in private raffle");
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
    }
    
    function testCancelRaffle() public {
        uint256 raffleId = _createTestRaffle();
        
        // Join some participants
        vm.startPrank(user2);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        uint256 initialBalance = user2.balance;
        
        // Cancel raffle
        vm.startPrank(user1); // Creator
        
        vm.expectEmit(true, true, false, true);
        emit RaffleCancelled(raffleId, user1, TICKET_PRICE);
        
        raffleContract.cancelRaffle(raffleId);
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        assertTrue(raffle.isCancelled);
        assertFalse(raffle.isActive);
        
        vm.stopPrank();
        
        // Check refund
        uint256 finalBalance = user2.balance;
        assertEq(finalBalance, initialBalance + TICKET_PRICE);
    }
    
    function testUserStats() public {
        uint256 raffleId = _createTestRaffle();
        
        // Join and win
        _joinAndDrawRaffle(raffleId);
        
        address[] memory winners = raffleContract.getRaffleWinners(raffleId);
        address winner = winners[0];
        
        RaffleContractV2.UserStats memory stats = raffleContract.getUserStats(winner);
        assertEq(stats.totalRafflesParticipated, 1);
        assertEq(stats.totalRafflesWon, 1);
        assertGt(stats.reputation, 0);
    }
    
    function testPlatformFees() public {
        uint256 raffleId = _createTestRaffle();
        
        // Join multiple participants
        vm.startPrank(user1);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        vm.startPrank(user2);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        vm.startPrank(user3);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        // Draw winners
        vm.warp(block.timestamp + DURATION + 1);
        vm.startPrank(user1);
        raffleContract.drawWinners(raffleId);
        vm.stopPrank();
        
        RaffleContractV2.Raffle memory raffle = raffleContract.getRaffle(raffleId);
        uint256 expectedPlatformFee = (raffle.totalPool * 250) / 10000; // 2.5%
        assertEq(raffle.platformFee, expectedPlatformFee);
    }
    
    // Helper functions
    
    function _createTestRaffle() internal returns (uint256) {
        vm.startPrank(user1);
        
        RaffleContractV2.Prize[] memory prizes = new RaffleContractV2.Prize[](2);
        prizes[0] = RaffleContractV2.Prize({
            name: "First Prize",
            description: "Amazing first prize",
            imageUrl: "https://example.com/prize1.jpg",
            value: 0.5 ether,
            prizeType: RaffleContractV2.PrizeType.TOKEN,
            nftContract: address(0),
            nftTokenId: 0,
            isClaimed: false
        });
        prizes[1] = RaffleContractV2.Prize({
            name: "Second Prize",
            description: "Great second prize",
            imageUrl: "https://example.com/prize2.jpg",
            value: 0.3 ether,
            prizeType: RaffleContractV2.PrizeType.TOKEN,
            nftContract: address(0),
            nftTokenId: 0,
            isClaimed: false
        });
        
        string[] memory allowedAddresses = new string[](0);
        
        uint256 raffleId = raffleContract.createRaffle(
            "Test Raffle",
            "A test raffle for testing",
            prizes,
            TICKET_PRICE,
            MAX_PARTICIPANTS,
            DURATION,
            RaffleContractV2.PaymentToken.ETH,
            RaffleContractV2.RaffleType.PUBLIC,
            address(0),
            allowedAddresses,
            0,
            0
        );
        
        vm.stopPrank();
        return raffleId;
    }
    
    function _createUSDTRaffle() internal returns (uint256) {
        vm.startPrank(user1);
        
        RaffleContractV2.Prize[] memory prizes = new RaffleContractV2.Prize[](1);
        prizes[0] = RaffleContractV2.Prize({
            name: "USDT Prize",
            description: "USDT prize",
            imageUrl: "https://example.com/usdt.jpg",
            value: 100 * 10**18,
            prizeType: RaffleContractV2.PrizeType.TOKEN,
            nftContract: address(0),
            nftTokenId: 0,
            isClaimed: false
        });
        
        string[] memory allowedAddresses = new string[](0);
        
        uint256 raffleId = raffleContract.createRaffle(
            "USDT Raffle",
            "A USDT raffle",
            prizes,
            10 * 10**18, // 10 USDT ticket price
            MAX_PARTICIPANTS,
            DURATION,
            RaffleContractV2.PaymentToken.USDT,
            RaffleContractV2.RaffleType.PUBLIC,
            address(0),
            allowedAddresses,
            0,
            0
        );
        
        vm.stopPrank();
        return raffleId;
    }
    
    function _joinAndDrawRaffle(uint256 raffleId) internal {
        // Join participants
        vm.startPrank(user1);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        vm.startPrank(user2);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        vm.startPrank(user3);
        raffleContract.joinRaffle{value: TICKET_PRICE}(raffleId, address(0));
        vm.stopPrank();
        
        // Fast forward time and draw
        vm.warp(block.timestamp + DURATION + 1);
        
        vm.startPrank(user1);
        raffleContract.drawWinners(raffleId);
        vm.stopPrank();
    }
    
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
