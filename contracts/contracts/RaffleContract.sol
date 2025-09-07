// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RaffleContract
 * @dev Contrato inteligente para gestionar sorteos con múltiples premios y tokens de pago(ETH, USDC, USDT)
 */
contract RaffleContract is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    //Token que permite la Rifa o Premio
    enum PaymentToken {
        ETH,
        USDT,
        USDC
    }
    

    //Base de premios
    struct Prize {
        string name;
        string description;
        string imageUrl;
        uint256 value; // Prize value in wei or token units
    }
    
    //Base de rifa
    struct Raffle {
        uint256 id;
        string title; //Nombre del sorteo
        string description; //Descripción del sorteo, ejemplo RIFA BENEFICIO, SORTEO PREMIOS a REPARTIR
        Prize[9] prizes; // Para sortear hasta 9 premios
        uint256 prizeCount; // Número actual de premios (1-9)
        uint256 ticketPrice; // Valor del sorteo
        uint256 maxParticipants; //Maximo de participantes
        uint256 endTime; //Fecha de sorteo
        address creator; // Dirección creador
        address[] participants; //Direcciones de participantes
        bool isActive; // Activa o Desactiva
        bool isDrawn; // Contiene imagen
        address[9] winners; // Ganadores por premio (hasta 9)
        uint256 createdAt; 
        PaymentToken paymentToken; //Coin del pago del premio
    }


    mapping(uint256 => Raffle) public raffles; // Mapping de Rifas
    mapping(address => uint256[]) public userRaffles; // Mapping de usuarios por lista
    mapping(uint256 => mapping(address => bool)) public hasParticipated; // 
    
    mapping(PaymentToken => address) public tokenAddresses; // Mapping del pago de la rifa
    
    uint256 public nextRaffleId = 1;
    uint256 public platformFeePercentage = 250; // 2.5%
    address public feeRecipient;
    
    event RaffleCreated( // Evento de creación de rifa
        uint256 indexed raffleId, // 
        address indexed creator,
        string title,
        uint256 ticketPrice,
        uint256 maxParticipants,
        uint256 endTime,
        PaymentToken paymentToken
    );
    

    event ParticipantJoined( // Evento de creación de participante
        uint256 indexed raffleId,
        address indexed participant,
        uint256 participantCount
    );
    
    event RaffleDrawn( // Sorteo completado
        uint256 indexed raffleId,
        address[9] winners,
        uint256 prizeCount,
        uint256 timestamp
    );
    
    event PrizeClaimed( // Registra los premios reclamados
        uint256 indexed raffleId,
        address indexed winner,
        uint256 prizeIndex,
        uint256 amount
    );
    
    //Registra de la coin actualizada
    event TokenAddressUpdated(PaymentToken indexed token, address indexed tokenAddress); // 
    

    constructor(address _feeRecipient) { // Se usa para validación de dirección inválida
        feeRecipient = _feeRecipient;
    }

    // configura dirección para el token de pago    
    function setTokenAddress(PaymentToken _token, address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        tokenAddresses[_token] = _tokenAddress;
        emit TokenAddressUpdated(_token, _tokenAddress);
    }
    
    //Crea rifa
    function createRaffle(
        string memory _title,
        string memory _description,
        Prize[9] memory _prizes,
        uint256 _prizeCount,
        uint256 _ticketPrice,
        uint256 _maxParticipants,
        uint256 _duration,
        PaymentToken _paymentToken
    ) external whenNotPaused returns (uint256) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxParticipants > _prizeCount, "Must have at least 1 more participant than prizes");
        require(_prizeCount > 0 && _prizeCount <= 9, "Must have between 1 and 9 prizes");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        if (_paymentToken != PaymentToken.ETH) {
            require(tokenAddresses[_paymentToken] != address(0), "Token not supported");
        }
        
        uint256 raffleId = nextRaffleId++;
        uint256 endTime = block.timestamp + _duration;
        
        Raffle storage newRaffle = raffles[raffleId]; // Creador de la rifa
        newRaffle.id = raffleId; // identificador unico de la rifa
        newRaffle.title = _title; // Título de la rifa
        newRaffle.description = _description; // Descripción de la rifa o premio
        // Copy prizes to storage
        for (uint256 i = 0; i < 9; i++) {
            newRaffle.prizes[i] = _prizes[i];
        }
        newRaffle.prizeCount = _prizeCount; // Número de premios
        newRaffle.ticketPrice = _ticketPrice; //Valor de la rifa o el ticket
        newRaffle.maxParticipants = _maxParticipants; // Maximo de participantes
        newRaffle.endTime = endTime; // Fecha del sorteo
        newRaffle.creator = msg.sender; // Creador
        newRaffle.isActive = true; // Activa o Desactiva/Sorteada
        newRaffle.isDrawn = false; // Se adjunto imagen del premio
        newRaffle.createdAt = block.timestamp; // Sella el contrato
        newRaffle.paymentToken = _paymentToken; // Token de pago 
        
        userRaffles[msg.sender].push(raffleId);
        
        //Creación la transacción rifa
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
        
        require(raffle.isActive, "Raffle not active");
        require(block.timestamp < raffle.endTime, "Raffle has ended");
        require(!hasParticipated[_raffleId][msg.sender], "Already participating in this raffle");
        require(raffle.participants.length < raffle.maxParticipants, "Raffle is full");
        
        if (raffle.paymentToken == PaymentToken.ETH) {
            require(msg.value == raffle.ticketPrice, "Incorrect entry price");
        } else {
            require(msg.value == 0, "Coin not accepted for this raffle");
            address tokenAddress = tokenAddresses[raffle.paymentToken];
            IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), raffle.ticketPrice);
        }
        
        raffle.participants.push(msg.sender);
        hasParticipated[_raffleId][msg.sender] = true;
        
        emit ParticipantJoined(_raffleId, msg.sender, raffle.participants.length);
    }
    
    function drawWinners(uint256 _raffleId) external nonReentrant {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isActive, "Raffle not active");
        require(block.timestamp >= raffle.endTime, "Raffle has not ended yet");
        require(!raffle.isDrawn, "Winners already drawn");
        require(raffle.participants.length >= raffle.prizeCount, "Not enough participants");
        
        raffle.isDrawn = true;
        raffle.isActive = false;
        
        uint256 participantCount = raffle.participants.length;
        uint256[] memory availableIndices = new uint256[](participantCount);
        
        // Inicializar índices disponibles
        for (uint256 i = 0; i < participantCount; i++) {
            availableIndices[i] = i;
        }
        
        // Seleccionar ganadores sin repetir
        for (uint256 i = 0; i < raffle.prizeCount; i++) {
            if (availableIndices.length > 0) {
                uint256 randomIndex = _generateRandomNumber(_raffleId, i) % availableIndices.length;
                uint256 selectedParticipantIndex = availableIndices[randomIndex];
                raffle.winners[i] = raffle.participants[selectedParticipantIndex];
                
                // Remover el índice seleccionado
                availableIndices[randomIndex] = availableIndices[availableIndices.length - 1];
                // Simular pop() reduciendo la longitud
                assembly {
                    mstore(availableIndices, sub(mload(availableIndices), 1))
                }
            }
        }
        
        emit RaffleDrawn(_raffleId, raffle.winners, raffle.prizeCount, block.timestamp);
    }
    
    function claimPrize(uint256 _raffleId, uint256 _prizeIndex) external nonReentrant {
        Raffle storage raffle = raffles[_raffleId];
        
        require(raffle.isDrawn, "Winners not drawn yet");
        require(_prizeIndex < raffle.prizeCount, "Invalid prize index");
        require(raffle.winners[_prizeIndex] == msg.sender, "Not a winner");
        require(raffle.winners[_prizeIndex] != address(0), "Prize already claimed");
        
        address winner = msg.sender;
        raffle.winners[_prizeIndex] = address(0); // Marcar como reclamado
        
        uint256 totalPool = raffle.participants.length * raffle.ticketPrice;
        uint256 platformFee = (totalPool * platformFeePercentage) / 10000;
        uint256 prizePool = totalPool - platformFee;
        
        // Distribución proporcional de premios
        uint256 prizeAmount;
        if (raffle.prizeCount == 1) {
            prizeAmount = prizePool; // 100% para un solo premio
        } else if (raffle.prizeCount == 2) {
            prizeAmount = _prizeIndex == 0 ? (prizePool * 70) / 100 : (prizePool * 30) / 100;
        } else if (raffle.prizeCount == 3) {
            if (_prizeIndex == 0) {
                prizeAmount = (prizePool * 60) / 100; // 60% primer premio
            } else if (_prizeIndex == 1) {
                prizeAmount = (prizePool * 25) / 100; // 25% segundo premio
            } else {
                prizeAmount = (prizePool * 15) / 100; // 15% tercer premio
            }
        } else {
            // Para 4+ premios, distribución más equitativa
            uint256 basePercentage = 100 / raffle.prizeCount;
            uint256 bonusPercentage = _prizeIndex < 3 ? (20 - _prizeIndex * 5) : 0;
            prizeAmount = (prizePool * (basePercentage + bonusPercentage)) / 100;
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
        addresses[0] = address(0); // ETH no tiene dirección de contrato
        
        tokens[1] = PaymentToken.USDT;
        addresses[1] = tokenAddresses[PaymentToken.USDT];
        
        tokens[2] = PaymentToken.USDC;
        addresses[2] = tokenAddresses[PaymentToken.USDC];
        
        return (tokens, addresses);
    }
}
