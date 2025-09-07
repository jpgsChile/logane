// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RaffleContract
 * @dev Smart contract for managing raffles with multiple prizes and payment tokens
 */
contract RaffleContract is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    enum PaymentToken {
        ETH,
        USDT,
        USDC
    }
    
    struct Prize {
        string name;
        string description;
        string imageUrl;
        uint256 value; // Prize value in wei or token units
    }
    
    struct Raffle {
        uint256 id;
        string title;
        string description;
        Prize[3] prizes; // Exactly 3 prizes
        uint256 ticketPrice;
        uint256 maxParticipants;
        uint256 endTime;
        address creator;
        address[] participants;
        bool isActive;
        bool isDrawn;
        address[3] winners; // Winners for each prize
        uint256 createdAt;
        PaymentToken paymentToken;
    }
    
    mapping(uint256 => Raffle) public raffles;
    mapping(address => uint256[]) public userRaffles;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;
    
    mapping(PaymentToken => address) public tokenAddresses;
    
    uint256 public nextRaffleId = 1;
    uint256 public platformFeePercentage = 250; // 2.5%
    address public feeRecipient;
    
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxParticipants,
        uint256 endTime,
        PaymentToken paymentToken
    );
    
    event ParticipantJoined(
        uint256 indexed raffleId,
        address indexed participant,
        uint256 participantCount
    );
    
    event RaffleDrawn(
        uint256 indexed raffleId,
        address[3] winners,
        uint256 timestamp
    );
    
    event PrizeClaimed(
        uint256 indexed raffleId,
        address indexed winner,
        uint256 prizeIndex,
        uint256 amount
    );
    
    event TokenAddressUpdated(PaymentToken indexed token, address indexed tokenAddress);
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    function setTokenAddress(PaymentToken _token, address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        tokenAddresses[_token] = _tokenAddress;
        emit TokenAddressUpdated(_token, _tokenAddress);
    }
    
    function createRaffle(
        string memory _title,
        string memory _description,
        Prize[3] memory _prizes,
        uint256 _ticketPrice,
        uint256 _maxParticipants,
        uint256 _duration,
        PaymentToken _paymentToken
    ) external whenNotPaused returns (uint256) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        if (_paymentToken != PaymentToken.ETH) {
            require(tokenAddresses[_paymentToken] != address(0), "Token not supported");
        }
        
        uint256 raffleId = nextRaffleId++;
        uint256 endTime = block.timestamp + _duration;
        
        Raffle storage newRaffle = raffles[raffleId];
        newRaffle.id = raffleId;
        newRaffle.title = _title;
        newRaffle.description = _description;
        newRaffle.prizes = _prizes;
        newRaffle.ticketPrice = _ticketPrice;
        newRaffle.maxParticipants = _maxParticipants;
        newRaffle.endTime = endTime;
        newRaffle.creator = msg.sender;
        newRaffle.isActive = true;
        newRaffle.isDrawn = false;
        newRaffle.createdAt = block.timestamp;
        newRaffle.paymentToken = _paymentToken;
        
        userRaffles[msg.sender].push(raffleId);
        
        emit RaffleCreated(
            raffleId,
            msg.sender,
            _title,
            _ticketPrice,
            _maxParticipants,
            endTime,
            _paymentToken
        );
        
        return raffleId;
    }
    
    function joinRaffle(uint256 _raffleId) external payable nonReentrant whenNotPaused {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isActive, "Raffle is not active");
        require(block.timestamp < raffle.endTime, "Raffle has ended");
        require(!hasParticipated[_raffleId][msg.sender], "Already participated");
        require(raffle.participants.length < raffle.maxParticipants, "Raffle is full");
        
        if (raffle.paymentToken == PaymentToken.ETH) {
            require(msg.value == raffle.ticketPrice, "Incorrect ticket price");
        } else {
            require(msg.value == 0, "ETH not accepted for this raffle");
            address tokenAddress = tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), raffle.ticketPrice);
        }
        
        raffle.participants.push(msg.sender);
        hasParticipated[_raffleId][msg.sender] = true;
        
        emit ParticipantJoined(_raffleId, msg.sender, raffle.participants.length);
    }
    
    function drawWinners(uint256 _raffleId) external nonReentrant {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isActive, "Raffle is not active");
        require(block.timestamp >= raffle.endTime, "Raffle has not ended yet");
        require(!raffle.isDrawn, "Winners already drawn");
        require(raffle.participants.length > 0, "No participants");
        
        raffle.isDrawn = true;
        raffle.isActive = false;
        
        uint256 participantCount = raffle.participants.length;
        
        for (uint256 i = 0; i < 3; i++) {
            if (participantCount > i) {
                uint256 randomIndex = _generateRandomNumber(_raffleId, i) % participantCount;
                raffle.winners[i] = raffle.participants[randomIndex];
                
                raffle.participants[randomIndex] = raffle.participants[participantCount - 1];
                raffle.participants.pop();
                participantCount--;
            }
        }
        
        emit RaffleDrawn(_raffleId, raffle.winners, block.timestamp);
    }
    
    function claimPrize(uint256 _raffleId, uint256 _prizeIndex) external nonReentrant {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isDrawn, "Winners not drawn yet");
        require(_prizeIndex < 3, "Invalid prize index");
        require(raffle.winners[_prizeIndex] == msg.sender, "Not a winner");
        require(raffle.winners[_prizeIndex] != address(0), "Prize already claimed");
        
        address winner = msg.sender;
        raffle.winners[_prizeIndex] = address(0); // Mark as claimed
        
        uint256 totalPool = raffle.participants.length * raffle.ticketPrice;
        uint256 platformFee = (totalPool * platformFeePercentage) / 10000;
        uint256 prizePool = totalPool - platformFee;
        
        uint256 prizeAmount;
        if (_prizeIndex == 0) {
            prizeAmount = (prizePool * 60) / 100; // 60% for 1st prize
        } else if (_prizeIndex == 1) {
            prizeAmount = (prizePool * 25) / 100; // 25% for 2nd prize
        } else {
            prizeAmount = (prizePool * 15) / 100; // 15% for 3rd prize
        }
        
        if (raffle.paymentToken == PaymentToken.ETH) {
            (bool success, ) = winner.call{value: prizeAmount}("");
            require(success, "Prize transfer failed");
        } else {
            address tokenAddress = tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransfer(winner, prizeAmount);
        }
        
        emit PrizeClaimed(_raffleId, winner, _prizeIndex, prizeAmount);
    }
    
    function withdrawFees(uint256 _raffleId) external onlyOwner {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isDrawn, "Raffle not completed");
        
        uint256 totalPool = raffle.participants.length * raffle.ticketPrice;
        uint256 platformFee = (totalPool * platformFeePercentage) / 10000;
        
        if (raffle.paymentToken == PaymentToken.ETH) {
            (bool success, ) = feeRecipient.call{value: platformFee}("");
            require(success, "Fee transfer failed");
        } else {
            address tokenAddress = tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransfer(feeRecipient, platformFee);
        }
    }
    
    function _generateRandomNumber(uint256 _raffleId, uint256 _nonce) private view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.difficulty,
                    _raffleId,
                    _nonce,
                    msg.sender
                )
            )
        );
    }
    
    function getRaffle(uint256 _raffleId) external view returns (Raffle memory) {
        return raffles[_raffleId];
    }
    
    function getParticipantCount(uint256 _raffleId) external view returns (uint256) {
        return raffles[_raffleId].participants.length;
    }
    
    function getUserRaffles(address _user) external view returns (uint256[] memory) {
        return userRaffles[_user];
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 1000, "Fee cannot exceed 10%");
        platformFeePercentage = _newFeePercentage;
    }
    
    function updateFeeRecipient(address _newFeeRecipient) external onlyOwner {
        require(_newFeeRecipient != address(0), "Invalid address");
        feeRecipient = _newFeeRecipient;
    }
    
    function getSupportedTokens() external view returns (PaymentToken[] memory, address[] memory) {
        PaymentToken[] memory tokens = new PaymentToken[](3);
        address[] memory addresses = new address[](3);
        
        tokens[0] = PaymentToken.ETH;
        addresses[0] = address(0); // ETH doesn't have contract address
        
        tokens[1] = PaymentToken.USDT;
        addresses[1] = tokenAddresses[PaymentToken.USDT];
        
        tokens[2] = PaymentToken.USDC;
        addresses[2] = tokenAddresses[PaymentToken.USDC];
        
        return (tokens, addresses);
    }
}
