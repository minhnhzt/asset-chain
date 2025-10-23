# Solana Asset Manager - Architecture Diagram

## System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Next.js Frontend<br/>React Components]
        Mobile[Mobile App<br/>React Native]
    end

    subgraph "API Gateway Layer"
        API[API Routes<br/>Next.js API]
        Auth[Authentication<br/>Middleware]
        Cache[Redis Cache<br/>Off-chain Data]
    end

    subgraph "Off-Chain Services"
        IPFS[IPFS Network<br/>Metadata Storage]
        DB[(PostgreSQL<br/>Analytics & Cache)]
        Analytics[Analytics Service<br/>Asset Tracking]
        Indexer[Blockchain Indexer<br/>Event Processing]
    end

    subgraph "Solana Blockchain"
        subgraph "On-Chain Programs"
            AM[Asset Manager Program<br/>Core Logic]
            SPL[SPL Token Program<br/>Token Operations]
            ATA[Associated Token Account<br/>User Balances]
        end
        
        subgraph "On-Chain Accounts"
            AS[Asset Accounts<br/>Asset Metadata]
            GM[Global Manager<br/>Program State]
            ML[Maintenance Logs<br/>Asset History]
        end
    end

    subgraph "External Integrations"
        Oracle[Price Oracle<br/>Chainlink/Pyth]
        Notify[Notification Service<br/>WebSocket/Push]
    end

    %% Client to API connections
    UI --> API
    Mobile --> API
    
    %% API Layer connections
    API --> Auth
    API --> Cache
    API --> IPFS
    API --> DB
    
    %% Off-chain to On-chain connections
    API --> AM
    Indexer --> AM
    Analytics --> DB
    Indexer --> DB
    
    %% On-chain connections
    AM --> SPL
    AM --> ATA
    AM --> AS
    AM --> GM
    AM --> ML
    
    %% External connections
    AM --> Oracle
    API --> Notify
    Indexer --> Notify

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef offchain fill:#fff3e0
    classDef onchain fill:#e8f5e8
    classDef external fill:#fce4ec

    class UI,Mobile frontend
    class API,Auth,Cache api
    class IPFS,DB,Analytics,Indexer offchain
    class AM,SPL,ATA,AS,GM,ML onchain
    class Oracle,Notify external
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant API as Next.js API
    participant IPFS as IPFS Network
    participant DB as PostgreSQL
    participant Solana as Solana Network
    participant Indexer as Event Indexer

    Note over Client,Indexer: Asset Creation Flow

    Client->>API: POST /api/assets (metadata)
    API->>IPFS: Upload metadata
    IPFS-->>API: Return CID
    API->>Solana: create_asset(CID, decimals)
    Solana-->>API: Transaction signature
    API->>DB: Store asset reference
    API-->>Client: Asset created response

    Note over Client,Indexer: Real-time Updates

    Solana->>Indexer: Emit AssetCreated event
    Indexer->>DB: Update analytics
    Indexer->>Client: WebSocket notification

    Note over Client,Indexer: Asset Query Flow

    Client->>API: GET /api/assets/:id
    API->>DB: Check cache
    alt Cache miss
        API->>Solana: Fetch on-chain data
        API->>IPFS: Fetch metadata
        API->>DB: Update cache
    end
    API-->>Client: Asset data
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Architecture"
        subgraph "Pages"
            Home[Home Page<br/>Dashboard]
            Assets[Assets Page<br/>Asset List]
            Detail[Asset Detail<br/>Single Asset View]
            Create[Create Asset<br/>Form & Upload]
        end
        
        subgraph "Components"
            AssetCard[Asset Card<br/>Component]
            Form[Asset Form<br/>Component]
            Web3[Web3 Provider<br/>Wallet Connection]
        end
        
        subgraph "Hooks"
            useAssets[useAssets<br/>Custom Hook]
            useWallet[useWallet<br/>Wallet Hook]
            useSolana[useSolana<br/>Program Hook]
        end
    end

    subgraph "API Architecture"
        subgraph "Routes"
            AssetsAPI[/api/assets<br/>CRUD Operations]
            UploadAPI[/api/upload<br/>IPFS Upload]
            AnalyticsAPI[/api/analytics<br/>Dashboard Data]
        end
        
        subgraph "Services"
            SolanaService[Solana Service<br/>Program Interaction]
            IPFSService[IPFS Service<br/>File Management]
            DBService[Database Service<br/>Data Access]
        end
        
        subgraph "Middleware"
            AuthMW[Auth Middleware<br/>JWT Validation]
            RateLimitMW[Rate Limiting<br/>API Protection]
            CORSMW[CORS Middleware<br/>Cross-origin]
        end
    end

    %% Connections
    Home --> AssetsAPI
    Assets --> AssetsAPI
    Detail --> AssetsAPI
    Create --> UploadAPI
    
    useAssets --> AssetsAPI
    useSolana --> AssetsAPI
    
    AssetsAPI --> SolanaService
    UploadAPI --> IPFSService
    AnalyticsAPI --> DBService

    classDef page fill:#e3f2fd
    classDef component fill:#f1f8e9
    classDef hook fill:#fff8e1
    classDef route fill:#fce4ec
    classDef service fill:#f3e5f5
    classDef middleware fill:#e0f2f1

    class Home,Assets,Detail,Create page
    class AssetCard,Form,Web3 component
    class useAssets,useWallet,useSolana hook
    class AssetsAPI,UploadAPI,AnalyticsAPI route
    class SolanaService,IPFSService,DBService service
    class AuthMW,RateLimitMW,CORSMW middleware
```

## Smart Contract Architecture

```mermaid
graph TB
    subgraph "Asset Manager Program"
        subgraph "Instructions"
            Init[initialize_asset_manager<br/>Setup global state]
            Create[create_asset<br/>Mint new asset token]
            Update[update_asset_metadata<br/>Modify asset info]
            Transfer[transfer_asset<br/>Change ownership]
            Maintain[log_maintenance<br/>Record maintenance]
            Retire[retire_asset<br/>End asset lifecycle]
        end
        
        subgraph "Accounts"
            GM[Global Manager<br/>Program authority & stats]
            Asset[Asset Account<br/>Metadata & status]
            Logs[Maintenance Logs<br/>History tracking]
        end
        
        subgraph "Validations"
            Auth[Authority Checks<br/>Permission validation]
            Data[Data Validation<br/>Input sanitization]
            State[State Validation<br/>Business logic]
        end
    end

    subgraph "SPL Token Integration"
        Mint[Token Mint<br/>Unique per asset]
        ATA[Associated Token Account<br/>User ownership]
        Meta[Token Metadata<br/>Standard compliance]
    end

    subgraph "External Programs"
        TokenProg[Token Program<br/>SPL operations]
        ATAProg[ATA Program<br/>Account creation]
        SysProg[System Program<br/>Account management]
    end

    %% Instruction flows
    Init --> GM
    Create --> Asset
    Create --> Mint
    Update --> Asset
    Transfer --> ATA
    Maintain --> Logs
    Retire --> Asset

    %% Validation flows
    Create --> Auth
    Update --> Data
    Transfer --> State

    %% External program calls
    Create --> TokenProg
    Transfer --> ATAProg
    Asset --> SysProg

    classDef instruction fill:#e8f5e8
    classDef account fill:#e3f2fd
    classDef validation fill:#fff3e0
    classDef spl fill:#f3e5f5
    classDef external fill:#fce4ec

    class Init,Create,Update,Transfer,Maintain,Retire instruction
    class GM,Asset,Logs account
    class Auth,Data,State validation
    class Mint,ATA,Meta spl
    class TokenProg,ATAProg,SysProg external
```

## Data Storage Strategy

```mermaid
graph TB
    subgraph "On-Chain Storage (Solana)"
        subgraph "Permanent Data"
            AssetID[Asset ID<br/>Unique identifier]
            Owner[Owner PublicKey<br/>Current owner]
            Status[Asset Status<br/>Lifecycle state]
            TokenMint[Token Mint<br/>SPL token address]
        end
        
        subgraph "Semi-Permanent Data"
            MetaCID[Metadata CID<br/>IPFS reference]
            MaintenanceLogs[Maintenance History<br/>Limited entries]
            Timestamps[Created/Updated<br/>Block timestamps]
        end
    end

    subgraph "Off-Chain Storage (IPFS)"
        subgraph "Asset Metadata"
            Name[Asset Name<br/>Human readable]
            Description[Description<br/>Detailed info]
            Images[Images/Media<br/>Visual assets]
            Docs[Documents<br/>Manuals, certificates]
        end
        
        subgraph "Extended Data"
            Specs[Technical Specs<br/>Detailed attributes]
            History[Full History<br/>Complete timeline]
            Reports[Reports<br/>Analysis documents]
        end
    end

    subgraph "Database Cache (PostgreSQL)"
        subgraph "Performance Data"
            SearchIndex[Search Index<br/>Fast queries]
            Analytics[Analytics<br/>Usage metrics]
            Cache[Query Cache<br/>Frequent data]
        end
        
        subgraph "User Data"
            Profiles[User Profiles<br/>Off-chain identity]
            Preferences[User Preferences<br/>UI settings]
            Sessions[Session Data<br/>Temporary state]
        end
    end

    %% Data relationships
    AssetID --> MetaCID
    MetaCID --> Name
    MetaCID --> Description
    MetaCID --> Images
    
    AssetID --> SearchIndex
    Owner --> Profiles
    Status --> Analytics

    classDef onchain fill:#e8f5e8
    classDef ipfs fill:#fff3e0
    classDef database fill:#e3f2fd

    class AssetID,Owner,Status,TokenMint,MetaCID,MaintenanceLogs,Timestamps onchain
    class Name,Description,Images,Docs,Specs,History,Reports ipfs
    class SearchIndex,Analytics,Cache,Profiles,Preferences,Sessions database
```

## Security & Access Control

```mermaid
graph TB
    subgraph "Authentication Layer"
        Wallet[Wallet Connection<br/>Phantom/Solflare]
        JWT[JWT Tokens<br/>Session management]
        API_KEY[API Keys<br/>Service authentication]
    end

    subgraph "Authorization Layer"
        RBAC[Role-Based Access<br/>Admin/User/Viewer]
        Ownership[Asset Ownership<br/>On-chain verification]
        Permissions[Fine-grained Permissions<br/>Action-based]
    end

    subgraph "On-Chain Security"
        PDA[Program Derived Address<br/>Secure account derivation]
        Signer[Signer Validation<br/>Transaction authority]
        Guards[Security Guards<br/>Input validation]
    end

    subgraph "Off-Chain Security"
        HTTPS[HTTPS/TLS<br/>Transport encryption]
        Sanitization[Input Sanitization<br/>XSS/Injection prevention]
        RateLimit[Rate Limiting<br/>DDoS protection]
    end

    %% Security flow
    Wallet --> JWT
    JWT --> RBAC
    RBAC --> Ownership
    Ownership --> Permissions
    
    Permissions --> PDA
    PDA --> Signer
    Signer --> Guards
    
    API_KEY --> HTTPS
    HTTPS --> Sanitization
    Sanitization --> RateLimit

    classDef auth fill:#e8f5e8
    classDef authz fill:#fff3e0
    classDef onchain fill:#e3f2fd
    classDef offchain fill:#f3e5f5

    class Wallet,JWT,API_KEY auth
    class RBAC,Ownership,Permissions authz
    class PDA,Signer,Guards onchain
    class HTTPS,Sanitization,RateLimit offchain
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        LocalSolana[Solana Test Validator<br/>Local blockchain]
        LocalIPFS[Local IPFS Node<br/>File storage]
        LocalDB[Local PostgreSQL<br/>Development DB]
        NextDev[Next.js Dev Server<br/>Hot reload]
    end

    subgraph "Staging Environment"
        Devnet[Solana Devnet<br/>Test network]
        IPFSInfura[IPFS via Infura<br/>Managed service]
        StagingDB[Staging Database<br/>Cloud PostgreSQL]
        Vercel[Vercel Staging<br/>Preview deployments]
    end

    subgraph "Production Environment"
        Mainnet[Solana Mainnet<br/>Production network]
        IPFSPinata[IPFS via Pinata<br/>Production service]
        ProdDB[Production Database<br/>High availability]
        CDN[Vercel Production<br/>Global CDN]
    end

    subgraph "Monitoring & Analytics"
        Logging[Structured Logging<br/>Application logs]
        Metrics[Performance Metrics<br/>System monitoring]
        Alerts[Alert System<br/>Issue notification]
        Analytics[Usage Analytics<br/>User behavior]
    end

    %% Environment progression
    LocalSolana --> Devnet
    Devnet --> Mainnet
    
    LocalIPFS --> IPFSInfura
    IPFSInfura --> IPFSPinata
    
    NextDev --> Vercel
    Vercel --> CDN
    
    %% Monitoring connections
    Mainnet --> Logging
    CDN --> Metrics
    ProdDB --> Alerts
    CDN --> Analytics

    classDef dev fill:#e8f5e8
    classDef staging fill:#fff3e0
    classDef prod fill:#e3f2fd
    classDef monitor fill:#f3e5f5

    class LocalSolana,LocalIPFS,LocalDB,NextDev dev
    class Devnet,IPFSInfura,StagingDB,Vercel staging
    class Mainnet,IPFSPinata,ProdDB,CDN prod
    class Logging,Metrics,Alerts,Analytics monitor
```

## Key Features & Benefits

### Hybrid Architecture Benefits

- **On-Chain**: Immutable ownership, transparent transactions, decentralized trust
- **Off-Chain**: Rich metadata, fast queries, cost-effective storage
- **Best of Both**: Security + Performance + User Experience

### Scalability Features

- **Horizontal Scaling**: API can scale independently
- **Caching Strategy**: Multiple cache layers for performance
- **Event-Driven**: Real-time updates via blockchain events
- **CDN Integration**: Global content delivery

### Security Measures

- **Multi-layer Authentication**: Wallet + JWT + API keys
- **On-chain Validation**: Program-level security guards
- **Input Sanitization**: Protection against common attacks
- **Rate Limiting**: DDoS protection

### Developer Experience

- **Type Safety**: Full TypeScript integration
- **Testing**: Comprehensive test suite for contracts and API
- **Documentation**: Auto-generated API docs
- **Hot Reload**: Fast development iteration
 
 