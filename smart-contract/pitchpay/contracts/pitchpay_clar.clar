;; title: pitchpay_clar
;; version:
;; Handles micro-payments for startup pitches and boosts

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-BOOSTED (err u101))
(define-constant ERR-PITCH-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PITCH-ID (err u103))
(define-constant ERR-INVALID-FEE (err u104))
(define-constant ERR-INVALID-amount (err u105))

(define-constant MIN-INVESTMENT u100000)   ;; 0.1 STX minimum

(define-constant MIN-FEE u1000000)       
(define-constant MAX-FEE u1000000000)    

;; Data Maps
(define-map pitches
    { pitch-id: (buff 32) }
    {
        founder: principal,
        timestamp: uint,
        is-boosted: bool,
        amount-paid: uint,
    }
)

;; Data Vars
(define-data-var contract-owner principal tx-sender)
(define-data-var pitch-fee uint u5000000)   ;; 5 STX
(define-data-var boost-fee uint u10000000)  ;; 10 STX

;; Private: validates a pitch-id buffer is non-empty (all-zero buff is suspicious)
(define-private (is-valid-pitch-id (pitch-id (buff 32)))
    (not (is-eq pitch-id 0x0000000000000000000000000000000000000000000000000000000000000000))
)

;; Private: validates fee is within acceptable bounds
(define-private (is-valid-fee (fee uint))
    (and (>= fee MIN-FEE) (<= fee MAX-FEE))
)

;; Read-only functions
(define-read-only (get-pitch (pitch-id (buff 32)))
    (map-get? pitches { pitch-id: pitch-id })
)

(define-read-only (get-pitch-fee)
    (var-get pitch-fee)
)

(define-read-only (get-boost-fee)
    (var-get boost-fee)
)

(define-read-only (get-contract-owner)
    (var-get contract-owner)
)

;; Public functions
(define-public (pay-for-pitch (pitch-id (buff 32)))
    (let ((fee (var-get pitch-fee)))

        (asserts! (is-valid-pitch-id pitch-id) ERR-INVALID-PITCH-ID)

        (try! (stx-transfer? fee tx-sender (var-get contract-owner)))

        (map-set pitches { pitch-id: pitch-id } {
            founder: tx-sender,
            timestamp: stacks-block-height,
            is-boosted: false,
            amount-paid: fee,
        })

        (print {
            event: "pitch-created",
            pitch-id: pitch-id,
            founder: tx-sender,
        })
        (ok true)
    )
)

(define-public (pay-for-boost (pitch-id (buff 32)))
    (let (
            (pitch (unwrap! (get-pitch pitch-id) ERR-PITCH-NOT-FOUND))
            (fee (var-get boost-fee))
        )
        (asserts! (not (get is-boosted pitch)) ERR-ALREADY-BOOSTED)

        (try! (stx-transfer? fee tx-sender (var-get contract-owner)))

        (map-set pitches { pitch-id: pitch-id }
            (merge pitch { is-boosted: true })
        )

        (print {
            event: "pitch-boosted",
            pitch-id: pitch-id,
        })
        (ok true)
    )
)

;; Invest in a pitch - pay directly to founder
(define-public (invest-in-pitch (pitch-id (buff 32)) (amount uint))
    (let (
        (pitch (unwrap! (get-pitch pitch-id) ERR-PITCH-NOT-FOUND))
        (founder (get founder pitch))
    )
        (asserts! (>= amount MIN-INVESTMENT) ERR-INVALID-amount)
        
        (try! (stx-transfer? amount tx-sender founder))
        
        (print {
            event: "pitch-invested",
            pitch-id: pitch-id,
            investor: tx-sender,
            founder: founder,
            amount: amount,
        })
        (ok true)
    )
)

;; Owner functions
(define-public (set-fees
        (new-pitch-fee uint)
        (new-boost-fee uint)
    )
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)

        (asserts! (is-valid-fee new-pitch-fee) ERR-INVALID-FEE)
        (asserts! (is-valid-fee new-boost-fee) ERR-INVALID-FEE)

        (var-set pitch-fee new-pitch-fee)
        (var-set boost-fee new-boost-fee)
        (ok true)
    )
)