import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MultisigProofs } from "../target/types/multisig_proofs";
import { expect } from "chai";
import * as crypto from "crypto";

describe("multisig-proofs", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MultisigProofs as Program<MultisigProofs>;
  const owner = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop lamports to both accounts
    const sig1 = await anchor.getProvider().connection.requestAirdrop(
      owner.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await anchor.getProvider().connection.confirmTransaction(sig1);

    const sig2 = await anchor.getProvider().connection.requestAirdrop(
      payer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await anchor.getProvider().connection.confirmTransaction(sig2);
  });

  it("Records an approval proof", async () => {
    const requestId = "test-request-001";
    const approvalsHash = crypto.randomBytes(32);

    // Derive PDA
    const [approvalProofPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("approval_proof"),
        owner.publicKey.toBuffer(),
        Buffer.from(requestId),
      ],
      program.programId
    );

    await program.methods
      .recordApprovalProof(
        requestId,
        Array.from(approvalsHash),
        3, // approver_count
        2  // approval_threshold
      )
      .accounts({
        owner: owner.publicKey,
        approvalProof: approvalProofPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    // Fetch and verify the account
    const proof = await program.account.approvalProof.fetch(approvalProofPda);
    expect(proof.requestId).to.equal(requestId);
    expect(proof.approverCount).to.equal(3);
    expect(proof.approvalThreshold).to.equal(2);
    expect(proof.isVerified).to.be.false;
  });

  it("Verifies an approval proof", async () => {
    const requestId = "test-request-002";
    const approvalsHash = crypto.randomBytes(32);

    // Derive PDA
    const [approvalProofPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("approval_proof"),
        owner.publicKey.toBuffer(),
        Buffer.from(requestId),
      ],
      program.programId
    );

    // Record the proof
    await program.methods
      .recordApprovalProof(
        requestId,
        Array.from(approvalsHash),
        2,
        1
      )
      .accounts({
        owner: owner.publicKey,
        approvalProof: approvalProofPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    // Verify the proof
    await program.methods
      .verifyApprovalProof(Array.from(approvalsHash))
      .accounts({
        owner: owner.publicKey,
        approvalProof: approvalProofPda,
      })
      .signers([owner])
      .rpc();

    // Fetch and verify
    const proof = await program.account.approvalProof.fetch(approvalProofPda);
    expect(proof.isVerified).to.be.true;
    expect(proof.verifiedAt).to.exist;
  });

  it("Rejects invalid threshold", async () => {
    const requestId = "test-request-invalid";
    const approvalsHash = crypto.randomBytes(32);

    // Derive PDA
    const [approvalProofPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("approval_proof"),
        owner.publicKey.toBuffer(),
        Buffer.from(requestId),
      ],
      program.programId
    );

    try {
      await program.methods
        .recordApprovalProof(
          requestId,
          Array.from(approvalsHash),
          2,  // approver_count
          3   // approval_threshold > approver_count (INVALID)
        )
        .accounts({
          owner: owner.publicKey,
          approvalProof: approvalProofPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      throw new Error("Should have failed with InvalidThreshold");
    } catch (err: any) {
      expect(err.error.errorCode.code).to.equal("InvalidThreshold");
    }
  });

  it("Detects hash mismatch on verification", async () => {
    const requestId = "test-request-mismatch";
    const approvalsHash = crypto.randomBytes(32);
    const wrongHash = crypto.randomBytes(32);

    // Derive PDA
    const [approvalProofPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("approval_proof"),
        owner.publicKey.toBuffer(),
        Buffer.from(requestId),
      ],
      program.programId
    );

    // Record with one hash
    await program.methods
      .recordApprovalProof(
        requestId,
        Array.from(approvalsHash),
        1,
        1
      )
      .accounts({
        owner: owner.publicKey,
        approvalProof: approvalProofPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    // Try to verify with different hash
    try {
      await program.methods
        .verifyApprovalProof(Array.from(wrongHash))
        .accounts({
          owner: owner.publicKey,
          approvalProof: approvalProofPda,
        })
        .signers([owner])
        .rpc();

      throw new Error("Should have failed with HashMismatch");
    } catch (err: any) {
      expect(err.error.errorCode.code).to.equal("HashMismatch");
    }
  });

  it("Updates proof metadata", async () => {
    const requestId = "test-request-metadata";
    const approvalsHash = crypto.randomBytes(32);
    const metadata = "Additional context for this approval";

    // Derive PDA
    const [approvalProofPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("approval_proof"),
        owner.publicKey.toBuffer(),
        Buffer.from(requestId),
      ],
      program.programId
    );

    // Record the proof
    await program.methods
      .recordApprovalProof(
        requestId,
        Array.from(approvalsHash),
        1,
        1
      )
      .accounts({
        owner: owner.publicKey,
        approvalProof: approvalProofPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    // Update metadata
    await program.methods
      .updateProofMetadata(metadata)
      .accounts({
        owner: owner.publicKey,
        approvalProof: approvalProofPda,
      })
      .signers([owner])
      .rpc();

    // Fetch and verify
    const proof = await program.account.approvalProof.fetch(approvalProofPda);
    expect(proof.metadata).to.equal(metadata);
    expect(proof.metadataUpdatedAt).to.exist;
  });
});
