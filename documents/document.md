# <img src="../assets/logo.png" width="20%"> <img src="../assets/qitech-logo.png" width="50%"> 

Plataforma Peer-to-Peer descentralizada que permita a artistas periféricos captar microcrédito para lançamento de álbuns, videoclipes e turnês.

## Estrutura Web3 e Contratos Inteligentes

<div align="center">
    <sub>Figura 1 - Fluxo lógico dos Smart Contracts</sub> <br>
    <img src= "../assets/smart_contracts_logic.png" width="80%">
</div>

### `ContractRegistry`:

Contrato inteligente responsável por registrar, aprovar e gerenciar projetos na plataforma. Ele define regras de criação, aprovação, captação e acompanhamento de status, além de emitir eventos que notificam as ações principais. Seguindo o fluxo:

1. Criação do projeto: novo registro `Pending`
2. Aprovação do projeto: status `Approved`
3. Captação de recursos: status `Funding` / `Funded` 
4. Execução e repagamento: status `Active` / `Completed`
5. Encerramento ou cancelamento: status `Cancelled`

**Estruturas de dados**: 

<div align="center">
<sub>Enum ProjectStatus</sub>

| Nome        | Descrição                                             |
| ----------- | ----------------------------------------------------- |
| `PENDING`   | Projeto criado, aguardando aprovação do administrador |
| `APPROVED`  | Projeto aprovado para iniciar captação                |
| `FUNDING`   | Projeto em fase de captação de recursos               |
| `FUNDED`    | Meta de captação atingida                             |
| `ACTIVE`    | Projeto em execução                                   |
| `COMPLETED` | Projeto concluído                                     |
| `CANCELLED` | Projeto cancelado manualmente ou por emergência       |

</div>

<div align="center">
<sub>Projects</sub>

| Campo                    | Tipo            | Descrição                                     |
| ------------------------ | --------------- | --------------------------------------------- |
| `id`                     | `uint256`       | Identificador único do projeto                |
| `artist`                 | `address`       | Endereço do criador/artista                   |
| `title`                  | `string`        | Título do projeto                             |
| `description`            | `string`        | Descrição do projeto                          |
| `demoUri`                | `string`        | Hash/IPFS com material demonstrativo          |
| `fundingGoal`            | `uint256`       | Meta de captação em wei                       |
| `fundingDeadline`        | `uint256`       | Prazo máximo para captação                    |
| `repaymentDeadline`      | `uint256`       | Prazo para repagamento dos investidores       |
| `interestRate`           | `uint256`       | Taxa de juros (base 10.000 — ex: 5000 = 50%)  |
| `status`                 | `ProjectStatus` | Estado atual do projeto                       |
| `allowsRoyaltyRepayment` | `bool`          | Se o repagamento pode ser feito via royalties |
| `createdAt`              | `uint256`       | Timestamp de criação                          |
| `approvedAt`             | `uint256`       | Timestamp de aprovação                        |

</div>

**Métodos**: <br>
* `createProject()` - Registro de novo projeto.
* `updateProjectStatus()` - Atualização do status.
* `getProjectDetails()` - Consulta de dados.
* `setFundingGoal()` - Definir meta de captação.
    
### `LoanEscrow`

* `depositFunds()` - Receber investimentos.
* `releaseFunds()` - Liberação quando meta atingida.
* `refundInvestors()` - Reembolso em caso de falha.
* `partialRelease()` - Liberação em etapas.

**Eventos:** `FundsDeposited`, `FundsReleased`, `RefundInitiated`

### `RepaymentManager`

* `scheduleRepayment()` - Agendar pagamentos
* `processRoyaltyPayment()` - Processar royalties
* `distributePayments()` - Distribuir pro rata
* `calculateInterest()` - Calcular juros

**Eventos:**: `RepaymentScheduled`, `RoyaltyPaymentReceived`, `PaymentDistributed`

### Contrato `ReputationManager`

O ReputationManager é um contrato inteligente que calcula, atualiza e armazena o score de reputação de artistas com base em:

1. Entregas de projetos (`DeliveryRecord`);
2. Qualidade e pontualidade das entregas;
3. Histórico de pagamentos (`RepaymentManager`);
4. Métricas sociais (via oráculos);
5. Transparência e verificações;
6. Consistência de performance ao longo do tempo.

**Métodos**: <br>
- `updateReputation()` - Atualizar score.
- `recordDelivery()` - Registrar entregas.
- `calculateScore()` - Calcular pontuação.
- `verifyCredentials()` - Verificar credenciais.

**Estruturas de dados**: 

<div align="center">
<sub>ReputationData</sub>

| Campo               | Tipo    | Descrição                                 |
| ------------------- | ------- | ----------------------------------------- |
| `score`             | uint256 | Score de reputação (0–1000)               |
| `projectsCompleted` | uint256 | Quantidade de projetos finalizados        |
| `projectsTotal`     | uint256 | Total de projetos iniciados               |
| `onTimePayments`    | uint256 | Pagamentos realizados no prazo            |
| `latePayments`      | uint256 | Pagamentos atrasados                      |
| `totalRaised`       | uint256 | Total de capital captado                  |
| `lastUpdated`       | uint256 | Data da última atualização                |
| `isVerified`        | bool    | Se foi verificado manualmente pela equipe |

</div>

<div align="center">
<sub>DeliveryRecord</sub>

| Campo              | Tipo    | Descrição                                        |
| ------------------ | ------- | ------------------------------------------------ |
| `projectId`        | uint256 | ID do projeto entregue                           |
| `deliverableType`  | string  | Tipo de entrega (“demo”, “álbum”, “vídeo”, etc.) |
| `ipfsHash`         | string  | Hash IPFS da entrega                             |
| `timestamp`        | uint256 | Data da entrega                                  |
| `isOnTime`         | bool    | Indica se foi entregue no prazo                  |
| `qualityScore`     | uint256 | Nota de qualidade (1–100)                        |
| `offChainDataHash` | bytes32 | Hash de dados off-chain (prova de integridade)   |

</div>

<div align="center">
<sub>SocialMetrics</sub>

| Campo               | Tipo     | Descrição                                          |
| ------------------- | -------- | -------------------------------------------------- |
| `followersCount`    | uint256  | Número de seguidores                               |
| `engagementRate`    | uint256  | Taxa de engajamento (0–10000 = 0–100%)             |
| `streamingPlays`    | uint256  | Número de reproduções                              |
| `verifiedPlatforms` | string[] | Plataformas verificadas (Spotify, Instagram, etc.) |
| `lastSocialUpdate`  | uint256  | Última atualização feita por um oráculo            |

</div>



