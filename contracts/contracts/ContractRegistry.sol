// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProjectRegistry is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _projectIds;
    
    enum ProjectStatus { 
        PENDING,      // Aguardando aprovação
        APPROVED,     // Aprovado para captação
        FUNDING,      // Em captação
        FUNDED,       // Meta atingida
        ACTIVE,       // Projeto em execução
        COMPLETED,    // Projeto finalizado
        CANCELLED     // Projeto cancelado
    }
    
    struct Project {
        uint256 id;
        address artist;
        string title;
        string description;
        string demoUri;           // IPFS hash do material demo
        uint256 fundingGoal;      // Meta de captação em wei
        uint256 fundingDeadline;  // Prazo para captação
        uint256 repaymentDeadline; // Prazo para repagamento
        uint256 interestRate;     // Taxa de juros (base 10000)
        ProjectStatus status;
        bool allowsRoyaltyRepayment; // Permite repagamento com royalties
        uint256 createdAt;
        uint256 approvedAt;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(address => uint256[]) public artistProjects;
    mapping(uint256 => bool) public projectExists;
    
    // Taxa para criação de projeto (em wei)
    uint256 public projectCreationFee = 0.001 ether;
    
    // Wallet para receber taxas
    address public feeRecipient;
    
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed artist,
        string title,
        uint256 fundingGoal,
        uint256 deadline
    );
    
    event ProjectStatusUpdated(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );
    
    event ProjectApproved(
        uint256 indexed projectId,
        address indexed approvedBy
    );
    
    event FundingGoalReached(
        uint256 indexed projectId,
        uint256 totalRaised
    );
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    modifier projectExistsModifier(uint256 _projectId) {
        require(projectExists[_projectId], "Projeto nao existe");
        _;
    }
    
    modifier onlyArtist(uint256 _projectId) {
        require(projects[_projectId].artist == msg.sender, "Apenas o artista pode executar");
        _;
    }
    
    function createProject(
        string memory _title,
        string memory _description,
        string memory _demoUri,
        uint256 _fundingGoal,
        uint256 _fundingDeadline,
        uint256 _repaymentDeadline,
        uint256 _interestRate,
        bool _allowsRoyaltyRepayment
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= projectCreationFee, "Taxa de criacao insuficiente");
        require(_fundingGoal > 0, "Meta deve ser maior que zero");
        require(_fundingDeadline > block.timestamp, "Prazo deve ser futuro");
        require(_repaymentDeadline > _fundingDeadline, "Prazo repagamento deve ser apos captacao");
        require(_interestRate <= 5000, "Taxa juros maxima 50%"); // 5000/10000 = 50%
        
        _projectIds.increment();
        uint256 projectId = _projectIds.current();
        
        projects[projectId] = Project({
            id: projectId,
            artist: msg.sender,
            title: _title,
            description: _description,
            demoUri: _demoUri,
            fundingGoal: _fundingGoal,
            fundingDeadline: _fundingDeadline,
            repaymentDeadline: _repaymentDeadline,
            interestRate: _interestRate,
            status: ProjectStatus.PENDING,
            allowsRoyaltyRepayment: _allowsRoyaltyRepayment,
            createdAt: block.timestamp,
            approvedAt: 0
        });
        
        projectExists[projectId] = true;
        artistProjects[msg.sender].push(projectId);
        
        // Transferir taxa para wallet de taxas
        payable(feeRecipient).transfer(msg.value);
        
        emit ProjectCreated(
            projectId,
            msg.sender,
            _title,
            _fundingGoal,
            _fundingDeadline
        );
        
        return projectId;
    }
    
    function approveProject(uint256 _projectId) 
        external 
        onlyOwner 
        projectExistsModifier(_projectId) 
    {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.PENDING, "Apenas projetos pendentes podem ser aprovados");
        require(block.timestamp < project.fundingDeadline, "Prazo de captacao expirado");
        
        ProjectStatus oldStatus = project.status;
        project.status = ProjectStatus.APPROVED;
        project.approvedAt = block.timestamp;
        
        emit ProjectStatusUpdated(_projectId, oldStatus, ProjectStatus.APPROVED);
        emit ProjectApproved(_projectId, msg.sender);
    }
    
    function updateProjectStatus(uint256 _projectId, ProjectStatus _newStatus) 
        external 
        onlyOwner 
        projectExistsModifier(_projectId) 
    {
        ProjectStatus oldStatus = projects[_projectId].status;
        projects[_projectId].status = _newStatus;
        
        emit ProjectStatusUpdated(_projectId, oldStatus, _newStatus);
        
        // Se meta foi atingida, emitir evento especial
        if (_newStatus == ProjectStatus.FUNDED) {
            emit FundingGoalReached(_projectId, projects[_projectId].fundingGoal);
        }
    }
    
    function getProject(uint256 _projectId) 
        external 
        view 
        projectExistsModifier(_projectId) 
        returns (Project memory) 
    {
        return projects[_projectId];
    }
    
    function getArtistProjects(address _artist) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return artistProjects[_artist];
    }
    
    function getTotalProjects() external view returns (uint256) {
        return _projectIds.current();
    }
    
    // Funções administrativas
    function setProjectCreationFee(uint256 _newFee) external onlyOwner {
        projectCreationFee = _newFee;
    }
    
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Endereco invalido");
        feeRecipient = _newRecipient;
    }
    
    // Função para emergências
    function emergencyPause(uint256 _projectId) 
        external 
        onlyOwner 
        projectExistsModifier(_projectId) 
    {
        projects[_projectId].status = ProjectStatus.CANCELLED;
        emit ProjectStatusUpdated(_projectId, projects[_projectId].status, ProjectStatus.CANCELLED);
    }

}