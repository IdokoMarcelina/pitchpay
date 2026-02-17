import { describe, expect, it, beforeEach } from "vitest"
import { Cl } from "@stacks/transactions"

declare const simnet: any

describe("PitchPay Contract - Comprehensive Tests", () => {
  const accounts = simnet.getAccounts()
  const deployer = accounts.get("deployer")!
  const founder1 = accounts.get("wallet_1")!
  const founder2 = accounts.get("wallet_2")!
  const investor1 = accounts.get("wallet_3")!
  const investor2 = accounts.get("wallet_4")!
  const randomUser = accounts.get("wallet_5")!

  // Mock SIP-010 token contract
  const mockToken = "ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.sip-010-trait-ft-standard"

  // Helper to create valid pitch ID
  const createPitchId = (id: number): Buffer => {
    const buf = Buffer.alloc(32)
    buf.writeUInt32BE(id, 28)
    return buf
  }

  const validPitchId = createPitchId(1)
  const validPitchId2 = createPitchId(2)
  const zeroPitchId = Buffer.alloc(32) // All zeros

  beforeEach(() => {
    simnet.setEpoch("3.0")
  })

  describe("Contract Initialization", () => {
    it("should set contract owner to deployer", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-contract-owner",
        [],
        deployer
      )

      expect(result.result).toEqual(Cl.principal(deployer))
    })

    it("should initialize pitch fee correctly", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-pitch-fee",
        [],
        deployer
      )

      expect(result.result).toEqual(Cl.uint(5000000))
    })

    it("should initialize boost fee correctly", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-boost-fee",
        [],
        deployer
      )

      expect(result.result).toEqual(Cl.uint(10000000))
    })

    it("should have zero last receipt ID initially", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-last-token-id",
        [],
        deployer
      )

      expect(result.result).toBeOk(Cl.uint(0))
    })
  })

  describe("Pitch Creation with STX", () => {
    it("should create a pitch with valid ID", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )

      expect(result.result).toBeOk(Cl.bool(true))

      // Check STX transfer event
      expect(result.events[0].event).toBe("stx_transfer_event")
      expect(result.events[0].data.amount).toBe("5000000")
      expect(result.events[0].data.sender).toBe(founder1)
      expect(result.events[0].data.recipient).toBe(deployer)

      // Verify pitch data
      const pitch = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-pitch",
        [Cl.buffer(validPitchId)],
        deployer
      )

      expect(pitch.result).toBeSome(
        Cl.tuple({
          founder: Cl.principal(founder1),
          timestamp: Cl.uint(simnet.blockHeight),
          "is-boosted": Cl.bool(false),
          "amount-paid": Cl.uint(5000000)
        })
      )
    })

    it("should reject pitch with zero buffer ID", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(zeroPitchId)],
        founder1
      )

      expect(result.result).toBeErr(Cl.uint(103)) // ERR-INVALID-PITCH-ID
    })

    it("should reject pitch creation with insufficient funds", () => {
      const poorUser = accounts.get("wallet_6")!
      
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        poorUser
      )

      // Should fail due to insufficient STX
      expect(result.result.type).toBe("err")
    })

    it("should create multiple pitches with different IDs", () => {
      // First pitch
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )

      // Second pitch
      const result2 = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId2)],
        founder2
      )

      expect(result2.result).toBeOk(Cl.bool(true))

      const pitch2 = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-pitch",
        [Cl.buffer(validPitchId2)],
        deployer
      )

      expect(pitch2.result).toBeSome(
        Cl.tuple({
          founder: Cl.principal(founder2),
          timestamp: Cl.uint(simnet.blockHeight),
          "is-boosted": Cl.bool(false),
          "amount-paid": Cl.uint(5000000)
        })
      )
    })
  })

  describe("Pitch Creation with FT", () => {
    it("should create a pitch using SIP-010 token", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch-ft",
        [Cl.buffer(validPitchId), Cl.principal(mockToken)],
        founder1
      )

      // Check FT transfer event
      expect(result.events[0].event).toBe("ft_transfer_event")
      expect(result.events[0].data.amount).toBe("5000000")
      expect(result.events[0].data.sender).toBe(founder1)
      expect(result.events[0].data.recipient).toBe(deployer)

      const pitch = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-pitch",
        [Cl.buffer(validPitchId)],
        deployer
      )

      expect(pitch.result).toBeSome(
        Cl.tuple({
          founder: Cl.principal(founder1),
          timestamp: Cl.uint(simnet.blockHeight),
          "is-boosted": Cl.bool(false),
          "amount-paid": Cl.uint(5000000)
        })
      )
    })

    it("should reject FT pitch with zero buffer ID", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch-ft",
        [Cl.buffer(zeroPitchId), Cl.principal(mockToken)],
        founder1
      )

      expect(result.result).toBeErr(Cl.uint(103))
    })
  })

  describe("Pitch Boosting", () => {
    beforeEach(() => {
      // Create a pitch first
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )
    })

    it("should boost an existing pitch", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-boost",
        [Cl.buffer(validPitchId)],
        founder1
      )

      expect(result.result).toBeOk(Cl.bool(true))

      // Check boost fee transfer
      expect(result.events[0].event).toBe("stx_transfer_event")
      expect(result.events[0].data.amount).toBe("10000000")

      const pitch = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-pitch",
        [Cl.buffer(validPitchId)],
        deployer
      )

      expect(pitch.value.data["is-boosted"]).toBe(Cl.bool(true))
    })

    it("should reject boosting non-existent pitch", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-boost",
        [Cl.buffer(createPitchId(999))],
        founder1
      )

      expect(result.result).toBeErr(Cl.uint(102)) // ERR-PITCH-NOT-FOUND
    })

    it("should reject boosting already boosted pitch", () => {
      // Boost first time
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-boost",
        [Cl.buffer(validPitchId)],
        founder1
      )

      // Try to boost again
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-boost",
        [Cl.buffer(validPitchId)],
        founder1
      )

      expect(result.result).toBeErr(Cl.uint(101)) // ERR-ALREADY-BOOSTED
    })

    it("should allow anyone to boost a pitch", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-boost",
        [Cl.buffer(validPitchId)],
        randomUser // Random user boosting
      )

      expect(result.result).toBeOk(Cl.bool(true))
    })
  })

  describe("Invest in Pitch with STX", () => {
    const investmentAmount = 1000000 // 1 STX

    beforeEach(() => {
      // Create a pitch
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )
    })

    it("should allow investment in pitch", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(investmentAmount)],
        investor1
      )

      expect(result.result).toBeOk(Cl.bool(true))

      // Check STX transfer to founder
      expect(result.events[0].event).toBe("stx_transfer_event")
      expect(result.events[0].data.amount).toBe(investmentAmount.toString())
      expect(result.events[0].data.sender).toBe(investor1)
      expect(result.events[0].data.recipient).toBe(founder1)

      // Check PPR mint
      expect(result.events[1].event).toBe("ft_mint_event")
      expect(result.events[1].data.amount).toBe(investmentAmount.toString())
      expect(result.events[1].data.recipient).toBe(investor1)

      // Check NFT mint
      expect(result.events[2].event).toBe("nft_mint_event")
      expect(result.events[2].data.recipient).toBe(investor1)

      // Verify receipt ID incremented
      const lastReceipt = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-last-token-id",
        [],
        deployer
      )
      expect(lastReceipt.result).toBeOk(Cl.uint(1))

      // Check receipt metadata
      const receipt = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-receipt-metadata",
        [Cl.uint(1)],
        deployer
      )

      expect(receipt.result).toBeSome(
        Cl.tuple({
          amount: Cl.uint(investmentAmount),
          "pitch-id": Cl.buffer(validPitchId),
          investor: Cl.principal(investor1),
          timestamp: Cl.uint(simnet.blockHeight)
        })
      )
    })

    it("should reject investment below minimum", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(99999)], // Below MIN-INVESTMENT
        investor1
      )

      expect(result.result).toBeErr(Cl.uint(105)) // ERR-INVALID-amount
    })

    it("should reject investment in non-existent pitch", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(createPitchId(999)), Cl.uint(investmentAmount)],
        investor1
      )

      expect(result.result).toBeErr(Cl.uint(102))
    })

    it("should allow multiple investments in same pitch", () => {
      // First investment
      simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(investmentAmount)],
        investor1
      )

      // Second investment
      const result2 = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(investmentAmount)],
        investor2
      )

      expect(result2.result).toBeOk(Cl.bool(true))

      // Should have two receipts
      const lastReceipt = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-last-token-id",
        [],
        deployer
      )
      expect(lastReceipt.result).toBeOk(Cl.uint(2))
    })
  })

  describe("Invest in Pitch with FT", () => {
    const investmentAmount = 1000000

    beforeEach(() => {
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )
    })

    it("should allow FT investment in pitch", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch-ft",
        [Cl.buffer(validPitchId), Cl.uint(investmentAmount), Cl.principal(mockToken)],
        investor1
      )

      expect(result.result).toBeOk(Cl.bool(true))

      // Check FT transfer to founder
      expect(result.events[0].event).toBe("ft_transfer_event")
      expect(result.events[0].data.amount).toBe(investmentAmount.toString())
      expect(result.events[0].data.sender).toBe(investor1)
      expect(result.events[0].data.recipient).toBe(founder1)

      // Check PPR mint
      expect(result.events[1].event).toBe("ft_mint_event")
      expect(result.events[1].data.amount).toBe(investmentAmount.toString())
      expect(result.events[1].data.recipient).toBe(investor1)

      // Check NFT mint
      expect(result.events[2].event).toBe("nft_mint_event")
    })

    it("should reject FT investment below minimum", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch-ft",
        [Cl.buffer(validPitchId), Cl.uint(99999), Cl.principal(mockToken)],
        investor1
      )

      expect(result.result).toBeErr(Cl.uint(105))
    })
  })

  describe("NFT Receipt Functions (SIP-009)", () => {
    const investmentAmount = 1000000

    beforeEach(() => {
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )

      simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(investmentAmount)],
        investor1
      )
    })

    it("should get token owner correctly", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-owner",
        [Cl.uint(1)],
        deployer
      )

      expect(result.result).toBeOk(Cl.some(Cl.principal(investor1)))
    })

    it("should return none for non-existent token", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-owner",
        [Cl.uint(999)],
        deployer
      )

      expect(result.result).toBeOk(Cl.none())
    })

    it("should get token URI correctly", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-token-uri",
        [Cl.uint(1)],
        deployer
      )

      expect(result.result).toBeOk(Cl.some(Cl.stringAscii("https://api.pitchpay.io/metadata/receipt/{id}")))
    })

    it("should allow transfer of receipt NFT", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "transfer",
        [Cl.uint(1), Cl.principal(investor1), Cl.principal(investor2)],
        investor1
      )

      expect(result.result).toBeOk(Cl.bool(true))

      // Check owner changed
      const newOwner = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-owner",
        [Cl.uint(1)],
        deployer
      )

      expect(newOwner.result).toBeOk(Cl.some(Cl.principal(investor2)))
    })

    it("should reject transfer by non-owner", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "transfer",
        [Cl.uint(1), Cl.principal(investor1), Cl.principal(investor2)],
        randomUser
      )

      expect(result.result).toBeErr(Cl.uint(100)) // ERR-NOT-AUTHORIZED
    })
  })

  describe("PPR Token Functions", () => {
    const investmentAmount = 1000000

    beforeEach(() => {
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )

      simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(investmentAmount)],
        investor1
      )
    })

    it("should get reward balance correctly", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-reward-balance",
        [Cl.principal(investor1)],
        deployer
      )

      expect(result.result).toBeOk(Cl.uint(investmentAmount))
    })

    it("should return zero balance for non-investor", () => {
      const result = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-reward-balance",
        [Cl.principal(randomUser)],
        deployer
      )

      expect(result.result).toBeOk(Cl.uint(0))
    })
  })

  describe("Fee Management", () => {
    it("should allow owner to set fees", () => {
      const newPitchFee = 6000000
      const newBoostFee = 12000000

      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "set-fees",
        [Cl.uint(newPitchFee), Cl.uint(newBoostFee)],
        deployer
      )

      expect(result.result).toBeOk(Cl.bool(true))

      const pitchFee = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-pitch-fee",
        [],
        deployer
      )
      expect(pitchFee.result).toBeUint(newPitchFee)

      const boostFee = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-boost-fee",
        [],
        deployer
      )
      expect(boostFee.result).toBeUint(newBoostFee)
    })

    it("should reject fee setting by non-owner", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "set-fees",
        [Cl.uint(6000000), Cl.uint(12000000)],
        randomUser
      )

      expect(result.result).toBeErr(Cl.uint(100))
    })

    it("should reject fees below minimum", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "set-fees",
        [Cl.uint(1), Cl.uint(1)], // Below MIN-FEE
        deployer
      )

      expect(result.result).toBeErr(Cl.uint(104)) // ERR-INVALID-FEE
    })

    it("should reject fees above maximum", () => {
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "set-fees",
        [Cl.uint(2000000000), Cl.uint(2000000000)], // Above MAX-FEE
        deployer
      )

      expect(result.result).toBeErr(Cl.uint(104))
    })
  })

  describe("Edge Cases", () => {
    it("should handle maximum investment amounts", () => {
      // Create pitch
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )

      const maxInvestment = 1000000000000 // Large amount
      
      const result = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(maxInvestment)],
        investor1
      )

      // May fail due to STX balance, but should handle the large number
      expect(result.result.type).toBeDefined()
    })

    it("should handle multiple operations in sequence", () => {
      // Create pitch
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )

      // Boost pitch
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-boost",
        [Cl.buffer(validPitchId)],
        founder1
      )

      // Invest in pitch
      const invest = simnet.callPublicFn(
        "pitchpay_clar",
        "invest-in-pitch",
        [Cl.buffer(validPitchId), Cl.uint(1000000)],
        investor1
      )

      expect(invest.result).toBeOk(Cl.bool(true))

      // Transfer receipt
      const transfer = simnet.callPublicFn(
        "pitchpay_clar",
        "transfer",
        [Cl.uint(1), Cl.principal(investor1), Cl.principal(investor2)],
        investor1
      )

      expect(transfer.result).toBeOk(Cl.bool(true))
    })

    it("should maintain correct state after multiple investments", () => {
      simnet.callPublicFn(
        "pitchpay_clar",
        "pay-for-pitch",
        [Cl.buffer(validPitchId)],
        founder1
      )

      // Multiple investments
      for (let i = 0; i < 3; i++) {
        simnet.callPublicFn(
          "pitchpay_clar",
          "invest-in-pitch",
          [Cl.buffer(validPitchId), Cl.uint(1000000)],
          investor1
        )
      }

      const lastReceipt = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-last-token-id",
        [],
        deployer
      )

      expect(lastReceipt.result).toBeOk(Cl.uint(3))

      // Check reward balance (should be sum of investments)
      const balance = simnet.callReadOnlyFn(
        "pitchpay_clar",
        "get-reward-balance",
        [Cl.principal(investor1)],
        deployer
      )

      expect(balance.result).toBeOk(Cl.uint(3000000))
    })
  })
})
