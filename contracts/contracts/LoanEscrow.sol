// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IProjectRegistry {
    enum ProjectStatus { 
        PENDING, APPROVED, FUNDING, FUNDED, ACTIVE, COMPLETED, CANCELLED 
    }
    
    struct Project {
        uint256 id;
        address artist;
        string title;
        string description;
        string demoUri;
        uint256 fundingGoal;
        uint256 fundingDeadline;
        uint256 repaymentDeadline;
        uint256 interestRate;
        ProjectStatus status;
        bool allowsRoyaltyRepayment;
        uint256 createdAt;
        uint256 approvedAt;
    }
    
    function getProject(uint256 _projectId) external view returns (Project memory);
    function updateProjectStatus(uint256 _projectId, ProjectStatus _newStatus) external;
}

contract LoanEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IProjectRegistry public projectRegistry;
    
    struct Investment {
        address investor;
        uint256 amount;
        uint256 timestamp;
    }
    
    struct EscrowData {
        uint256 projectId;
        uint256 totalRaised;
        uint256 goalAmount;
        bool fundsReleased;
        bool fundsRefunded;
        uint256 createdAt;
        mapping(address => uint256) investments;
        Investment[] investmentList;
    }
    
    mapping(uint256 => EscrowData) public escrows;
    mapping(uint256 => bool) public escrowExists;
    
    // Taxa da plataforma (base 10000 = 100%)
    uint256 public platformFee = 250; // 2.5%
    address public feeRecipient;
    
    // Token aceito para investimento (USDC/USDT ou address(0) para ETH)
    IERC20 public acceptedToken;
    
    event EscrowCreated(
        uint256 indexed projectId,
        uint256 goalAmount,
        address indexed artist
    );
    
    event FundsDeposited(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount,
        uint256 totalRaised
    );
    
    event FundsReleased(
        uint256 indexed projectId,
        address indexed artist,
        uint256 amount,
        uint256 platformFeeAmount
    );
    
    event FundsRefunded(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount
    );
    
    event GoalReached(
        uint256 indexed projectId,
        uint256 totalRaised
    );
    
    constructor(
        address _projectRegistry,
        address _feeRecipient,
        address _acceptedToken
    ) {
        projectRegistry = IProjectRegistry(_projectRegistry);
        feeRecipient = _feeRecipient;
        acceptedToken = IERC20(_acceptedToken); // address(0) para ETH
    }
    
    modifier escrowExistsModifier(uint256 _projectId) {
        require(escrowExists[_projectId], "Escrow nao existe");
        _;
    }
    
    modifier onlyArtist(uint256 _projectId) {
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(project.artist == msg.sender, "Apenas o artista pode executar");
        _;
    }
    
    function createEscrow(uint256 _projectId) external nonReentrant {
        require(!escrowExists[_projectId], "Escrow ja existe");
        
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(project.status == IProjectRegistry.ProjectStatus.APPROVED, "Projeto deve estar aprovado");
        require(block.timestamp < project.fundingDeadline, "Prazo de captacao expirado");
        
        EscrowData storage escrow = escrows[_projectId];
        escrow.projectId = _projectId;
        escrow.totalRaised = 0;
        escrow.goalAmount = project.fundingGoal;
        escrow.fundsReleased = false;
        escrow.fundsRefunded = false;
        escrow.createdAt = block.timestamp;
        
        escrowExists[_projectId] = true;
        
        // Atualizar status do projeto para FUNDING
        projectRegistry.updateProjectStatus(_projectId, IProjectRegistry.ProjectStatus.FUNDING);
        
        emit EscrowCreated(_projectId, project.fundingGoal, project.artist);
    }
    
    function depositFunds(uint256 _projectId, uint256 _amount) 
        external 
        payable 
        nonReentrant 
        escrowExistsModifier(_projectId) 
    {
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(project.status == IProjectRegistry.ProjectStatus.FUNDING, "Projeto deve estar em captacao");
        require(block.timestamp < project.fundingDeadline, "Prazo de captacao expirado");
        
        EscrowData storage escrow = escrows[_projectId];
        require(!escrow.fundsReleased && !escrow.fundsRefunded, "Escrow ja foi finalizado");
        
        uint256 depositAmount;
        
        if (address(acceptedToken) == address(0)) {
            // Aceitar ETH
            depositAmount = msg.value;
            require(depositAmount > 0, "Valor deve ser maior que zero");
        } else {
            // Aceitar ERC20 token
            depositAmount = _amount;
            require(depositAmount > 0, "Valor deve ser maior que zero");
            acceptedToken.safeTransferFrom(msg.sender, address(this), depositAmount);
        }
        
        escrow.investments[msg.sender] += depositAmount;
        escrow.totalRaised += depositAmount;
        
        escrow.investmentList.push(Investment({
            investor: msg.sender,
            amount: depositAmount,
            timestamp: block.timestamp
        }));
        
        emit FundsDeposited(_projectId, msg.sender, depositAmount, escrow.totalRaised);
        
        // Verificar se meta foi atingida
        if (escrow.totalRaised >= escrow.goalAmount) {
            projectRegistry.updateProjectStatus(_projectId, IProjectRegistry.ProjectStatus.FUNDED);
            emit GoalReached(_projectId, escrow.totalRaised);
        }
    }
    
    function releaseFunds(uint256 _projectId) 
        external 
        nonReentrant 
        escrowExistsModifier(_projectId)
        onlyArtist(_projectId)
    {
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(project.status == IProjectRegistry.ProjectStatus.FUNDED, "Meta deve ter sido atingida");
        
        EscrowData storage escrow = escrows[_projectId];
        require(!escrow.fundsReleased && !escrow.fundsRefunded, "Fundos ja foram liberados ou reembolsados");
        
        escrow.fundsReleased = true;
        
        uint256 totalAmount = escrow.totalRaised;
        uint256 feeAmount = (totalAmount * platformFee) / 10000;
        uint256 artistAmount = totalAmount - feeAmount;
        
        // Transferir taxa para plataforma
        if (address(acceptedToken) == address(0)) {
            payable(feeRecipient).transfer(feeAmount);
            payable(project.artist).transfer(artistAmount);
        } else {
            acceptedToken.safeTransfer(feeRecipient, feeAmount);
            acceptedToken.safeTransfer(project.artist, artistAmount);
        }
        
        // Atualizar status do projeto
        projectRegistry.updateProjectStatus(_projectId, IProjectRegistry.ProjectStatus.ACTIVE);
        
        emit FundsReleased(_projectId, project.artist, artistAmount, feeAmount);
    }
    
    function refundInvestors(uint256 _projectId) 
        external 
        nonReentrant 
        escrowExistsModifier(_projectId) 
    {
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(
            block.timestamp > project.fundingDeadline || 
            project.status == IProjectRegistry.ProjectStatus.CANCELLED,
            "Prazo nao expirado ou projeto nao cancelado"
        );
        require(project.status != IProjectRegistry.ProjectStatus.FUNDED, "Meta foi atingida");
        
        EscrowData storage escrow = escrows[_projectId];
        require(!escrow.fundsReleased && !escrow.fundsRefunded, "Escrow ja foi finalizado");
        
        escrow.fundsRefunded = true;
        
        // Reembolsar todos os investidores
        for (uint256 i = 0; i < escrow.investmentList.length; i++) {
            Investment memory investment = escrow.investmentList[i];
            if (investment.amount > 0) {
                if (address(acceptedToken) == address(0)) {
                    payable(investment.investor).transfer(investment.amount);
                } else {
                    acceptedToken.safeTransfer(investment.investor, investment.amount);
                }
                
                emit FundsRefunded(_projectId, investment.investor, investment.amount);
            }
        }
        
        // Atualizar status do projeto
        projectRegistry.updateProjectStatus(_projectId, IProjectRegistry.ProjectStatus.CANCELLED);
    }
    
    function partialRelease(uint256 _projectId, uint256 _percentage) 
        external 
        nonReentrant 
        escrowExistsModifier(_projectId)
        onlyArtist(_projectId)
    {
        require(_percentage > 0 && _percentage <= 10000, "Porcentagem invalida"); // max 100%
        
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(project.status == IProjectRegistry.ProjectStatus.ACTIVE, "Projeto deve estar ativo");
        
        EscrowData storage escrow = escrows[_projectId];
        require(escrow.fundsReleased, "Fundos principais devem ter sido liberados");
        
        uint256 releaseAmount = (escrow.totalRaised * _percentage) / 10000;
        uint256 availableBalance;
        
        if (address(acceptedToken) == address(0)) {
            availableBalance = address(this).balance;
            require(availableBalance >= releaseAmount, "Saldo insuficiente");
            payable(project.artist).transfer(releaseAmount);
        } else {
            availableBalance = acceptedToken.balanceOf(address(this));
            require(availableBalance >= releaseAmount, "Saldo insuficiente");
            acceptedToken.safeTransfer(project.artist, releaseAmount);
        }
        
        emit FundsReleased(_projectId, project.artist, releaseAmount, 0);
    }
    
    // Getters
    function getEscrowData(uint256 _projectId) 
        external 
        view 
        escrowExistsModifier(_projectId)
        returns (
            uint256 totalRaised,
            uint256 goalAmount,
            bool fundsReleased,
            bool fundsRefunded,
            uint256 investorCount
        ) 
    {
        EscrowData storage escrow = escrows[_projectId];
        return (
            escrow.totalRaised,
            escrow.goalAmount,
            escrow.fundsReleased,
            escrow.fundsRefunded,
            escrow.investmentList.length
        );
    }
    
    function getInvestorData(uint256 _projectId, address _investor) 
        external 
        view 
        escrowExistsModifier(_projectId)
        returns (uint256) 
    {
        return escrows[_projectId].investments[_investor];
    }
    
    // Funções administrativas
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Taxa maxima 10%"); // 1000/10000 = 10%
        platformFee = _newFee;
    }
    
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Endereco invalido");
        feeRecipient = _newRecipient;
    }
    
    // Função de emergência
    function emergencyWithdraw(uint256 _projectId) external onlyOwner {
        EscrowData storage escrow = escrows[_projectId];
        if (address(acceptedToken) == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            acceptedToken.safeTransfer(owner(), acceptedToken.balanceOf(address(this)));
        }
    }
}