// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BeatCred {
    enum ProjectStatus { Draft, Open, Funded, Repaying, Closed }

    struct Project {
        uint256 id;
        address artist;
        string title;
        uint256 targetAmount;
        uint256 collectedAmount;
        uint8 royaltyPercentage; // 0-100
        ProjectStatus status;
    }

    struct Investment {
        uint256 projectId;
        address investor;
        uint256 amount;
        uint256 share; // em basis points (10000 = 100%)
    }

    uint256 public nextProjectId;
    uint256 public nextInvestmentId;

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Investment) public investments;
    mapping(uint256 => uint256[]) public projectInvestments;

    event ProjectCreated(uint256 projectId, address artist, string title, uint256 targetAmount);
    event Invested(uint256 projectId, uint256 investmentId, address investor, uint256 amount);
    event RoyaltiesDistributed(uint256 projectId, uint256 total);

    function createProject(string memory _title, uint256 _targetAmount, uint8 _royaltyPercentage) public {
        require(_royaltyPercentage <= 100, "Royalties invalidos");

        projects[nextProjectId] = Project({
            id: nextProjectId,
            artist: msg.sender,
            title: _title,
            targetAmount: _targetAmount,
            collectedAmount: 0,
            royaltyPercentage: _royaltyPercentage,
            status: ProjectStatus.Open
        });

        emit ProjectCreated(nextProjectId, msg.sender, _title, _targetAmount);
        nextProjectId++;
    }

    function invest(uint256 _projectId) public payable {
        Project storage p = projects[_projectId];
        require(p.status == ProjectStatus.Open, "Projeto nao esta aberto");
        require(msg.value > 0, "Valor invalido");

        investments[nextInvestmentId] = Investment({
            projectId: _projectId,
            investor: msg.sender,
            amount: msg.value,
            share: (msg.value * 10000) / p.targetAmount
        });

        projectInvestments[_projectId].push(nextInvestmentId);
        p.collectedAmount += msg.value;

        if (p.collectedAmount >= p.targetAmount) {
            p.status = ProjectStatus.Funded;
        }

        emit Invested(_projectId, nextInvestmentId, msg.sender, msg.value);
        nextInvestmentId++;
    }

    function distributeRoyalties(uint256 _projectId) public payable {
        Project storage p = projects[_projectId];
        require(p.status == ProjectStatus.Funded || p.status == ProjectStatus.Repaying, "Nao pode distribuir");

        uint256 royaltyPool = msg.value;
        uint256[] storage invIds = projectInvestments[_projectId];

        for (uint i = 0; i < invIds.length; i++) {
            Investment storage inv = investments[invIds[i]];
            uint256 payout = (royaltyPool * inv.share) / 10000;
            payable(inv.investor).transfer(payout);
        }

        p.status = ProjectStatus.Repaying;
        emit RoyaltiesDistributed(_projectId, royaltyPool);
    }
}