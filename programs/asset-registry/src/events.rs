use anchor_lang::prelude::*;

/// Emitted when an asset is registered
#[event]
pub struct AssetRegistered {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub location: String,
    pub metadata_cid: String,
    pub timestamp: i64,
}

/// Emitted when asset metadata is updated
#[event]
pub struct AssetMetadataUpdated {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub new_metadata_cid: String,
    pub timestamp: i64,
}

/// Emitted when asset status changes
#[event]
pub struct AssetStatusChanged {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub old_status: u8,
    pub new_status: u8,
    pub timestamp: i64,
}

/// Emitted when a maintenance log entry is added
#[event]
pub struct MaintenanceLogEntryAdded {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub performer: Pubkey,
    pub note: String,
    pub ipfs_cid: String,
    pub timestamp: i64,
    pub entry_count: u32,
}

/// Emitted when maintenance log is initialized
#[event]
pub struct MaintenanceLogInitialized {
    pub asset: Pubkey,
    pub owner: Pubkey,
    pub maintenance_log: Pubkey,
    pub timestamp: i64,
}
