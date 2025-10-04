// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

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

interface ILoanEscrow {
    struct Investment {
        address investor;
        uint256 amount;
        uint256 timestamp;
    }
    
    function getEscrowData(uint256 _projectId) 
        external 
        view 
        returns (
            uint256 totalRaised,
            uint256 goalAmount,
            bool fundsReleased,
            bool fundsRefunded,
            uint256 investorCount
        );
    
    function getInvestorData(uint256 _projectId, address _investor) 
        external 
        view 
        returns (uint256);
}

contract RepaymentManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IProjectRegistry public projectRegistry;
    ILoanEscrow public loanEscrow;
    
    // Chainlink price feed para conversões
    AggregatorV3Interface public priceFeed;
    
    struct RepaymentSchedule {
        uint256 projectId;
        uint256 totalOwed;          // Total devido (principal + juros)
        uint256 totalPaid;          // Total já pago
        uint256 nextPaymentDue;     // Data do próximo pagamento
        uint256 monthlyPayment;     // Pagamento mensal (se aplicável)
        bool isRoyaltyBased;        // Se usa repagamento por royalties
        bool isCompleted;           // Se foi totalmente pago
        uint256 createdAt;
    }
    
    struct RoyaltyPayment {
        uint256 projectId;
        uint256 amount;
        string source;              // "spotify", "show", "merch", etc.
        uint256 timestamp;
        bytes32 oracleHash;         // Hash da verificação do oráculo
    }
    
    mapping(uint256 => RepaymentSchedule) public repaymentSchedules;
    mapping(uint256 => RoyaltyPayment[]) public royaltyPayments;
    mapping(uint256 => mapping(address => uint256)) public investorPayments; // Quanto cada investidor já recebeu
    mapping(uint256 => bool) public scheduleExists;
    
    // Pool de royalties por projeto
    mapping(uint256 => uint256) public royaltyPool;
    
    // Token para receber pagamentos (USDC/USDT)
    IERC20 public paymentToken;
    
    // Endereços autorizados para reportar royalties (oráculos)
    mapping(address => bool) public authorizedOracles;
    
    // Taxa de conversão royalty -> repagamento (base 10000)
    uint256 public royaltyConversionRate = 8000; // 80% das royalties vão para repagamento
    
    event RepaymentScheduleCreated(
        uint256 indexed projectId,
        uint256 totalOwed,
        bool isRoyaltyBased
    );
    
    event TraditionalPaymentMade(
        uint256 indexed projectId,
        address indexed payer,
        uint256 amount
    );
    
    event RoyaltyPaymentReceived(
        uint256 indexed projectId,
        uint256 amount,
        string source,
        address indexed oracle
    );
    
    event PaymentDistributed(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount
    );
    
    event RepaymentCompleted(
        uint256 indexed projectId,
        uint256 totalPaid
    );
    
    constructor(
        address _projectRegistry,
        address _loanEscrow,
        address _paymentToken,
        address _priceFeed
    ) {
        projectRegistry = IProjectRegistry(_projectRegistry);
        loanEscrow = ILoanEscrow(_loanEscrow);
        paymentToken = IERC20(_paymentToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
    
    modifier onlyArtist(uint256 _projectId) {
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(project.artist == msg.sender, "Apenas o artista pode executar");
        _;
    }
    
    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Oraculo nao autorizado");
        _;
    }
    
    function scheduleRepayment(uint256 _projectId) external nonReentrant {
        require(!scheduleExists[_projectId], "Cronograma ja existe");
        
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        require(project.status == IProjectRegistry.ProjectStatus.ACTIVE, "Projeto deve estar ativo");
        
        (uint256 totalRaised, , bool fundsReleased, ,) = loanEscrow.getEscrowData(_projectId);
        require(fundsReleased, "Fundos devem ter sido liberados");
        
        // Calcular total devido (principal + juros)
        uint256 interest = (totalRaised * project.interestRate) / 10000;
        uint256 totalOwed = totalRaised + interest;
        
        RepaymentSchedule storage schedule = repaymentSchedules[_projectId];
        schedule.projectId = _projectId;
        schedule.totalOwed = totalOwed;
        schedule.totalPaid = 0;
        schedule.nextPaymentDue = block.timestamp + 30 days; // Primeiro pagamento em 30 dias
        schedule.isRoyaltyBased = project.allowsRoyaltyRepayment;
        schedule.isCompleted = false;
        schedule.createdAt = block.timestamp;
        
        if (!project.allowsRoyaltyRepayment) {
            // Repagamento tradicional em 12 parcelas
            schedule.monthlyPayment = totalOwed / 12;
        }
        
        scheduleExists[_projectId] = true;
        
        emit RepaymentScheduleCreated(_projectId, totalOwed, project.allowsRoyaltyRepayment);
    }
    
    function makeTraditionalPayment(uint256 _projectId, uint256 _amount) 
        external 
        nonReentrant 
        onlyArtist(_projectId)
    {
        RepaymentSchedule storage schedule = repaymentSchedules[_projectId];
        require(scheduleExists[_projectId], "Cronograma nao existe");
        require(!schedule.isCompleted, "Repagamento ja completado");
        require(_amount > 0, "Valor deve ser maior que zero");
        
        uint256 remainingDebt = schedule.totalOwed - schedule.totalPaid;
        uint256 paymentAmount = _amount > remainingDebt ? remainingDebt : _amount;
        
        // Transferir tokens do artista para o contrato
        paymentToken.safeTransferFrom(msg.sender, address(this), paymentAmount);
        
        schedule.totalPaid += paymentAmount;
        
        if (schedule.totalPaid >= schedule.totalOwed) {
            schedule.isCompleted = true;
            projectRegistry.updateProjectStatus(_projectId, IProjectRegistry.ProjectStatus.COMPLETED);
            emit RepaymentCompleted(_projectId, schedule.totalPaid);
        } else {
            // Atualizar próxima data de pagamento
            schedule.nextPaymentDue = block.timestamp + 30 days;
        }
        
        // Distribuir pagamento aos investidores
        _distributePayment(_projectId, paymentAmount);
        
        emit TraditionalPaymentMade(_projectId, msg.sender, paymentAmount);
    }
    
    function processRoyaltyPayment(
        uint256 _projectId,
        uint256 _amount,
        string memory _source,
        bytes32 _oracleHash
    ) external onlyAuthorizedOracle nonReentrant {
        require(scheduleExists[_projectId], "Cronograma nao existe");
        
        RepaymentSchedule storage schedule = repaymentSchedules[_projectId];
        require(!schedule.isCompleted, "Repagamento ja completado");
        require(schedule.isRoyaltyBased, "Projeto nao aceita repagamento por royalties");
        
        // Adicionar à lista de royalties recebidos
        royaltyPayments[_projectId].push(RoyaltyPayment({
            projectId: _projectId,
            amount: _amount,
            source: _source,
            timestamp: block.timestamp,
            oracleHash: _oracleHash
        }));
        
        // Calcular quanto vai para repagamento (80% por padrão)
        uint256 repaymentAmount = (_amount * royaltyConversionRate) / 10000;
        uint256 remainingDebt = schedule.totalOwed - schedule.totalPaid;
        
        if (repaymentAmount > remainingDebt) {
            repaymentAmount = remainingDebt;
        }
        
        schedule.totalPaid += repaymentAmount;
        royaltyPool[_projectId] += repaymentAmount;
        
        if (schedule.totalPaid >= schedule.totalOwed) {
            schedule.isCompleted = true;
            projectRegistry.updateProjectStatus(_projectId, IProjectRegistry.ProjectStatus.COMPLETED);
            emit RepaymentCompleted(_projectId, schedule.totalPaid);
        }
        
        // Distribuir pagamento aos investidores
        _distributePayment(_projectId, repaymentAmount);
        
        emit RoyaltyPaymentReceived(_projectId, _amount, _source, msg.sender);
    }
    
    function _distributePayment(uint256 _projectId, uint256 /* _totalAmount */) internal view {
        // obter totalRaised para calcular participações; se for zero, nada a distribuir
        (uint256 totalRaised, , , ,) = loanEscrow.getEscrowData(_projectId);
        if (totalRaised == 0) {
            return;
        }
        
        // Obter lista de investidores - precisaríamos implementar uma função no LoanEscrow para isso
        // Por simplicidade, vou assumir que temos essa informação
        
        // Esta função deveria iterar pelos investidores e distribuir proporcionalmente
        // Para o exemplo, vou mostrar a lógica conceitual
        /*
        for cada investidor {
            uint256 investorShare = (investimento * _totalAmount) / totalRaised;
            paymentToken.safeTransfer(investor, investorShare);
            investorPayments[_projectId][investor] += investorShare;
            emit PaymentDistributed(_projectId, investor, investorShare);
        }
        */
    }
    
    function calculateInterest(uint256 _projectId) external view returns (uint256) {
        IProjectRegistry.Project memory project = projectRegistry.getProject(_projectId);
        (uint256 totalRaised, , , ,) = loanEscrow.getEscrowData(_projectId);
        
        return (totalRaised * project.interestRate) / 10000;
    }
    
    function getRepaymentStatus(uint256 _projectId) 
        external 
        view 
        returns (
            uint256 totalOwed,
            uint256 totalPaid,
            uint256 remainingDebt,
            bool isCompleted,
            uint256 nextPaymentDue
        ) 
    {
        RepaymentSchedule memory schedule = repaymentSchedules[_projectId];
        return (
            schedule.totalOwed,
            schedule.totalPaid,
            schedule.totalOwed - schedule.totalPaid,
            schedule.isCompleted,
            schedule.nextPaymentDue
        );
    }
    
    function getRoyaltyPayments(uint256 _projectId) 
        external 
        view 
        returns (RoyaltyPayment[] memory) 
    {
        return royaltyPayments[_projectId];
    }
    
    function getInvestorPayments(uint256 _projectId, address _investor) 
        external 
        view 
        returns (uint256) 
    {
        return investorPayments[_projectId][_investor];
    }
    
    // Funções administrativas
    function addAuthorizedOracle(address _oracle) external onlyOwner {
        authorizedOracles[_oracle] = true;
    }
    
    function removeAuthorizedOracle(address _oracle) external onlyOwner {
        authorizedOracles[_oracle] = false;
    }
    
    function setRoyaltyConversionRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 10000, "Taxa maxima 100%");
        royaltyConversionRate = _newRate;
    }
    
    function setPaymentToken(address _newToken) external onlyOwner {
        paymentToken = IERC20(_newToken);
    }
    
    // Função de emergência para pausar repagamentos
    function emergencyPauseRepayment(uint256 _projectId) external onlyOwner {
        repaymentSchedules[_projectId].isCompleted = true;
    }
}