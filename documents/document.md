# <img src="../assets/logo.png" width="20%"> <img src="../assets/qitech-logo.png" width="50%"> 

Plataforma Peer-to-Peer descentralizada que permita a artistas periféricos captar microcrédito para lançamento de álbuns, videoclipes e turnês.

## Estrutura Web3 e Contratos Inteligentes

<div align="center">
    <sub>Figura 1 - Fluxo lógico dos Smart Contracts</sub> <br>
    <img src= "../assets/smart_contracts_logic.png" width="80%">
</div>

### Contrato `ContractRegistry`

&emsp;Contrato inteligente responsável por registrar, aprovar e gerenciar projetos na plataforma. Ele define regras de criação, aprovação, captação e acompanhamento de status, além de emitir eventos que notificam as ações principais. Seguindo o fluxo:

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
    
### Contrato `LoanEscrow`

&emsp;O contrato LoanEscrow atua como um cofre inteligente (escrow) que gerencia a captação, custódia e liberação de recursos financeiros destinados aos projetos artísticos registrados no contrato ProjectRegistry. Ele funciona como intermediário entre investidores e artistas, garantindo que os fundos sejam movimentados apenas sob condições pré-estabelecidas — protegendo ambas as partes com segurança e automação on-chain.

**Estruturas de dados**:

<div align="center">
<sub>Investment</sub>

| Campo       | Tipo      | Descrição                         |
| ----------- | --------- | --------------------------------- |
| `investor`  | `address` | Endereço do investidor            |
| `amount`    | `uint256` | Valor investido (em token ou ETH) |
| `timestamp` | `uint256` | Data e hora do investimento       |

</div>

<div align="center">
<sub>EscrowData</sub>

| Campo            | Tipo                          | Descrição                                             |
| ---------------- | ----------------------------- | ----------------------------------------------------- |
| `projectId`      | `uint256`                     | ID do projeto no registro principal                   |
| `totalRaised`    | `uint256`                     | Total arrecadado até o momento                        |
| `goalAmount`     | `uint256`                     | Meta de captação do projeto                           |
| `fundsReleased`  | `bool`                        | Indica se os fundos já foram liberados ao artista     |
| `fundsRefunded`  | `bool`                        | Indica se os fundos foram devolvidos aos investidores |
| `createdAt`      | `uint256`                     | Timestamp de criação do escrow                        |
| `investments`    | `mapping(address => uint256)` | Valor investido por endereço                          |
| `investmentList` | `Investment[]`                | Lista de todos os investimentos realizados            |

</div>

**Métodos**:

* `depositFunds()` - Receber investimentos.
* `releaseFunds()` - Liberação quando meta atingida.
* `refundInvestors()` - Reembolso em caso de falha.
* `partialRelease()` - Liberação em etapas.

### Contrato `RepaymentManager`

&emsp;O contrato RepaymentManager é responsável por gerenciar a fase de repagamento dos projetos financiados. Ele define cronogramas de pagamento, aceita repagamentos tradicionais ou baseados em royalties, e realiza a distribuição proporcional dos valores aos investidores.

**Estruturas de dados**:

<div align="center">
<sub>RepaymentSchedule</sub>

| Campo            | Tipo      | Descrição                                    |
| ---------------- | --------- | -------------------------------------------- |
| `projectId`      | `uint256` | ID do projeto associado                      |
| `totalOwed`      | `uint256` | Valor total devido (principal + juros)       |
| `totalPaid`      | `uint256` | Valor total já pago                          |
| `nextPaymentDue` | `uint256` | Data do próximo pagamento                    |
| `monthlyPayment` | `uint256` | Valor da parcela mensal                      |
| `isRoyaltyBased` | `bool`    | Indica se o pagamento é baseado em royalties |
| `isCompleted`    | `bool`    | Indica se o repagamento foi concluído        |
| `createdAt`      | `uint256` | Data de criação do cronograma                |

</div>

<div align="center">
<sub>RoyaltyPayment</sub>

| Campo        | Tipo      | Descrição                                               |
| ------------ | --------- | ------------------------------------------------------- |
| `projectId`  | `uint256` | ID do projeto                                           |
| `amount`     | `uint256` | Valor recebido em royalties                             |
| `source`     | `string`  | Origem dos royalties ("spotify", "show", "merch", etc.) |
| `timestamp`  | `uint256` | Data e hora do pagamento                                |
| `oracleHash` | `bytes32` | Hash da verificação enviada pelo oráculo                |

</div>

**Métodos**: <br>
* `scheduleRepayment()` - Agendar pagamentos
* `processRoyaltyPayment()` - Processar royalties
* `distributePayments()` - Distribuir pro rata
* `calculateInterest()` - Calcular juros

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



