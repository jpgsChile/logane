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
 * @title RaffleContractV2Optimized
 * @dev Versión optimizada del contrato de rifas con resolución de problemas de Stack too deep
 * @author Logane Team
 * @dev Version 2.1
 */
contract RaffleContractV2Optimized is ReentrancyGuard, Ownable, Pausable {
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
    
    // ============ STRUCTS OPTIMIZADOS ============
    
    // Struct más pequeño para premios
    struct Prize {
        string name;
        string description;
        string imageUrl;
        uint256 value;
        PrizeType prizeType;
        address nftContract;
        uint256 nftTokenId;
        bool isClaimed;
    }
    
    // Struct principal dividido en partes más pequeñas
    struct RaffleBasic {
        uint256 id;
        string title;
        string description;
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
        address customTokenAddress;
    }
    
    struct RaffleStats {
        uint256 totalParticipants;
        uint256 totalPool;
        uint256 platformFee;
        uint256 creatorFee;
        uint256 recurringInterval;
        uint256 maxRecurrences;
        uint256 currentRecurrence;
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
    
    // Mappings separados para evitar stack too deep
    mapping(uint256 => RaffleBasic) public raffles;
    mapping(uint256 => RaffleStats) public raffleStats;
    mapping(uint256 => Prize[]) public rafflePrizes;
    mapping(uint256 => string[]) public raffleAllowedAddresses;
    
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
    
    // ============ EXTERNAL FUNCTIONS OPTIMIZADAS ============
    
    /**
     * @dev Crea una nueva rifa con funcionalidades mejoradas - OPTIMIZADO
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
        // Validaciones básicas
        _validateRaffleCreation(_ticketPrice, _maxParticipants, _prizes.length, _duration, _title, _paymentToken, _customTokenAddress, _raffleType, _allowedAddresses);
        
        uint256 raffleId = _raffleIdCounter;
        _raffleIdCounter++;
        
        uint256 endTime = block.timestamp + _duration;
        
        // Crear rifa básica
        _createRaffleBasic(raffleId, _title, _description, _ticketPrice, _maxParticipants, endTime, _paymentToken, _raffleType, _customTokenAddress, _recurringInterval, _maxRecurrences);
        
        // Añadir premios
        _addPrizesToRaffle(raffleId, _prizes);
        
        // Añadir direcciones permitidas si es rifa privada
        if (_raffleType == RaffleType.PRIVATE) {
            _addAllowedAddresses(raffleId, _allowedAddresses);
        }
        
        // Actualizar estadísticas del usuario
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
     * @dev Permite a un usuario unirse a una rifa - OPTIMIZADO
     */
    function joinRaffle(
        uint256 _raffleId,
        address _referrer
    ) external payable nonReentrant whenNotPaused validRaffle(_raffleId) {
        // Validar estado de la rifa
        _validateRaffleJoin(_raffleId);
        
        // Procesar pago
        _processPayment(_raffleId);
        
        // Registrar participante
        _registerParticipant(_raffleId, _referrer);
        
        emit ParticipantJoined(_raffleId, msg.sender, _referrer, raffleStats[_raffleId].totalParticipants);
    }
    
    /**
     * @dev Realiza el sorteo de ganadores - OPTIMIZADO
     */
    function drawWinners(uint256 _raffleId) external nonReentrant validRaffle(_raffleId) {
        // Validar condiciones de sorteo
        _validateDrawConditions(_raffleId);
        
        // Marcar como sorteado
        raffles[_raffleId].isDrawn = true;
        raffles[_raffleId].isActive = false;
        raffles[_raffleId].drawnAt = block.timestamp;
        
        // Calcular comisiones
        _calculateFees(_raffleId);
        
        // Seleccionar ganadores
        _selectWinners(_raffleId);
        
        emit RaffleDrawn(_raffleId, winners[_raffleId], rafflePrizes[_raffleId].length, block.timestamp);
        
        // Crear nueva instancia si es recurrente
        if (raffles[_raffleId].raffleType == RaffleType.RECURRING && 
            raffleStats[_raffleId].currentRecurrence < raffleStats[_raffleId].maxRecurrences) {
            _createRecurringRaffle(_raffleId);
        }
    }
    
    /**
     * @dev Permite a los ganadores reclamar sus premios - OPTIMIZADO
     */
    function claimPrize(uint256 _raffleId, uint256 _prizeIndex) external nonReentrant validRaffle(_raffleId) {
        // Validar reclamación
        _validatePrizeClaim(_raffleId, _prizeIndex);
        
        // Marcar premio como reclamado
        rafflePrizes[_raffleId][_prizeIndex].isClaimed = true;
        
        // Calcular y transferir premio
        uint256 prizeAmount = _calculatePrizeAmount(_raffleId, _prizeIndex);
        _transferPrize(_raffleId, _prizeIndex, prizeAmount);
        
        // Actualizar estadísticas del ganador
        userStats[msg.sender].totalWinnings += prizeAmount;
        userStats[msg.sender].reputation += 50;
        
        emit PrizeClaimed(_raffleId, msg.sender, _prizeIndex, prizeAmount, rafflePrizes[_raffleId][_prizeIndex].prizeType);
    }
    
    /**
     * @dev Cancela una rifa y reembolsa a los participantes - OPTIMIZADO
     */
    function cancelRaffle(uint256 _raffleId) external nonReentrant validRaffle(_raffleId) {
        // Validar cancelación
        _validateCancellation(_raffleId);
        
        // Marcar como cancelada
        raffles[_raffleId].isActive = false;
        raffles[_raffleId].isCancelled = true;
        
        // Reembolsar participantes
        _refundParticipants(_raffleId);
        
        emit RaffleCancelled(_raffleId, raffles[_raffleId].creator, raffleStats[_raffleId].totalPool);
    }
    
    // ============ INTERNAL FUNCTIONS OPTIMIZADAS ============
    
    function _validateRaffleCreation(
        uint256 _ticketPrice,
        uint256 _maxParticipants,
        uint256 _prizeCount,
        uint256 _duration,
        string memory _title,
        PaymentToken _paymentToken,
        address _customTokenAddress,
        RaffleType _raffleType,
        string[] memory _allowedAddresses
    ) internal pure {
        require(_ticketPrice >= 0.001 ether && _ticketPrice <= 100 ether, "Invalid ticket price");
        require(_maxParticipants > _prizeCount && _maxParticipants <= 10000, "Invalid max participants");
        require(_prizeCount > 0 && _prizeCount <= 10, "Invalid prize count");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        if (_paymentToken == PaymentToken.CUSTOM_TOKEN) {
            require(_customTokenAddress != address(0), "Custom token address required");
        }
        
        if (_raffleType == RaffleType.PRIVATE) {
            require(_allowedAddresses.length > 0, "Private raffle requires allowed addresses");
        }
    }
    
    function _createRaffleBasic(
        uint256 _raffleId,
        string memory _title,
        string memory _description,
        uint256 _ticketPrice,
        uint256 _maxParticipants,
        uint256 _endTime,
        PaymentToken _paymentToken,
        RaffleType _raffleType,
        address _customTokenAddress,
        uint256 _recurringInterval,
        uint256 _maxRecurrences
    ) internal {
        RaffleBasic storage raffle = raffles[_raffleId];
        raffle.id = _raffleId;
        raffle.title = _title;
        raffle.description = _description;
        raffle.ticketPrice = _ticketPrice;
        raffle.maxParticipants = _maxParticipants;
        raffle.endTime = _endTime;
        raffle.creator = msg.sender;
        raffle.raffleType = _raffleType;
        raffle.isActive = true;
        raffle.isDrawn = false;
        raffle.isCancelled = false;
        raffle.createdAt = block.timestamp;
        raffle.paymentToken = _paymentToken;
        raffle.customTokenAddress = _customTokenAddress;
        
        RaffleStats storage stats = raffleStats[_raffleId];
        stats.recurringInterval = _recurringInterval;
        stats.maxRecurrences = _maxRecurrences;
        stats.currentRecurrence = 0;
    }
    
    function _addPrizesToRaffle(uint256 _raffleId, Prize[] memory _prizes) internal {
        for (uint256 i = 0; i < _prizes.length; i++) {
            rafflePrizes[_raffleId].push(_prizes[i]);
        }
    }
    
    function _addAllowedAddresses(uint256 _raffleId, string[] memory _allowedAddresses) internal {
        for (uint256 i = 0; i < _allowedAddresses.length; i++) {
            raffleAllowedAddresses[_raffleId].push(_allowedAddresses[i]);
        }
    }
    
    function _validateRaffleJoin(uint256 _raffleId) internal view {
        RaffleBasic storage raffle = raffles[_raffleId];
        RaffleStats storage stats = raffleStats[_raffleId];
        
        require(raffle.isActive && !raffle.isDrawn && !raffle.isCancelled, "Raffle not available");
        require(block.timestamp < raffle.endTime, "Raffle has ended");
        require(!hasParticipated[_raffleId][msg.sender], "Already participating");
        require(stats.totalParticipants < raffle.maxParticipants, "Raffle is full");
        
        // Verificar si es rifa privada
        if (raffle.raffleType == RaffleType.PRIVATE) {
            _validatePrivateRaffleAccess(_raffleId);
        }
    }
    
    function _validatePrivateRaffleAccess(uint256 _raffleId) internal view {
        string[] storage allowedAddresses = raffleAllowedAddresses[_raffleId];
        string memory userAddress = _addressToString(msg.sender);
        
        bool isAllowed = false;
        for (uint256 i = 0; i < allowedAddresses.length; i++) {
            if (keccak256(abi.encodePacked(allowedAddresses[i])) == keccak256(abi.encodePacked(userAddress))) {
                isAllowed = true;
                break;
            }
        }
        require(isAllowed, "Not allowed in private raffle");
    }
    
    function _processPayment(uint256 _raffleId) internal {
        RaffleBasic storage raffle = raffles[_raffleId];
        
        if (raffle.paymentToken == PaymentToken.ETH) {
            require(msg.value == raffle.ticketPrice, "Incorrect entry price");
        } else {
            require(msg.value == 0, "ETH not accepted for this raffle");
            address tokenAddress = raffle.paymentToken == PaymentToken.CUSTOM_TOKEN 
                ? raffle.customTokenAddress 
                : tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), raffle.ticketPrice);
        }
    }
    
    function _registerParticipant(uint256 _raffleId, address _referrer) internal {
        participants[_raffleId].push(msg.sender);
        hasParticipated[_raffleId][msg.sender] = true;
        
        RaffleStats storage stats = raffleStats[_raffleId];
        stats.totalParticipants++;
        stats.totalPool += raffles[_raffleId].ticketPrice;
        
        // Actualizar estadísticas del usuario
        userStats[msg.sender].totalRafflesParticipated++;
        
        // Procesar referido si existe
        if (_referrer != address(0) && _referrer != msg.sender && referralData[_referrer].isActive) {
            referralData[_referrer].totalReferrals++;
            userStats[_referrer].reputation += 10;
        }
    }
    
    function _validateDrawConditions(uint256 _raffleId) internal view {
        RaffleBasic storage raffle = raffles[_raffleId];
        RaffleStats storage stats = raffleStats[_raffleId];
        
        require(raffle.isActive && !raffle.isDrawn && !raffle.isCancelled, "Raffle not available for drawing");
        require(block.timestamp >= raffle.endTime, "Raffle has not ended yet");
        require(stats.totalParticipants >= rafflePrizes[_raffleId].length, "Not enough participants");
        require(msg.sender == raffle.creator || msg.sender == owner(), "Not authorized to draw");
    }
    
    function _calculateFees(uint256 _raffleId) internal {
        RaffleStats storage stats = raffleStats[_raffleId];
        stats.platformFee = (stats.totalPool * platformFeePercentage) / 10000;
        stats.creatorFee = (stats.totalPool * creatorFeePercentage) / 10000;
    }
    
    function _selectWinners(uint256 _raffleId) internal {
        uint256 participantCount = raffleStats[_raffleId].totalParticipants;
        uint256 prizeCount = rafflePrizes[_raffleId].length;
        
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
    }
    
    function _validatePrizeClaim(uint256 _raffleId, uint256 _prizeIndex) internal view {
        RaffleBasic storage raffle = raffles[_raffleId];
        
        require(raffle.isDrawn, "Winners not drawn yet");
        require(_prizeIndex < rafflePrizes[_raffleId].length, "Invalid prize index");
        require(_prizeIndex < winners[_raffleId].length, "Prize not awarded");
        require(winners[_raffleId][_prizeIndex] == msg.sender, "Not a winner");
        require(!rafflePrizes[_raffleId][_prizeIndex].isClaimed, "Prize already claimed");
    }
    
    function _transferPrize(uint256 _raffleId, uint256 _prizeIndex, uint256 _prizeAmount) internal {
        RaffleBasic storage raffle = raffles[_raffleId];
        Prize storage prize = rafflePrizes[_raffleId][_prizeIndex];
        
        if (prize.prizeType == PrizeType.TOKEN) {
            if (raffle.paymentToken == PaymentToken.ETH) {
                (bool success, ) = msg.sender.call{value: _prizeAmount}("");
                require(success, "Prize transfer failed");
            } else {
                address tokenAddress = raffle.paymentToken == PaymentToken.CUSTOM_TOKEN 
                    ? raffle.customTokenAddress 
                    : tokenAddresses[raffle.paymentToken];
                IERC20(tokenAddress).safeTransfer(msg.sender, _prizeAmount);
            }
        } else if (prize.prizeType == PrizeType.NFT) {
            IERC721(prize.nftContract).safeTransferFrom(address(this), msg.sender, prize.nftTokenId);
        }
    }
    
    function _validateCancellation(uint256 _raffleId) internal view {
        RaffleBasic storage raffle = raffles[_raffleId];
        require(raffle.isActive && !raffle.isDrawn, "Raffle cannot be cancelled");
        require(msg.sender == raffle.creator || msg.sender == owner(), "Not authorized to cancel");
    }
    
    function _refundParticipants(uint256 _raffleId) internal {
        RaffleBasic storage raffle = raffles[_raffleId];
        uint256 refundAmount = raffle.ticketPrice;
        
        for (uint256 i = 0; i < raffleStats[_raffleId].totalParticipants; i++) {
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
    }
    
    function _calculatePrizeAmount(uint256 _raffleId, uint256 _prizeIndex) internal view returns (uint256) {
        RaffleStats storage stats = raffleStats[_raffleId];
        uint256 availablePool = stats.totalPool - stats.platformFee - stats.creatorFee;
        uint256 prizeCount = rafflePrizes[_raffleId].length;
        
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
    
    function _createRecurringRaffle(uint256 _originalRaffleId) internal {
        RaffleBasic storage originalRaffle = raffles[_originalRaffleId];
        RaffleStats storage originalStats = raffleStats[_originalRaffleId];
        
        uint256 newRaffleId = _raffleIdCounter;
        _raffleIdCounter++;
        
        // Crear nueva rifa básica
        _createRaffleBasic(
            newRaffleId,
            originalRaffle.title,
            originalRaffle.description,
            originalRaffle.ticketPrice,
            originalRaffle.maxParticipants,
            block.timestamp + originalStats.recurringInterval,
            originalRaffle.paymentToken,
            originalRaffle.raffleType,
            originalRaffle.customTokenAddress,
            originalStats.recurringInterval,
            originalStats.maxRecurrences
        );
        
        // Copiar premios
        Prize[] storage originalPrizes = rafflePrizes[_originalRaffleId];
        for (uint256 i = 0; i < originalPrizes.length; i++) {
            rafflePrizes[newRaffleId].push(originalPrizes[i]);
        }
        
        // Copiar direcciones permitidas
        string[] storage originalAllowed = raffleAllowedAddresses[_originalRaffleId];
        for (uint256 i = 0; i < originalAllowed.length; i++) {
            raffleAllowedAddresses[newRaffleId].push(originalAllowed[i]);
        }
        
        // Actualizar recurrencia
        raffleStats[newRaffleId].currentRecurrence = originalStats.currentRecurrence + 1;
        
        userRaffles[originalRaffle.creator].push(newRaffleId);
        
        emit RaffleCreated(
            newRaffleId,
            originalRaffle.creator,
            originalRaffle.title,
            originalRaffle.ticketPrice,
            originalRaffle.maxParticipants,
            block.timestamp + originalStats.recurringInterval,
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
        RaffleBasic storage raffle = raffles[_raffleId];
        RaffleStats storage stats = raffleStats[_raffleId];
        
        require(raffle.isDrawn, "Raffle not completed");
        
        if (raffle.paymentToken == PaymentToken.ETH) {
            (bool success, ) = feeRecipient.call{value: stats.platformFee}("");
            require(success, "Fee transfer failed");
        } else {
            address tokenAddress = raffle.paymentToken == PaymentToken.CUSTOM_TOKEN 
                ? raffle.customTokenAddress 
                : tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransfer(feeRecipient, stats.platformFee);
        }
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getRaffle(uint256 _raffleId) external view validRaffle(_raffleId) returns (
        RaffleBasic memory raffle,
        RaffleStats memory stats,
        Prize[] memory prizes,
        string[] memory allowedAddresses
    ) {
        raffle = raffles[_raffleId];
        stats = raffleStats[_raffleId];
        prizes = rafflePrizes[_raffleId];
        allowedAddresses = raffleAllowedAddresses[_raffleId];
    }
    
    function getRaffleParticipants(uint256 _raffleId) external view validRaffle(_raffleId) returns (address[] memory) {
        return participants[_raffleId];
    }
    
    function getRaffleWinners(uint256 _raffleId) external view validRaffle(_raffleId) returns (address[] memory) {
        return winners[_raffleId];
    }
    
    function getRafflePrizes(uint256 _raffleId) external view validRaffle(_raffleId) returns (Prize[] memory) {
        return rafflePrizes[_raffleId];
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
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Permitir recibir ETH
    }
}

