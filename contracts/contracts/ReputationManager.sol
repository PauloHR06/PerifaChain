// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IProjectRegistry {
    enum ProjectStatus { 
        PENDING, APPROVED, FUNDING, FUNDED, ACTIVE, COMPLETED, CANCELLED 
    }
    
    function getProject(uint256 _projectId) external view returns (
        uint256 id,
        address artist,
        string memory title,
        string memory description,
        string memory demoUri,
        uint256 fundingGoal,
        uint256 fundingDeadline,
        uint256 repaymentDeadline,
        uint256 interestRate,
        ProjectStatus status,
        bool allowsRoyaltyRepayment,
        uint256 createdAt,
        uint256 approvedAt
    );
}

interface IRepaymentManager {
    function getRepaymentStatus(uint256 _projectId) 
        external 
        view 
        returns (
            uint256 totalOwed,
            uint256 totalPaid,
            uint256 remainingDebt,
            bool isCompleted,
            uint256 nextPaymentDue
        );
}

contract ReputationManager is Ownable, ReentrancyGuard {
    IProjectRegistry public projectRegistry;
    IRepaymentManager public repaymentManager;
    
    struct ReputationData {
        uint256 score;              // Score atual (0-1000)
        uint256 projectsCompleted;  // Projetos finalizados
        uint256 projectsTotal;      // Total de projetos
        uint256 onTimePayments;     // Pagamentos pontuais
        uint256 latePayments;       // Pagamentos atrasados
        uint256 totalRaised;        // Total captado historicamente
        uint256 lastUpdated;        // Última atualização
        bool isVerified;            // Verificação manual da equipe
    }
    
    struct DeliveryRecord {
        uint256 projectId;
        string deliverableType;     // "demo", "album", "video", "show"
        string ipfsHash;           // Hash IPFS da entrega
        uint256 timestamp;
        bool isOnTime;             // Se foi entregue no prazo
        uint256 qualityScore;      // Avaliação da qualidade (1-100)
        bytes32 offChainDataHash;  // Hash dos dados off-chain
    }
    
    struct SocialMetrics {
        uint256 followersCount;
        uint256 engagementRate;    // Taxa de engajamento (base 10000)
        uint256 streamingPlays;    // Plays em plataformas de streaming
        uint256 lastSocialUpdate;
        string[] verifiedPlatforms; // "spotify", "instagram", "youtube", etc.
    }
    
    mapping(address => ReputationData) public artistReputation;
    mapping(address => DeliveryRecord[]) public deliveryHistory;
    mapping(address => SocialMetrics) public socialMetrics;
    mapping(address => bool) public artistExists;
    
    // Oráculos autorizados para atualizar dados sociais
    mapping(address => bool) public socialOracles;
    
    // Pesos para cálculo de reputação (base 10000 = 100%)
    uint256 public deliveryWeight = 4000;      // 40%
    uint256 public qualityWeight = 2500;       // 25%
    uint256 public paymentWeight = 2000;       // 20%
    uint256 public engagementWeight = 1000;    // 10%
    uint256 public transparencyWeight = 500;   // 5%
    
    // Bônus por consistência
    uint256 public consistencyBonus = 200;     // Até 20% de bônus
    
    // Score mínimo para aprovação automática
    uint256 public minimumApprovalScore = 600; // 60%
    
    event ReputationUpdated(
        address indexed artist,
        uint256 oldScore,
        uint256 newScore,
        string reason
    );
    
    event DeliveryRecorded(
        address indexed artist,
        uint256 indexed projectId,
        string deliverableType,
        bool isOnTime,
        uint256 qualityScore
    );
    
    event SocialMetricsUpdated(
        address indexed artist,
        uint256 followers,
        uint256 engagementRate,
        address indexed oracle
    );
    
    event ArtistVerified(
        address indexed artist,
        address indexed verifier
    );
    
    constructor(
        address _projectRegistry,
        address _repaymentManager
    ) {
        projectRegistry = IProjectRegistry(_projectRegistry);
        repaymentManager = IRepaymentManager(_repaymentManager);
    }
    
    modifier onlyAuthorizedOracle() {
        require(socialOracles[msg.sender] || msg.sender == owner(), "Oracle nao autorizado");
        _;
    }
    
    function initializeArtist(address _artist) external {
        require(!artistExists[_artist], "Artista ja existe");
        
        artistReputation[_artist] = ReputationData({
            score: 500,           // Score inicial médio
            projectsCompleted: 0,
            projectsTotal: 0,
            onTimePayments: 0,
            latePayments: 0,
            totalRaised: 0,
            lastUpdated: block.timestamp,
            isVerified: false
        });
        
        artistExists[_artist] = true;
    }
    
    function recordDelivery(
        address _artist,
        uint256 _projectId,
        string memory _deliverableType,
        string memory _ipfsHash,
        bool _isOnTime,
        uint256 _qualityScore,
        bytes32 _offChainDataHash
    ) external onlyOwner {
        require(artistExists[_artist], "Artista nao existe");
        require(_qualityScore >= 1 && _qualityScore <= 100, "Score qualidade invalido");
        
        deliveryHistory[_artist].push(DeliveryRecord({
            projectId: _projectId,
            deliverableType: _deliverableType,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            isOnTime: _isOnTime,
            qualityScore: _qualityScore,
            offChainDataHash: _offChainDataHash
        }));
        
        // Atualizar contadores de projetos
        ReputationData storage rep = artistReputation[_artist];
        rep.projectsTotal++;
        
        // Verificar se projeto foi completado para atualizar contadores
        (, , , bool isCompleted,) = repaymentManager.getRepaymentStatus(_projectId);
        if (isCompleted) {
            rep.projectsCompleted++;
        }
        
        emit DeliveryRecorded(_artist, _projectId, _deliverableType, _isOnTime, _qualityScore);
        
        // Recalcular score
        _updateReputationScore(_artist);
    }
    
    function updateSocialMetrics(
        address _artist,
        uint256 _followersCount,
        uint256 _engagementRate,
        uint256 _streamingPlays,
        string[] memory _verifiedPlatforms
    ) external onlyAuthorizedOracle {
        require(artistExists[_artist], "Artista nao existe");
        require(_engagementRate <= 10000, "Taxa engajamento invalida");
        
        SocialMetrics storage metrics = socialMetrics[_artist];
        metrics.followersCount = _followersCount;
        metrics.engagementRate = _engagementRate;
        metrics.streamingPlays = _streamingPlays;
        metrics.lastSocialUpdate = block.timestamp;
        metrics.verifiedPlatforms = _verifiedPlatforms;
        
        emit SocialMetricsUpdated(_artist, _followersCount, _engagementRate, msg.sender);
        
        // Recalcular score
        _updateReputationScore(_artist);
    }
    
    function updatePaymentMetrics(address _artist, uint256 _projectId) external {
        require(artistExists[_artist], "Artista nao existe");
        
        ReputationData storage rep = artistReputation[_artist];
        
        // Verificar status do repagamento
        (, , , bool isCompleted, uint256 nextPaymentDue) = repaymentManager.getRepaymentStatus(_projectId);
        
        if (isCompleted) {
            rep.onTimePayments++;
        } else if (block.timestamp > nextPaymentDue) {
            rep.latePayments++;
        }
        
        // Recalcular score
        _updateReputationScore(_artist);
    }
    
    function _updateReputationScore(address _artist) internal {
        ReputationData storage rep = artistReputation[_artist];
        uint256 oldScore = rep.score;
        
        // 1. Score de entregas (40%)
        uint256 deliveryScore = 0;
        if (rep.projectsTotal > 0) {
            deliveryScore = (rep.projectsCompleted * 1000) / rep.projectsTotal;
        } else {
            deliveryScore = 500; // Score neutro para novos artistas
        }
        
        // 2. Score de qualidade (25%)
        uint256 qualityScore = _calculateQualityScore(_artist);
        
        // 3. Score de pagamentos (20%)
        uint256 paymentScore = 0;
        uint256 totalPayments = rep.onTimePayments + rep.latePayments;
        if (totalPayments > 0) {
            paymentScore = (rep.onTimePayments * 1000) / totalPayments;
        } else {
            paymentScore = 500; // Score neutro
        }
        
        // 4. Score de engajamento (10%)
        uint256 engagementScore = _calculateEngagementScore(_artist);
        
        // 5. Score de transparência (5%)
        uint256 transparencyScore = _calculateTransparencyScore(_artist);
        
        // Calcular score final
        uint256 newScore = (
            (deliveryScore * deliveryWeight) +
            (qualityScore * qualityWeight) +
            (paymentScore * paymentWeight) +
            (engagementScore * engagementWeight) +
            (transparencyScore * transparencyWeight)
        ) / 10000;
        
        // Aplicar bônus de consistência
        uint256 consistency = _calculateConsistencyBonus(_artist);
        newScore = newScore + ((newScore * consistency) / 10000);
        
        // Garantir que não ultrapasse 1000
        if (newScore > 1000) {
            newScore = 1000;
        }
        
        rep.score = newScore;
        rep.lastUpdated = block.timestamp;
        
        emit ReputationUpdated(_artist, oldScore, newScore, "Score recalculado");
    }
    
    function _calculateQualityScore(address _artist) internal view returns (uint256) {
        DeliveryRecord[] memory deliveries = deliveryHistory[_artist];
        if (deliveries.length == 0) return 500;
        
        uint256 totalQuality = 0;
        for (uint256 i = 0; i < deliveries.length; i++) {
            totalQuality += deliveries[i].qualityScore;
        }
        
        return (totalQuality * 10) / deliveries.length; // Converter para escala 0-1000
    }
    
    function _calculateEngagementScore(address _artist) internal view returns (uint256) {
        SocialMetrics memory metrics = socialMetrics[_artist];
        
        // Score baseado em engajamento e seguidores
        uint256 engagementFactor = metrics.engagementRate * 100; // Converter para escala 0-1000
        uint256 followerFactor = 0;
        
        if (metrics.followersCount > 100000) {
            followerFactor = 1000;
        } else if (metrics.followersCount > 10000) {
            followerFactor = 800;
        } else if (metrics.followersCount > 1000) {
            followerFactor = 600;
        } else {
            followerFactor = 400;
        }
        
        return (engagementFactor + followerFactor) / 2;
    }
    
    function _calculateTransparencyScore(address _artist) internal view returns (uint256) {
        SocialMetrics memory metrics = socialMetrics[_artist];
        DeliveryRecord[] memory deliveries = deliveryHistory[_artist];
        
        uint256 score = 500; // Base
        
        // Bônus por plataformas verificadas
        score += metrics.verifiedPlatforms.length * 100;
        
        // Bônus por entregas documentadas
        score += deliveries.length * 50;
        
        // Bônus por verificação manual
        if (artistReputation[_artist].isVerified) {
            score += 200;
        }
        
        return score > 1000 ? 1000 : score;
    }
    
    function _calculateConsistencyBonus(address _artist) internal view returns (uint256) {
        ReputationData memory rep = artistReputation[_artist];
        
        if (rep.projectsTotal < 3) return 0; // Precisa de pelo menos 3 projetos
        
        uint256 successRate = (rep.projectsCompleted * 100) / rep.projectsTotal;
        
        if (successRate >= 90) return consistencyBonus; // 20% bônus
        if (successRate >= 80) return consistencyBonus * 75 / 100; // 15% bônus
        if (successRate >= 70) return consistencyBonus * 50 / 100; // 10% bônus
        
        return 0;
    }
    
    function verifyArtist(address _artist) external onlyOwner {
        require(artistExists[_artist], "Artista nao existe");
        
        artistReputation[_artist].isVerified = true;
        emit ArtistVerified(_artist, msg.sender);
        
        // Recalcular score com bônus de verificação
        _updateReputationScore(_artist);
    }
    
    function canAutoApprove(address _artist) external view returns (bool) {
        if (!artistExists[_artist]) return false;
        return artistReputation[_artist].score >= minimumApprovalScore;
    }
    
    // Getters
    function getReputationData(address _artist) 
        external 
        view 
        returns (ReputationData memory) 
    {
        return artistReputation[_artist];
    }
    
    function getDeliveryHistory(address _artist) 
        external 
        view 
        returns (DeliveryRecord[] memory) 
    {
        return deliveryHistory[_artist];
    }
    
    function getSocialMetrics(address _artist) 
        external 
        view 
        returns (SocialMetrics memory) 
    {
        return socialMetrics[_artist];
    }
    
    // Funções administrativas
    function addSocialOracle(address _oracle) external onlyOwner {
        socialOracles[_oracle] = true;
    }
    
    function removeSocialOracle(address _oracle) external onlyOwner {
        socialOracles[_oracle] = false;
    }
    
    function setWeights(
        uint256 _delivery,
        uint256 _quality,
        uint256 _payment,
        uint256 _engagement,
        uint256 _transparency
    ) external onlyOwner {
        require(
            _delivery + _quality + _payment + _engagement + _transparency == 10000,
            "Pesos devem somar 100%"
        );
        
        deliveryWeight = _delivery;
        qualityWeight = _quality;
        paymentWeight = _payment;
        engagementWeight = _engagement;
        transparencyWeight = _transparency;
    }
    
    function setMinimumApprovalScore(uint256 _newScore) external onlyOwner {
        require(_newScore <= 1000, "Score maximo 1000");
        minimumApprovalScore = _newScore;
    }
}