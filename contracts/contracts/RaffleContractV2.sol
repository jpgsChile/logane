// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// Counters fue deprecado en OpenZeppelin v5, usamos uint256 directamente

/**
 * @title RaffleContractV2
 * @dev Contrato inteligente mejorado para gestionar sorteos con funcionalidades avanzadas
 * @author Pablo Guzmán Sánchez
 * 
 */
contract RaffleContractV2 is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    // Usamos uint256 directamente en lugar de Counters
    
    // ============ ENUMS ============
    
    enum PaymentToken {
        ETH,
        USDT,
        USDC,
        CUSTOM_TOKEN
    }
    
    enum RaffleType {
        PUBLIC,
        PRIVATE,
        RECURRING
    }
    
    enum PrizeType {
        TOKEN,
        NFT,
        CUSTOM
    }
    
    // ============ STRUCTS ============
    
    struct Prize {
        string name;
        string description;
        string imageUrl;
        uint256 value;
        PrizeType prizeType;
        address nftContract; // Para premios NFT
        uint256 nftTokenId; // Para premios NFT
        bool isClaimed;
    }
    
    struct Raffle {
        uint256 id;
        string title;
        string description;
        Prize[] prizes;
        uint256 ticketPrice;
        uint256 maxParticipants;
        uint256 endTime;
        address creator;
        RaffleType raffleType;
        bool isActive;
        bool isDrawn;
        bool isCancelled;
        uint256 createdAt;
        uint256 drawnAt;
        PaymentToken paymentToken;
        address customTokenAddress; // Para tokens personalizados
        uint256 totalParticipants;
        uint256 totalPool;
        uint256 platformFee;
        uint256 creatorFee;
        string[] allowedAddresses; // Para rifas privadas
        uint256 recurringInterval; // Para rifas recurrentes (en segundos)
        uint256 maxRecurrences; // Máximo número de repeticiones
        uint256 currentRecurrence; // Repetición actual
    }
    
    struct UserStats {
        uint256 totalRafflesCreated;
        uint256 totalRafflesWon;
        uint256 totalRafflesParticipated;
        uint256 totalWinnings;
        uint256 reputation;
        bool isVerified;
    }
    
    struct ReferralData {
        address referrer;
        uint256 totalReferrals;
        uint256 totalEarnings;
        bool isActive;
    }
    
    // ============ STATE VARIABLES ============
    
    uint256 private _raffleIdCounter;
    
    mapping(uint256 => Raffle) public raffles;
    mapping(address => uint256[]) public userRaffles;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;
    mapping(uint256 => address[]) public participants;
    mapping(uint256 => address[]) public winners;
    
    mapping(PaymentToken => address) public tokenAddresses;
    mapping(address => UserStats) public userStats;
    mapping(address => ReferralData) public referralData;
    mapping(address => bool) public verifiedUsers;
    
    // Configuración de la plataforma
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public creatorFeePercentage = 100; // 1%
    uint256 public referralFeePercentage = 50; // 0.5%
    address public feeRecipient;
    address public treasury;
    
    // Límites y configuraciones
    uint256 public maxPrizesPerRaffle = 10;
    uint256 public minTicketPrice = 0.001 ether;
    uint256 public maxTicketPrice = 100 ether;
    uint256 public maxParticipantsPerRaffle = 10000;
    
    // VRF para números aleatorios (Chainlink)
    address public vrfCoordinator;
    bytes32 public keyHash;
    uint256 public fee;
    
    // ============ EVENTS ============
    
    event RaffleCreated(
        uint256 indexed raffleId,
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxParticipants,
        uint256 endTime,
        PaymentToken paymentToken,
        RaffleType raffleType
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
        PrizeType prizeType
    );
    
    event RaffleCancelled(
        uint256 indexed raffleId,
        address indexed creator,
        uint256 refundAmount
    );
    
    event UserVerified(
        address indexed user,
        bool verified
    );
    
    event ReferralRegistered(
        address indexed user,
        address indexed referrer
    );
    
    event TokenAddressUpdated(
        PaymentToken indexed token,
        address indexed tokenAddress
    );
    
    event PlatformConfigUpdated(
        uint256 platformFee,
        uint256 creatorFee,
        uint256 referralFee
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyVerifiedUser() {
        require(verifiedUsers[msg.sender] || userStats[msg.sender].reputation >= 100, "User not verified");
        _;
    }
    
    modifier validRaffle(uint256 _raffleId) {
        require(_raffleId > 0 && _raffleId < _raffleIdCounter, "Invalid raffle ID");
        _;
    }
    
    modifier onlyRaffleCreator(uint256 _raffleId) {
        require(raffles[_raffleId].creator == msg.sender, "Not raffle creator");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _feeRecipient,
        address _treasury,
        address _initialOwner
    ) Ownable(_initialOwner) {
        feeRecipient = _feeRecipient;
        treasury = _treasury;
        _raffleIdCounter = 1; // Empezar desde ID 1
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Crea una nueva rifa con funcionalidades mejoradas
     */
    function createRaffle(
        string memory _title,
        string memory _description,
        Prize[] memory _prizes,
        uint256 _ticketPrice,
        uint256 _maxParticipants,
        uint256 _duration,
        PaymentToken _paymentToken,
        RaffleType _raffleType,
        address _customTokenAddress,
        string[] memory _allowedAddresses,
        uint256 _recurringInterval,
        uint256 _maxRecurrences
    ) external payable whenNotPaused onlyVerifiedUser returns (uint256) {
        require(_ticketPrice >= minTicketPrice && _ticketPrice <= maxTicketPrice, "Invalid ticket price");
        require(_maxParticipants > _prizes.length && _maxParticipants <= maxParticipantsPerRaffle, "Invalid max participants");
        require(_prizes.length > 0 && _prizes.length <= maxPrizesPerRaffle, "Invalid prize count");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        if (_paymentToken == PaymentToken.CUSTOM_TOKEN) {
            require(_customTokenAddress != address(0), "Custom token address required");
        } else if (_paymentToken != PaymentToken.ETH) {
            require(tokenAddresses[_paymentToken] != address(0), "Token not supported");
        }
        
        if (_raffleType == RaffleType.PRIVATE) {
            require(_allowedAddresses.length > 0, "Private raffle requires allowed addresses");
        }
        
        uint256 raffleId = _raffleIdCounter;
        _raffleIdCounter++;
        
        uint256 endTime = block.timestamp + _duration;
        
        Raffle storage newRaffle = raffles[raffleId];
        newRaffle.id = raffleId;
        newRaffle.title = _title;
        newRaffle.description = _description;
        newRaffle.ticketPrice = _ticketPrice;
        newRaffle.maxParticipants = _maxParticipants;
        newRaffle.endTime = endTime;
        newRaffle.creator = msg.sender;
        newRaffle.raffleType = _raffleType;
        newRaffle.isActive = true;
        newRaffle.isDrawn = false;
        newRaffle.isCancelled = false;
        newRaffle.createdAt = block.timestamp;
        newRaffle.paymentToken = _paymentToken;
        newRaffle.customTokenAddress = _customTokenAddress;
        newRaffle.recurringInterval = _recurringInterval;
        newRaffle.maxRecurrences = _maxRecurrences;
        newRaffle.currentRecurrence = 0;
        
        // Copiar premios
        for (uint256 i = 0; i < _prizes.length; i++) {
            newRaffle.prizes.push(_prizes[i]);
        }
        
        // Copiar direcciones permitidas para rifas privadas
        for (uint256 i = 0; i < _allowedAddresses.length; i++) {
            newRaffle.allowedAddresses.push(_allowedAddresses[i]);
        }
        
        userRaffles[msg.sender].push(raffleId);
        userStats[msg.sender].totalRafflesCreated++;
        
        emit RaffleCreated(
            raffleId,
            msg.sender,
            _title,
            _ticketPrice,
            _maxParticipants,
            endTime,
            _paymentToken,
            _raffleType
        );
        
        return raffleId;
    }
    
    /**
     * @dev Permite a un usuario unirse a una rifa con sistema de referidos
     */
    function joinRaffle(
        uint256 _raffleId,
        address _referrer
    ) external payable nonReentrant whenNotPaused validRaffle(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isActive && !raffle.isDrawn && !raffle.isCancelled, "Raffle not available");
        require(block.timestamp < raffle.endTime, "Raffle has ended");
        require(!hasParticipated[_raffleId][msg.sender], "Already participating");
        require(raffle.totalParticipants < raffle.maxParticipants, "Raffle is full");
        
        // Verificar si es rifa privada
        if (raffle.raffleType == RaffleType.PRIVATE) {
            bool isAllowed = false;
            for (uint256 i = 0; i < raffle.allowedAddresses.length; i++) {
                if (keccak256(abi.encodePacked(raffle.allowedAddresses[i])) == 
                    keccak256(abi.encodePacked(_addressToString(msg.sender)))) {
                    isAllowed = true;
                    break;
                }
            }
            require(isAllowed, "Not allowed in private raffle");
        }
        
        // Procesar pago
        if (raffle.paymentToken == PaymentToken.ETH) {
            require(msg.value == raffle.ticketPrice, "Incorrect entry price");
        } else {
            require(msg.value == 0, "ETH not accepted for this raffle");
            address tokenAddress = raffle.paymentToken == PaymentToken.CUSTOM_TOKEN 
                ? raffle.customTokenAddress 
                : tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), raffle.ticketPrice);
        }
        
        // Registrar participante
        participants[_raffleId].push(msg.sender);
        hasParticipated[_raffleId][msg.sender] = true;
        raffle.totalParticipants++;
        raffle.totalPool += raffle.ticketPrice;
        
        // Actualizar estadísticas del usuario
        userStats[msg.sender].totalRafflesParticipated++;
        
        // Procesar referido si existe
        if (_referrer != address(0) && _referrer != msg.sender && referralData[_referrer].isActive) {
            referralData[_referrer].totalReferrals++;
            userStats[_referrer].reputation += 10; // Bonus de reputación por referir
        }
        
        emit ParticipantJoined(_raffleId, msg.sender, _referrer, raffle.totalParticipants);
    }
    
    /**
     * @dev Realiza el sorteo de ganadores usando VRF (Chainlink)
     */
    function drawWinners(uint256 _raffleId) external nonReentrant validRaffle(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isActive && !raffle.isDrawn && !raffle.isCancelled, "Raffle not available for drawing");
        require(block.timestamp >= raffle.endTime, "Raffle has not ended yet");
        require(raffle.totalParticipants >= raffle.prizes.length, "Not enough participants");
        require(msg.sender == raffle.creator || msg.sender == owner(), "Not authorized to draw");
        
        raffle.isDrawn = true;
        raffle.isActive = false;
        raffle.drawnAt = block.timestamp;
        
        // Calcular comisiones
        raffle.platformFee = (raffle.totalPool * platformFeePercentage) / 10000;
        raffle.creatorFee = (raffle.totalPool * creatorFeePercentage) / 10000;
        
        uint256 participantCount = raffle.totalParticipants;
        uint256 prizeCount = raffle.prizes.length;
        
        // Generar números aleatorios usando VRF
        for (uint256 i = 0; i < prizeCount; i++) {
            uint256 randomIndex = _generateSecureRandom(_raffleId, i, participantCount);
            address winner = participants[_raffleId][randomIndex];
            
            // Evitar ganadores duplicados
            while (_isWinnerAlreadySelected(_raffleId, winner) && winners[_raffleId].length < participantCount) {
                randomIndex = (randomIndex + 1) % participantCount;
                winner = participants[_raffleId][randomIndex];
            }
            
            winners[_raffleId].push(winner);
            userStats[winner].totalRafflesWon++;
        }
        
        emit RaffleDrawn(_raffleId, winners[_raffleId], prizeCount, block.timestamp);
        
        // Crear nueva instancia si es recurrente
        if (raffle.raffleType == RaffleType.RECURRING && 
            raffle.currentRecurrence < raffle.maxRecurrences) {
            _createRecurringRaffle(_raffleId);
        }
    }
    
    /**
     * @dev Permite a los ganadores reclamar sus premios
     */
    function claimPrize(uint256 _raffleId, uint256 _prizeIndex) external nonReentrant validRaffle(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isDrawn, "Winners not drawn yet");
        require(_prizeIndex < raffle.prizes.length, "Invalid prize index");
        require(_prizeIndex < winners[_raffleId].length, "Prize not awarded");
        require(winners[_raffleId][_prizeIndex] == msg.sender, "Not a winner");
        require(!raffle.prizes[_prizeIndex].isClaimed, "Prize already claimed");
        
        Prize storage prize = raffle.prizes[_prizeIndex];
        prize.isClaimed = true;
        
        uint256 prizeAmount = _calculatePrizeAmount(_raffleId, _prizeIndex);
        
        if (prize.prizeType == PrizeType.TOKEN) {
            if (raffle.paymentToken == PaymentToken.ETH) {
                (bool success, ) = msg.sender.call{value: prizeAmount}("");
                require(success, "Prize transfer failed");
            } else {
                address tokenAddress = raffle.paymentToken == PaymentToken.CUSTOM_TOKEN 
                    ? raffle.customTokenAddress 
                    : tokenAddresses[raffle.paymentToken];
                IERC20(tokenAddress).safeTransfer(msg.sender, prizeAmount);
            }
        } else if (prize.prizeType == PrizeType.NFT) {
            IERC721(prize.nftContract).safeTransferFrom(address(this), msg.sender, prize.nftTokenId);
        }
        
        userStats[msg.sender].totalWinnings += prizeAmount;
        userStats[msg.sender].reputation += 50; // Bonus de reputación por ganar
        
        emit PrizeClaimed(_raffleId, msg.sender, _prizeIndex, prizeAmount, prize.prizeType);
    }
    
    /**
     * @dev Cancela una rifa y reembolsa a los participantes
     */
    function cancelRaffle(uint256 _raffleId) external nonReentrant validRaffle(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isActive && !raffle.isDrawn, "Raffle cannot be cancelled");
        require(msg.sender == raffle.creator || msg.sender == owner(), "Not authorized to cancel");
        
        raffle.isActive = false;
        raffle.isCancelled = true;
        
        // Reembolsar a todos los participantes
        uint256 refundAmount = raffle.ticketPrice;
        for (uint256 i = 0; i < raffle.totalParticipants; i++) {
            address participant = participants[_raffleId][i];
            
            if (raffle.paymentToken == PaymentToken.ETH) {
                (bool success, ) = participant.call{value: refundAmount}("");
                require(success, "Refund failed");
            } else {
                address tokenAddress = raffle.paymentToken == PaymentToken.CUSTOM_TOKEN 
                    ? raffle.customTokenAddress 
                    : tokenAddresses[raffle.paymentToken];
                IERC20(tokenAddress).safeTransfer(participant, refundAmount);
            }
        }
        
        emit RaffleCancelled(_raffleId, raffle.creator, raffle.totalPool);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setTokenAddress(PaymentToken _token, address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        tokenAddresses[_token] = _tokenAddress;
        emit TokenAddressUpdated(_token, _tokenAddress);
    }
    
    function updatePlatformConfig(
        uint256 _platformFee,
        uint256 _creatorFee,
        uint256 _referralFee
    ) external onlyOwner {
        require(_platformFee <= 1000, "Platform fee cannot exceed 10%");
        require(_creatorFee <= 500, "Creator fee cannot exceed 5%");
        require(_referralFee <= 200, "Referral fee cannot exceed 2%");
        
        platformFeePercentage = _platformFee;
        creatorFeePercentage = _creatorFee;
        referralFeePercentage = _referralFee;
        
        emit PlatformConfigUpdated(_platformFee, _creatorFee, _referralFee);
    }
    
    function verifyUser(address _user, bool _verified) external onlyOwner {
        verifiedUsers[_user] = _verified;
        userStats[_user].isVerified = _verified;
        emit UserVerified(_user, _verified);
    }
    
    function setVRFConfig(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _fee
    ) external onlyOwner {
        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        fee = _fee;
    }
    
    function withdrawFees(uint256 _raffleId) external onlyOwner validRaffle(_raffleId) {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isDrawn, "Raffle not completed");
        
        if (raffle.paymentToken == PaymentToken.ETH) {
            (bool success, ) = feeRecipient.call{value: raffle.platformFee}("");
            require(success, "Fee transfer failed");
        } else {
            address tokenAddress = raffle.paymentToken == PaymentToken.CUSTOM_TOKEN 
                ? raffle.customTokenAddress 
                : tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransfer(feeRecipient, raffle.platformFee);
        }
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getRaffle(uint256 _raffleId) external view validRaffle(_raffleId) returns (Raffle memory) {
        return raffles[_raffleId];
    }
    
    function getRaffleParticipants(uint256 _raffleId) external view validRaffle(_raffleId) returns (address[] memory) {
        return participants[_raffleId];
    }
    
    function getRaffleWinners(uint256 _raffleId) external view validRaffle(_raffleId) returns (address[] memory) {
        return winners[_raffleId];
    }
    
    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }
    
    function getUserRaffles(address _user) external view returns (uint256[] memory) {
        return userRaffles[_user];
    }
    
    function getTotalRaffles() external view returns (uint256) {
        return _raffleIdCounter - 1;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _generateSecureRandom(
        uint256 _raffleId,
        uint256 _nonce,
        uint256 _max
    ) internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.difficulty,
                    blockhash(block.number - 1),
                    _raffleId,
                    _nonce,
                    msg.sender
                )
            )
        ) % _max;
    }
    
    function _isWinnerAlreadySelected(uint256 _raffleId, address _winner) internal view returns (bool) {
        for (uint256 i = 0; i < winners[_raffleId].length; i++) {
            if (winners[_raffleId][i] == _winner) {
                return true;
            }
        }
        return false;
    }
    
    function _calculatePrizeAmount(uint256 _raffleId, uint256 _prizeIndex) internal view returns (uint256) {
        Raffle storage raffle = raffles[_raffleId];
        uint256 availablePool = raffle.totalPool - raffle.platformFee - raffle.creatorFee;
        uint256 prizeCount = raffle.prizes.length;
        
        if (prizeCount == 1) {
            return availablePool;
        } else if (prizeCount == 2) {
            return _prizeIndex == 0 ? (availablePool * 70) / 100 : (availablePool * 30) / 100;
        } else if (prizeCount == 3) {
            if (_prizeIndex == 0) return (availablePool * 60) / 100;
            if (_prizeIndex == 1) return (availablePool * 25) / 100;
            return (availablePool * 15) / 100;
        } else {
            uint256 basePercentage = 100 / prizeCount;
            uint256 bonusPercentage = _prizeIndex < 3 ? (20 - _prizeIndex * 5) : 0;
            return (availablePool * (basePercentage + bonusPercentage)) / 100;
        }
    }
    
    function _createRecurringRaffle(uint256 _originalRaffleId) internal {
        Raffle storage originalRaffle = raffles[_originalRaffleId];
        
        uint256 newRaffleId = _raffleIdCounter;
        _raffleIdCounter++;
        
        Raffle storage newRaffle = raffles[newRaffleId];
        newRaffle.id = newRaffleId;
        newRaffle.title = originalRaffle.title;
        newRaffle.description = originalRaffle.description;
        newRaffle.ticketPrice = originalRaffle.ticketPrice;
        newRaffle.maxParticipants = originalRaffle.maxParticipants;
        newRaffle.endTime = block.timestamp + originalRaffle.recurringInterval;
        newRaffle.creator = originalRaffle.creator;
        newRaffle.raffleType = originalRaffle.raffleType;
        newRaffle.isActive = true;
        newRaffle.isDrawn = false;
        newRaffle.isCancelled = false;
        newRaffle.createdAt = block.timestamp;
        newRaffle.paymentToken = originalRaffle.paymentToken;
        newRaffle.customTokenAddress = originalRaffle.customTokenAddress;
        newRaffle.recurringInterval = originalRaffle.recurringInterval;
        newRaffle.maxRecurrences = originalRaffle.maxRecurrences;
        newRaffle.currentRecurrence = originalRaffle.currentRecurrence + 1;
        
        // Copiar premios
        for (uint256 i = 0; i < originalRaffle.prizes.length; i++) {
            newRaffle.prizes.push(originalRaffle.prizes[i]);
        }
        
        // Copiar direcciones permitidas
        for (uint256 i = 0; i < originalRaffle.allowedAddresses.length; i++) {
            newRaffle.allowedAddresses.push(originalRaffle.allowedAddresses[i]);
        }
        
        userRaffles[originalRaffle.creator].push(newRaffleId);
        
        emit RaffleCreated(
            newRaffleId,
            originalRaffle.creator,
            originalRaffle.title,
            originalRaffle.ticketPrice,
            originalRaffle.maxParticipants,
            newRaffle.endTime,
            originalRaffle.paymentToken,
            originalRaffle.raffleType
        );
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
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Permitir recibir ETH
    }
}

