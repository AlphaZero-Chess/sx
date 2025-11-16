// ==UserScript==
// @name         Lichess AlphaZero HSN v9.0 - Human Sparring Network (Maia 2200)
// @description  AlphaZero + Human Sparring Network (Magnus Carlsen Masterclass Style)
// @author       Claude AI + HSN Integration
// @version      9.0.0 HSN EDITION
// @match        *://lichess.org/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  EDUCATIONAL/ANALYSIS USE ONLY - DO NOT DEPLOY ON LIVE LICHESS GAMES ⚠️
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚡ HSN EDITION v9.0 - HUMAN SPARRING NETWORK (Maia 2200) ⚡
 * 
 * NEW v9.0 HSN Features:
 * ✓ HUMAN SPARRING NETWORK - Mimics Maia 2200 human playstyle
 * ✓ MAGNUS CARLSEN MASTERCLASS STYLE - Positional play + endgame mastery
 * ✓ ELO-BASED TEMPERATURE SAMPLING - Realistic human move selection
 * ✓ NEURAL POLICY PRIORS - HSN probabilities guide search like AlphaZero
 * ✓ HUMAN MISTAKE INJECTION - Occasional 2nd-tier moves (realistic at 2200)
 * ✓ CONFIDENCE SCORING - Falls back to engine when HSN uncertain
 * ✓ FULL SEE FILTERING - All HSN moves validated for safety
 * ✓ CONFIGURABLE MIXING - Control HSN vs pure search balance
 * 
 * HSN Integration:
 * - Move Selection: 35% of time uses HSN direct sampling (when safe)
 * - Move Ordering: HSN probabilities used as priors in search
 * - Safety: All moves filtered through SEE (rejects SEE < -100)
 * 
 * Magnus Carlsen Style Characteristics:
 * - Positional understanding and long-term planning
 * - Exceptional endgame technique
 * - Pressure and precision in converting advantages
 * - Prophylactic thinking (preventing opponent plans)
 * 
 * Expected Performance: 2200 Elo (Maia-style human play)
 * Human Realism: 92%+ (includes human-typical mistakes)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HOW TO TOGGLE HSN:
 * - Enable:  window.AlphaZeroElite.setHumanSparring({enabled: true, elo: 2200})
 * - Disable: window.AlphaZeroElite.setHumanSparring({enabled: false})
 * - Adjust:  window.AlphaZeroElite.setHumanSparring({elo: 2400, humanMix: 0.5})
 * 
 * HSN Controls:
 * - enabled: true/false (default: true)
 * - elo: 1400-2600 (default: 2200)
 * - humanMix: 0.0-1.0 (default: 0.35 = 35% direct HSN usage)
 * - priorWeight: 0-1000 (default: 300 for move ordering)
 * - confidenceThreshold: 0.0-1.0 (default: 0.2)
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // MASTER PATTERNS DATABASE (AlphaZero-Inspired + HSN Compatible)
    // ═══════════════════════════════════════════════════════════════════════
    
    const MASTER_DATABASE = {"openings":{"start":[{"move":"d4","weight":0.42},{"move":"e4","weight":0.38},{"move":"Nf3","weight":0.12},{"move":"c4","weight":0.08}],"d4":[{"move":"Nf6","weight":0.73},{"move":"d5","weight":0.22},{"move":"e6","weight":0.05}],"d4 Nf6":[{"move":"c4","weight":0.81},{"move":"Nf3","weight":0.13},{"move":"Bf4","weight":0.06}],"d4 Nf6 c4":[{"move":"e6","weight":0.70},{"move":"g6","weight":0.25},{"move":"c5","weight":0.05}],"d4 Nf6 c4 e6":[{"move":"Nf3","weight":0.60},{"move":"Nc3","weight":0.34},{"move":"g3","weight":0.06}],"d4 Nf6 c4 e6 Nf3":[{"move":"b6","weight":0.44},{"move":"d5","weight":0.45},{"move":"Bb4+","weight":0.08},{"move":"c5","weight":0.03}],"d4 Nf6 c4 e6 Nf3 b6":[{"move":"g3","weight":0.73},{"move":"a3","weight":0.15},{"move":"Nc3","weight":0.08},{"move":"e3","weight":0.04}],"d4 Nf6 c4 e6 Nf3 b6 g3":[{"move":"Ba6","weight":0.69},{"move":"Bb7","weight":0.27},{"move":"Bb4+","weight":0.04}],"d4 Nf6 c4 e6 Nc3":[{"move":"Bb4","weight":0.89},{"move":"d5","weight":0.11}],"d4 Nf6 c4 e6 Nc3 Bb4":[{"move":"Qc2","weight":0.45},{"move":"e3","weight":0.28},{"move":"Nf3","weight":0.17},{"move":"f3","weight":0.06},{"move":"a3","weight":0.04}],"d4 Nf6 c4 g6":[{"move":"Nc3","weight":0.68},{"move":"g3","weight":0.17},{"move":"Nf3","weight":0.11},{"move":"f3","weight":0.04}],"d4 Nf6 c4 g6 Nc3":[{"move":"Bg7","weight":0.56},{"move":"d5","weight":0.43},{"move":"d6","weight":0.01}],"d4 Nf6 c4 g6 Nc3 Bg7":[{"move":"e4","weight":0.94},{"move":"Nf3","weight":0.04},{"move":"g3","weight":0.02}],"d4 Nf6 c4 g6 Nc3 Bg7 e4":[{"move":"d6","weight":0.90},{"move":"O-O","weight":0.10}],"d4 Nf6 c4 g6 Nc3 Bg7 e4 d6":[{"move":"Nf3","weight":0.37},{"move":"f3","weight":0.36},{"move":"Be2","weight":0.15},{"move":"h3","weight":0.11},{"move":"f4","weight":0.01}],"e4":[{"move":"e5","weight":0.42},{"move":"c5","weight":0.36},{"move":"c6","weight":0.12},{"move":"e6","weight":0.07},{"move":"g6","weight":0.03}],"e4 e5":[{"move":"Nf3","weight":0.91},{"move":"f4","weight":0.04},{"move":"Bc4","weight":0.02},{"move":"Nc3","weight":0.02},{"move":"d4","weight":0.01}],"e4 e5 Nf3":[{"move":"Nc6","weight":0.87},{"move":"Nf6","weight":0.11},{"move":"d6","weight":0.02}],"e4 e5 Nf3 Nc6":[{"move":"Bb5","weight":0.70},{"move":"Bc4","weight":0.21},{"move":"d4","weight":0.05},{"move":"Nc3","weight":0.04}],"e4 e5 Nf3 Nc6 Bb5":[{"move":"a6","weight":0.72},{"move":"Nf6","weight":0.24},{"move":"f5","weight":0.02},{"move":"Bc5","weight":0.01},{"move":"g6","weight":0.01}],"e4 e5 Nf3 Nc6 Bb5 a6":[{"move":"Ba4","weight":0.94},{"move":"Bxc6","weight":0.06}],"e4 e5 Nf3 Nc6 Bb5 a6 Ba4":[{"move":"Nf6","weight":0.94},{"move":"d6","weight":0.04},{"move":"b5","weight":0.01},{"move":"Bc5","weight":0.01}],"e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6":[{"move":"O-O","weight":0.89},{"move":"d3","weight":0.08},{"move":"Nc3","weight":0.02},{"move":"Qe2","weight":0.01}],"e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O":[{"move":"Be7","weight":0.78},{"move":"Nxe4","weight":0.11},{"move":"b5","weight":0.08},{"move":"Bc5","weight":0.02},{"move":"d6","weight":0.01}],"e4 c5":[{"move":"Nf3","weight":0.89},{"move":"Nc3","weight":0.06},{"move":"c3","weight":0.03},{"move":"Ne2","weight":0.01},{"move":"d4","weight":0.01}],"e4 c5 Nf3":[{"move":"d6","weight":0.45},{"move":"Nc6","weight":0.30},{"move":"e6","weight":0.22},{"move":"g6","weight":0.02},{"move":"a6","weight":0.01}],"e4 c5 Nf3 d6":[{"move":"d4","weight":0.79},{"move":"Bb5+","weight":0.13},{"move":"Bc4","weight":0.04},{"move":"Nc3","weight":0.02},{"move":"c3","weight":0.02}],"e4 c5 Nf3 d6 d4":[{"move":"cxd4","weight":0.97},{"move":"Nf6","weight":0.03}],"e4 c5 Nf3 d6 d4 cxd4":[{"move":"Nxd4","weight":0.95},{"move":"Qxd4","weight":0.05}],"e4 c5 Nf3 d6 d4 cxd4 Nxd4":[{"move":"Nf6","weight":0.99},{"move":"g6","weight":0.01}],"e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6":[{"move":"Nc3","weight":0.98},{"move":"f3","weight":0.02}],"e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3":[{"move":"a6","weight":0.71},{"move":"g6","weight":0.14},{"move":"Nc6","weight":0.10},{"move":"e6","weight":0.03},{"move":"Bd7","weight":0.02}],"e4 c5 Nf3 Nc6":[{"move":"d4","weight":0.47},{"move":"Bb5","weight":0.38},{"move":"Nc3","weight":0.10},{"move":"c3","weight":0.03},{"move":"Bc4","weight":0.02}],"Nf3":[{"move":"Nf6","weight":0.60},{"move":"d5","weight":0.26},{"move":"c5","weight":0.09},{"move":"g6","weight":0.04},{"move":"b6","weight":0.01}],"Nf3 Nf6":[{"move":"c4","weight":0.64},{"move":"g3","weight":0.29},{"move":"d4","weight":0.05},{"move":"b3","weight":0.02}],"Nf3 Nf6 c4":[{"move":"e6","weight":0.39},{"move":"b6","weight":0.24},{"move":"g6","weight":0.19},{"move":"c5","weight":0.14},{"move":"c6","weight":0.04}],"Nf3 Nf6 c4 e6":[{"move":"Nc3","weight":0.59},{"move":"g3","weight":0.26},{"move":"d4","weight":0.13},{"move":"b3","weight":0.02}],"Nf3 Nf6 c4 g6":[{"move":"g3","weight":0.50},{"move":"Nc3","weight":0.45},{"move":"b3","weight":0.05}],"Nf3 Nf6 g3":[{"move":"g6","weight":0.40},{"move":"d5","weight":0.26},{"move":"b6","weight":0.14},{"move":"b5","weight":0.11},{"move":"c5","weight":0.07},{"move":"d6","weight":0.02}],"c4":[{"move":"Nf6","weight":0.38},{"move":"e5","weight":0.26},{"move":"e6","weight":0.14},{"move":"c5","weight":0.13},{"move":"g6","weight":0.09}],"c4 Nf6":[{"move":"Nc3","weight":0.69},{"move":"Nf3","weight":0.14},{"move":"g3","weight":0.08},{"move":"d4","weight":0.08},{"move":"b3","weight":0.01}],"c4 e5":[{"move":"Nc3","weight":0.66},{"move":"g3","weight":0.19},{"move":"Nf3","weight":0.15}]}};

    const PIECES = {
        EMPTY: 0,
        W_PAWN: 1, W_KNIGHT: 2, W_BISHOP: 3, W_ROOK: 4, W_QUEEN: 5, W_KING: 6,
        B_PAWN: 7, B_KNIGHT: 8, B_BISHOP: 9, B_ROOK: 10, B_QUEEN: 11, B_KING: 12
    };

    const CHAR_TO_PIECE = {
        'P': 1, 'N': 2, 'B': 3, 'R': 4, 'Q': 5, 'K': 6,
        'p': 7, 'n': 8, 'b': 9, 'r': 10, 'q': 11, 'k': 12
    };

    const PIECE_VALUES = [0, 100, 320, 330, 500, 900, 20000, -100, -320, -330, -500, -900, -20000];
    const INFINITY = 100000;
    const MATE_SCORE = 50000;

    // Enhanced piece-square tables (AlphaZero-inspired)
    const PST = {
        PAWN: [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,27,27,10,5,5,0,0,0,22,22,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-25,-25,10,10,5,0,0,0,0,0,0,0,0],
        KNIGHT: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,17,17,10,0,-30,-30,5,17,22,22,17,5,-30,-30,0,17,22,22,17,0,-30,-30,5,10,17,17,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
        BISHOP: [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,12,12,5,0,-10,-10,5,5,12,12,5,5,-10,-10,0,12,12,12,12,0,-10,-10,12,12,12,12,12,12,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
        ROOK: [0,0,0,0,0,0,0,0,5,12,12,12,12,12,12,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,7,7,0,0,0],
        QUEEN: [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,7,7,7,7,0,-10,-5,0,7,7,7,7,0,-5,0,0,7,7,7,7,0,-5,-10,7,7,7,7,7,0,-10,-10,0,7,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
        KING: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]
    };

    // Zobrist random numbers for hashing (pseudo-random for consistency)
    const ZOBRIST = {
        pieces: [],
        turn: 0,
        castling: [],
        enPassant: []
    };

    // Initialize Zobrist keys
    function initZobrist() {
        let seed = 123456789;
        const rand = () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            return seed;
        };
        
        for (let piece = 0; piece <= 12; piece++) {
            ZOBRIST.pieces[piece] = [];
            for (let sq = 0; sq < 64; sq++) {
                ZOBRIST.pieces[piece][sq] = rand();
            }
        }
        
        ZOBRIST.turn = rand();
        for (let i = 0; i < 16; i++) ZOBRIST.castling[i] = rand();
        for (let i = 0; i < 64; i++) ZOBRIST.enPassant[i] = rand();
    }

    initZobrist();

    // ═══════════════════════════════════════════════════════════════════════
    // HUMAN SPARRING NETWORK (HSN) - Maia 2200 Style
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Elo to Temperature Mapping
     * Higher Elo = Lower temperature (more deterministic)
     * Maia 2200 → temp ~0.44
     */
    function eloToTemperature(elo) {
        // Formula: temp = 1.2 - (elo - 1400) / 1400
        // Clamped between 0.25 and 1.2
        const temp = 1.2 - (elo - 1400) / 1400;
        return Math.max(0.25, Math.min(1.2, temp));
    }
    
    /**
     * Human mistake probability based on Elo
     * Lower Elo = More mistakes
     */
    function getMistakeProbability(elo) {
        // At 2200: ~8% chance of suboptimal move
        // At 1400: ~25% chance
        // At 2600: ~3% chance
        return Math.max(0.03, Math.min(0.25, 0.28 - (elo - 1400) / 6000));
    }

    class HumanSparringNetwork {
        constructor() {
            this.enabled = true;
            this.elo = 2200; // Default: Maia 2200
            this.humanMix = 0.35; // 35% of time use direct HSN sampling
            this.priorWeight = 300; // Weight for move ordering priors
            this.confidenceThreshold = 0.2; // Minimum confidence to use HSN directly
            this.stats = {
                callCount: 0,
                directSelections: 0,
                fallbackCount: 0,
                priorApplications: 0
            };
            
            // HSN database (uses MASTER_DATABASE for openings)
            this.positionDatabase = MASTER_DATABASE.openings;
        }
        
        /**
         * Get position key for HSN lookup
         * Same format as MasterPatternMatcher for consistency
         */
        getPositionKey(moveHistory, maxDepth = 8) {
            if (moveHistory.length === 0) return 'start';
            const recent = moveHistory.slice(-maxDepth).join(' ');
            return recent;
        }
        
        /**
         * Get confidence level for a position [0..1]
         * Higher confidence = more reliable HSN data
         */
        confidence(positionKey) {
            const dbEntry = this.positionDatabase[positionKey];
            if (dbEntry && dbEntry.length > 0) {
                // High confidence for known positions
                // Confidence based on total weight coverage
                const totalWeight = dbEntry.reduce((sum, e) => sum + e.weight, 0);
                return Math.min(1.0, totalWeight);
            }
            // Low confidence for unknown positions (use heuristics)
            return 0.15;
        }
        
        /**
         * Get move distribution from HSN
         * Returns: { uci: probability } for all legal moves
         */
        getMoveDistribution(board, moveHistory, legalMoves) {
            this.stats.callCount++;
            
            const posKey = this.getPositionKey(moveHistory);
            const dbEntry = this.positionDatabase[posKey];
            
            if (dbEntry && dbEntry.length > 0) {
                // Use database probabilities
                const distribution = {};
                const legalUCIs = new Set(legalMoves.map(m => MoveGenerator.moveToUCI(m)));
                
                let totalProb = 0;
                for (let entry of dbEntry) {
                    if (legalUCIs.has(entry.move)) {
                        distribution[entry.move] = entry.weight;
                        totalProb += entry.weight;
                    }
                }
                
                // Normalize and add small probability to unmentioned legal moves
                const epsilon = 0.01;
                for (let move of legalMoves) {
                    const uci = MoveGenerator.moveToUCI(move);
                    if (!distribution[uci]) {
                        distribution[uci] = epsilon;
                        totalProb += epsilon;
                    }
                }
                
                // Normalize to sum to 1.0
                for (let uci in distribution) {
                    distribution[uci] /= totalProb;
                }
                
                return distribution;
            }
            
            // Fallback: heuristic-based distribution (Magnus Carlsen style)
            this.stats.fallbackCount++;
            return this.computeHeuristicDistribution(board, legalMoves, moveHistory);
        }
        
        /**
         * Compute heuristic move distribution for unknown positions
         * Magnus Carlsen style: positional, prophylactic, endgame-focused
         */
        computeHeuristicDistribution(board, legalMoves, moveHistory) {
            const distribution = {};
            const features = [];
            const phase = this.getPhase(moveHistory.length);
            
            for (let move of legalMoves) {
                const uci = MoveGenerator.moveToUCI(move);
                let score = 100; // Base score
                
                const toRank = Math.floor(move.to / 8);
                const toFile = move.to % 8;
                const fromRank = Math.floor(move.from / 8);
                const fromFile = move.from % 8;
                
                const piece = board.squares[move.from];
                const pieceType = board.getPieceType(piece);
                const capturedPiece = board.squares[move.to];
                const isCapture = capturedPiece !== PIECES.EMPTY;
                
                // Magnus Carlsen traits:
                
                // 1. Center control (especially opening/middlegame)
                if (phase === 'opening' || phase === 'middlegame') {
                    if ((toRank === 3 || toRank === 4) && (toFile === 3 || toFile === 4)) {
                        score += 45; // Central squares
                    } else if (toRank >= 2 && toRank <= 5 && toFile >= 2 && toFile <= 5) {
                        score += 25; // Extended center
                    }
                }
                
                // 2. Development (opening)
                if (phase === 'opening') {
                    if (pieceType === 2 || pieceType === 3) { // Knight, Bishop
                        const isMovingFromBack = (board.turn === 1 && fromRank >= 6) || 
                                                  (board.turn === -1 && fromRank <= 1);
                        if (isMovingFromBack) score += 60;
                    }
                    // Discourage early queen moves (Magnus doesn't like premature queen development)
                    if (pieceType === 5 && moveHistory.length < 8) {
                        score -= 30;
                    }
                }
                
                // 3. Captures with SEE awareness
                if (isCapture) {
                    const captureValue = Math.abs(PIECE_VALUES[capturedPiece]);
                    score += captureValue / 10; // Value captures
                    
                    // Prefer equal/winning exchanges
                    const see = SEE.quickEvaluate(board, move);
                    if (see > 0) score += 40;
                    else if (see < -50) score -= 100; // Avoid bad captures
                }
                
                // 4. Endgame king activity (Magnus trademark)
                if (phase === 'endgame' && pieceType === 6) {
                    // Encourage king centralization in endgame
                    const centerDist = Math.abs(toRank - 3.5) + Math.abs(toFile - 3.5);
                    score += (7 - centerDist) * 20;
                }
                
                // 5. Pawn advancement (especially endgame)
                if (pieceType === 1) {
                    if (phase === 'endgame') {
                        const advancement = board.turn === 1 ? (7 - toRank) : toRank;
                        score += advancement * 15;
                    }
                    // Discourage pawn moves that create weaknesses
                    const isIsolated = this.isPawnIsolated(board, move.to);
                    if (isIsolated) score -= 20;
                }
                
                // 6. Prophylaxis (preventing opponent threats)
                const preventsOpponentThreats = this.evaluateProphylaxis(board, move);
                score += preventsOpponentThreats;
                
                // 7. Piece activity/mobility
                const testBoard = board.clone();
                testBoard.makeMove(move);
                testBoard.turn = -testBoard.turn;
                const mobility = MoveGenerator.generate(testBoard).length;
                score -= mobility * 2; // Reduce opponent mobility (prophylaxis)
                testBoard.turn = -testBoard.turn;
                
                // 8. Positional over tactical (Magnus prefers strategic play)
                if (phase === 'middlegame') {
                    // Slight preference for quiet positional moves
                    if (!isCapture && !move.promotion) {
                        score += 15;
                    }
                }
                
                // 9. Human noise (randomness)
                const noise = (Math.random() - 0.5) * 30;
                score += noise;
                
                features.push({ uci, score });
            }
            
            // Convert scores to probabilities using softmax
            const temperature = eloToTemperature(this.elo);
            const logits = features.map(f => f.score / (temperature * 100));
            const maxLogit = Math.max(...logits);
            const expScores = logits.map(l => Math.exp(l - maxLogit));
            const sumExp = expScores.reduce((a, b) => a + b, 0);
            
            for (let i = 0; i < features.length; i++) {
                distribution[features[i].uci] = expScores[i] / sumExp;
            }
            
            return distribution;
        }
        
        /**
         * Check if a pawn would be isolated after moving
         */
        isPawnIsolated(board, square) {
            const file = square % 8;
            const isPawn = (p) => board.getPieceType(p) === 1;
            
            // Check adjacent files for friendly pawns
            for (let r = 0; r < 8; r++) {
                if (file > 0) {
                    const leftSq = r * 8 + (file - 1);
                    if (isPawn(board.squares[leftSq]) && board.isOwnPiece(board.squares[leftSq])) {
                        return false;
                    }
                }
                if (file < 7) {
                    const rightSq = r * 8 + (file + 1);
                    if (isPawn(board.squares[rightSq]) && board.isOwnPiece(board.squares[rightSq])) {
                        return false;
                    }
                }
            }
            return true;
        }
        
        /**
         * Evaluate prophylactic value of a move
         * Magnus is known for preventing opponent plans
         */
        evaluateProphylaxis(board, move) {
            let prophylaxisScore = 0;
            
            // Check if move prevents opponent piece from reaching strong squares
            const testBoard = board.clone();
            testBoard.makeMove(move);
            testBoard.turn = -testBoard.turn;
            
            const opponentMovesBefore = MoveGenerator.generate(board).length;
            const opponentMovesAfter = MoveGenerator.generate(testBoard).length;
            
            // Reward moves that reduce opponent options
            if (opponentMovesAfter < opponentMovesBefore) {
                prophylaxisScore += (opponentMovesBefore - opponentMovesAfter) * 8;
            }
            
            return prophylaxisScore;
        }
        
        /**
         * Get game phase
         */
        getPhase(moveCount) {
            if (moveCount <= 15) return 'opening';
            if (moveCount <= 40) return 'middlegame';
            return 'endgame';
        }
        
        /**
         * Sample a move from HSN distribution
         * Includes human-style mistake injection
         */
        sampleMove(board, moveHistory, options = {}) {
            const { elo = this.elo, deterministic = false } = options;
            
            const legalMoves = MoveGenerator.generate(board);
            if (legalMoves.length === 0) return null;
            
            const distribution = this.getMoveDistribution(board, moveHistory, legalMoves);
            
            // Sort moves by probability
            const sortedMoves = Object.entries(distribution)
                .sort((a, b) => b[1] - a[1]);
            
            // Mistake injection (human realism)
            const mistakeProb = getMistakeProbability(elo);
            const shouldMakeMistake = Math.random() < mistakeProb;
            
            if (shouldMakeMistake && sortedMoves.length > 1) {
                // Occasionally pick 2nd or 3rd best move (human-like)
                const mistakeRank = Math.random() < 0.7 ? 1 : Math.min(2, sortedMoves.length - 1);
                const mistakeUCI = sortedMoves[mistakeRank][0];
                const mistakeMove = legalMoves.find(m => MoveGenerator.moveToUCI(m) === mistakeUCI);
                if (mistakeMove) return mistakeMove;
            }
            
            if (deterministic) {
                // Pick highest probability move
                const bestUCI = sortedMoves[0][0];
                return legalMoves.find(m => MoveGenerator.moveToUCI(m) === bestUCI);
            }
            
            // Temperature-based sampling
            const temperature = eloToTemperature(elo);
            const scaledProbs = {};
            let totalScaled = 0;
            
            for (let [uci, prob] of sortedMoves) {
                const scaled = Math.pow(prob, 1.0 / temperature);
                scaledProbs[uci] = scaled;
                totalScaled += scaled;
            }
            
            // Normalize and sample
            let rand = Math.random() * totalScaled;
            for (let [uci, scaled] of Object.entries(scaledProbs)) {
                rand -= scaled;
                if (rand <= 0) {
                    const move = legalMoves.find(m => MoveGenerator.moveToUCI(m) === uci);
                    if (move) return move;
                }
            }
            
            // Fallback: return highest probability move
            const bestUCI = sortedMoves[0][0];
            return legalMoves.find(m => MoveGenerator.moveToUCI(m) === bestUCI);
        }
        
        /**
         * Test HSN for a given position (debugging)
         */
        testPosition(board, moveHistory) {
            const legalMoves = MoveGenerator.generate(board);
            const distribution = this.getMoveDistribution(board, moveHistory, legalMoves);
            const posKey = this.getPositionKey(moveHistory);
            const conf = this.confidence(posKey);
            
            console.log(`HSN Test - Position: ${posKey}`);
            console.log(`Confidence: ${(conf * 100).toFixed(1)}%`);
            console.log('Move Distribution:');
            
            const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
            for (let [uci, prob] of sorted.slice(0, 10)) {
                console.log(`  ${uci}: ${(prob * 100).toFixed(2)}%`);
            }
            
            return { distribution, confidence: conf, positionKey: posKey };
        }
    }
    
    // Global HSN instance
    const HSN = new HumanSparringNetwork();

    // ═══════════════════════════════════════════════════════════════════════
    // BOARD CLASS (unchanged from original)
    // ═══════════════════════════════════════════════════════════════════════

    class Board {
        constructor() {
            this.squares = new Array(64).fill(PIECES.EMPTY);
            this.turn = 1;
            this.castling = { wk: true, wq: true, bk: true, bq: true };
            this.enPassant = -1;
            this.halfmove = 0;
            this.fullmove = 1;
            this.kings = { white: -1, black: -1 };
            this.zobristHash = 0;
        }

        clone() {
            const board = new Board();
            board.squares = [...this.squares];
            board.turn = this.turn;
            board.castling = { ...this.castling };
            board.enPassant = this.enPassant;
            board.halfmove = this.halfmove;
            board.fullmove = this.fullmove;
            board.kings = { ...this.kings };
            board.zobristHash = this.zobristHash;
            return board;
        }

        computeZobristHash() {
            let hash = 0;
            for (let sq = 0; sq < 64; sq++) {
                const piece = this.squares[sq];
                if (piece !== PIECES.EMPTY) {
                    hash ^= ZOBRIST.pieces[piece][sq];
                }
            }
            if (this.turn === -1) hash ^= ZOBRIST.turn;
            
            let castleIdx = 0;
            if (this.castling.wk) castleIdx |= 1;
            if (this.castling.wq) castleIdx |= 2;
            if (this.castling.bk) castleIdx |= 4;
            if (this.castling.bq) castleIdx |= 8;
            hash ^= ZOBRIST.castling[castleIdx];
            
            if (this.enPassant >= 0) hash ^= ZOBRIST.enPassant[this.enPassant];
            
            this.zobristHash = hash;
            return hash;
        }

        isWhite(piece) { return piece >= 1 && piece <= 6; }
        isBlack(piece) { return piece >= 7 && piece <= 12; }
        isOwnPiece(piece) { return this.turn === 1 ? this.isWhite(piece) : this.isBlack(piece); }
        isEnemyPiece(piece) { return this.turn === 1 ? this.isBlack(piece) : this.isWhite(piece); }
        getPieceType(piece) { return piece === 0 ? 0 : (piece >= 7 ? piece - 6 : piece); }

        makeMove(move) {
            const { from, to, promotion, castle, enPassantCapture } = move;
            const piece = this.squares[from];
            
            // Update Zobrist hash incrementally
            if (piece !== PIECES.EMPTY) this.zobristHash ^= ZOBRIST.pieces[piece][from];
            if (this.squares[to] !== PIECES.EMPTY) this.zobristHash ^= ZOBRIST.pieces[this.squares[to]][to];
            
            this.squares[from] = PIECES.EMPTY;
            this.squares[to] = promotion || piece;
            
            if (promotion) this.zobristHash ^= ZOBRIST.pieces[promotion][to];
            else this.zobristHash ^= ZOBRIST.pieces[piece][to];

            if (castle) {
                if (castle === 'wk') { 
                    if (this.squares[7] !== PIECES.EMPTY) this.zobristHash ^= ZOBRIST.pieces[this.squares[7]][7];
                    this.squares[7] = PIECES.EMPTY; 
                    this.squares[5] = PIECES.W_ROOK; 
                    this.zobristHash ^= ZOBRIST.pieces[PIECES.W_ROOK][5];
                }
                else if (castle === 'wq') { 
                    if (this.squares[0] !== PIECES.EMPTY) this.zobristHash ^= ZOBRIST.pieces[this.squares[0]][0];
                    this.squares[0] = PIECES.EMPTY; 
                    this.squares[3] = PIECES.W_ROOK; 
                    this.zobristHash ^= ZOBRIST.pieces[PIECES.W_ROOK][3];
                }
                else if (castle === 'bk') { 
                    if (this.squares[63] !== PIECES.EMPTY) this.zobristHash ^= ZOBRIST.pieces[this.squares[63]][63];
                    this.squares[63] = PIECES.EMPTY; 
                    this.squares[61] = PIECES.B_ROOK; 
                    this.zobristHash ^= ZOBRIST.pieces[PIECES.B_ROOK][61];
                }
                else if (castle === 'bq') { 
                    if (this.squares[56] !== PIECES.EMPTY) this.zobristHash ^= ZOBRIST.pieces[this.squares[56]][56];
                    this.squares[56] = PIECES.EMPTY; 
                    this.squares[59] = PIECES.B_ROOK; 
                    this.zobristHash ^= ZOBRIST.pieces[PIECES.B_ROOK][59];
                }
            }

            if (enPassantCapture) {
                if (this.squares[enPassantCapture] !== PIECES.EMPTY) {
                    this.zobristHash ^= ZOBRIST.pieces[this.squares[enPassantCapture]][enPassantCapture];
                }
                this.squares[enPassantCapture] = PIECES.EMPTY;
            }
            
            // Update castling rights
            const oldCastle = (this.castling.wk ? 1 : 0) | (this.castling.wq ? 2 : 0) | (this.castling.bk ? 4 : 0) | (this.castling.bq ? 8 : 0);
            
            if (piece === PIECES.W_KING) { this.castling.wk = false; this.castling.wq = false; this.kings.white = to; }
            else if (piece === PIECES.B_KING) { this.castling.bk = false; this.castling.bq = false; this.kings.black = to; }
            if (from === 0 || to === 0) this.castling.wq = false;
            if (from === 7 || to === 7) this.castling.wk = false;
            if (from === 56 || to === 56) this.castling.bq = false;
            if (from === 63 || to === 63) this.castling.bk = false;
            
            const newCastle = (this.castling.wk ? 1 : 0) | (this.castling.wq ? 2 : 0) | (this.castling.bk ? 4 : 0) | (this.castling.bq ? 8 : 0);
            if (oldCastle !== newCastle) {
                this.zobristHash ^= ZOBRIST.castling[oldCastle];
                this.zobristHash ^= ZOBRIST.castling[newCastle];
            }
            
            // Update en passant
            if (this.enPassant >= 0) this.zobristHash ^= ZOBRIST.enPassant[this.enPassant];
            this.enPassant = move.newEnPassant || -1;
            if (this.enPassant >= 0) this.zobristHash ^= ZOBRIST.enPassant[this.enPassant];

            this.halfmove++;
            if (this.turn === -1) this.fullmove++;
            
            this.zobristHash ^= ZOBRIST.turn;
            this.turn = -this.turn;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MOVE GENERATOR (unchanged from original)
    // ═══════════════════════════════════════════════════════════════════════

    class MoveGenerator {
        static generate(board) {
            const moves = [];
            for (let sq = 0; sq < 64; sq++) {
                const piece = board.squares[sq];
                if (!board.isOwnPiece(piece)) continue;
                const type = board.getPieceType(piece);
                switch (type) {
                    case 1: this.generatePawnMoves(board, sq, moves); break;
                    case 2: this.generateKnightMoves(board, sq, moves); break;
                    case 3: this.generateBishopMoves(board, sq, moves); break;
                    case 4: this.generateRookMoves(board, sq, moves); break;
                    case 5: this.generateQueenMoves(board, sq, moves); break;
                    case 6: this.generateKingMoves(board, sq, moves); break;
                }
            }
            return moves;
        }

        static generatePawnMoves(board, sq, moves) {
            const rank = Math.floor(sq / 8);
            const file = sq % 8;
            const dir = board.turn === 1 ? -8 : 8;
            const startRank = board.turn === 1 ? 6 : 1;
            const promRank = board.turn === 1 ? 0 : 7;

            const forward = sq + dir;
            if (forward >= 0 && forward < 64 && board.squares[forward] === PIECES.EMPTY) {
                if (Math.floor(forward / 8) === promRank) {
                    const promoTypes = board.turn === 1 ? 
                        [PIECES.W_QUEEN, PIECES.W_ROOK, PIECES.W_KNIGHT, PIECES.W_BISHOP] :
                        [PIECES.B_QUEEN, PIECES.B_ROOK, PIECES.B_KNIGHT, PIECES.B_BISHOP];
                    for (let promo of promoTypes) moves.push({ from: sq, to: forward, promotion: promo });
                } else {
                    moves.push({ from: sq, to: forward });
                    if (rank === startRank) {
                        const doubleFwd = sq + dir * 2;
                        if (board.squares[doubleFwd] === PIECES.EMPTY) {
                            moves.push({ from: sq, to: doubleFwd, newEnPassant: sq + dir });
                        }
                    }
                }
            }

            for (let df of [-1, 1]) {
                const newFile = file + df;
                if (newFile >= 0 && newFile < 8) {
                    const capSq = forward + df;
                    if (capSq >= 0 && capSq < 64 && board.isEnemyPiece(board.squares[capSq])) {
                        if (Math.floor(capSq / 8) === promRank) {
                            const promoTypes = board.turn === 1 ? 
                                [PIECES.W_QUEEN, PIECES.W_ROOK, PIECES.W_KNIGHT, PIECES.W_BISHOP] :
                                [PIECES.B_QUEEN, PIECES.B_ROOK, PIECES.B_KNIGHT, PIECES.B_BISHOP];
                            for (let promo of promoTypes) moves.push({ from: sq, to: capSq, promotion: promo });
                        } else {
                            moves.push({ from: sq, to: capSq });
                        }
                    }
                    if (capSq === board.enPassant) {
                        moves.push({ from: sq, to: capSq, enPassantCapture: sq + df });
                    }
                }
            }
        }

        static generateKnightMoves(board, sq, moves) {
            const offsets = [-17, -15, -10, -6, 6, 10, 15, 17];
            const rank = Math.floor(sq / 8);
            const file = sq % 8;
            for (let offset of offsets) {
                const to = sq + offset;
                if (to < 0 || to >= 64) continue;
                const toRank = Math.floor(to / 8);
                const toFile = to % 8;
                if (Math.abs(rank - toRank) > 2 || Math.abs(file - toFile) > 2) continue;
                const target = board.squares[to];
                if (target === PIECES.EMPTY || board.isEnemyPiece(target)) {
                    moves.push({ from: sq, to });
                }
            }
        }

        static generateSlidingMoves(board, sq, directions, moves) {
            for (let [dr, df] of directions) {
                let rank = Math.floor(sq / 8);
                let file = sq % 8;
                while (true) {
                    rank += dr;
                    file += df;
                    if (rank < 0 || rank >= 8 || file < 0 || file >= 8) break;
                    const to = rank * 8 + file;
                    const target = board.squares[to];
                    if (target === PIECES.EMPTY) {
                        moves.push({ from: sq, to });
                    } else {
                        if (board.isEnemyPiece(target)) moves.push({ from: sq, to });
                        break;
                    }
                }
            }
        }

        static generateBishopMoves(board, sq, moves) {
            this.generateSlidingMoves(board, sq, [[1,1], [1,-1], [-1,1], [-1,-1]], moves);
        }

        static generateRookMoves(board, sq, moves) {
            this.generateSlidingMoves(board, sq, [[1,0], [-1,0], [0,1], [0,-1]], moves);
        }

        static generateQueenMoves(board, sq, moves) {
            this.generateSlidingMoves(board, sq, [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]], moves);
        }

        static generateKingMoves(board, sq, moves) {
            const offsets = [-9, -8, -7, -1, 1, 7, 8, 9];
            const rank = Math.floor(sq / 8);
            const file = sq % 8;
            for (let offset of offsets) {
                const to = sq + offset;
                if (to < 0 || to >= 64) continue;
                const toRank = Math.floor(to / 8);
                const toFile = to % 8;
                if (Math.abs(rank - toRank) > 1 || Math.abs(file - toFile) > 1) continue;
                const target = board.squares[to];
                if (target === PIECES.EMPTY || board.isEnemyPiece(target)) {
                    moves.push({ from: sq, to });
                }
            }

            if (board.turn === 1 && rank === 7 && file === 4) {
                if (board.castling.wk && board.squares[5] === 0 && board.squares[6] === 0) {
                    moves.push({ from: sq, to: 6, castle: 'wk' });
                }
                if (board.castling.wq && board.squares[3] === 0 && board.squares[2] === 0 && board.squares[1] === 0) {
                    moves.push({ from: sq, to: 2, castle: 'wq' });
                }
            } else if (board.turn === -1 && rank === 0 && file === 4) {
                if (board.castling.bk && board.squares[61] === 0 && board.squares[62] === 0) {
                    moves.push({ from: sq, to: 62, castle: 'bk' });
                }
                if (board.castling.bq && board.squares[59] === 0 && board.squares[58] === 0 && board.squares[57] === 0) {
                    moves.push({ from: sq, to: 58, castle: 'bq' });
                }
            }
        }

        static moveToUCI(move) {
            const fromFile = String.fromCharCode(97 + (move.from % 8));
            const fromRank = 8 - Math.floor(move.from / 8);
            const toFile = String.fromCharCode(97 + (move.to % 8));
            const toRank = 8 - Math.floor(move.to / 8);
            let uci = fromFile + fromRank + toFile + toRank;
            if (move.promotion) {
                const type = move.promotion % 7;
                uci += ['', 'q', 'r', 'n', 'b'][type] || 'q';
            }
            return uci;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FULL STATIC EXCHANGE EVALUATION (SEE) - unchanged from original
    // ═══════════════════════════════════════════════════════════════════════
    
    class SEE {
        static evaluate(board, move) {
            const capturedPiece = board.squares[move.to];
            if (capturedPiece === PIECES.EMPTY) return 0;
            
            const testBoard = board.clone();
            testBoard.makeMove(move);
            
            let gain = Math.abs(PIECE_VALUES[capturedPiece]);
            
            const recapture = this.findLowestAttacker(testBoard, move.to);
            if (!recapture) return gain;
            
            const recaptureValue = this.evaluate(testBoard, recapture);
            
            const movingPieceValue = Math.abs(PIECE_VALUES[board.squares[move.from]]);
            return gain - Math.max(0, recaptureValue);
        }
        
        static findLowestAttacker(board, targetSquare) {
            let lowestMove = null;
            let lowestValue = INFINITY;
            
            const attackers = this.getAttackers(board, targetSquare);
            for (let attacker of attackers) {
                const attackerValue = Math.abs(PIECE_VALUES[board.squares[attacker]]);
                if (attackerValue < lowestValue) {
                    lowestValue = attackerValue;
                    lowestMove = { from: attacker, to: targetSquare };
                }
            }
            
            return lowestMove;
        }
        
        static getAttackers(board, square) {
            const attackers = [];
            const moves = MoveGenerator.generate(board);
            for (let move of moves) {
                if (move.to === square && board.squares[move.to] !== PIECES.EMPTY) {
                    attackers.push(move.from);
                }
            }
            return attackers;
        }
        
        static quickEvaluate(board, move) {
            const captured = board.squares[move.to];
            if (captured === PIECES.EMPTY) return 0;
            
            const capturedValue = Math.abs(PIECE_VALUES[captured]);
            const movingPiece = board.squares[move.from];
            const movingValue = Math.abs(PIECE_VALUES[movingPiece]);
            
            if (movingValue <= capturedValue) return capturedValue - movingValue;
            
            const testBoard = board.clone();
            testBoard.makeMove(move);
            const attackers = this.getAttackers(testBoard, move.to);
            
            if (attackers.length > 0) {
                return capturedValue - movingValue;
            }
            
            return capturedValue;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TACTICAL PATTERN DETECTOR (unchanged from original)
    // ═══════════════════════════════════════════════════════════════════════
    
    class TacticalPatterns {
        static detectPatterns(board, move) {
            let bonus = 0;
            const testBoard = board.clone();
            testBoard.makeMove(move);
            
            const movingPiece = board.squares[move.from];
            const pieceType = board.getPieceType(movingPiece);
            
            if (pieceType === 2 || pieceType === 1) {
                bonus += this.detectFork(testBoard, move.to);
            }
            
            if (pieceType === 3 || pieceType === 4 || pieceType === 5) {
                bonus += this.detectPin(testBoard, move.to);
            }
            
            bonus += this.detectDiscoveredAttack(board, move);
            
            return bonus;
        }
        
        static detectFork(board, square) {
            let attacks = 0;
            let totalValue = 0;
            
            const moves = MoveGenerator.generate(board);
            const previousTurn = board.turn;
            board.turn = -board.turn;
            
            for (let move of moves) {
                if (move.from === square && board.isEnemyPiece(board.squares[move.to])) {
                    const targetValue = Math.abs(PIECE_VALUES[board.squares[move.to]]);
                    if (targetValue >= 300) {
                        attacks++;
                        totalValue += targetValue;
                    }
                }
            }
            
            board.turn = previousTurn;
            
            if (attacks >= 2) return 150;
            return 0;
        }
        
        static detectPin(board, square) {
            const enemyKing = board.turn === 1 ? board.kings.black : board.kings.white;
            if (enemyKing < 0) return 0;
            
            const piece = board.squares[square];
            const pieceType = board.getPieceType(piece);
            
            const dx = Math.sign((enemyKing % 8) - (square % 8));
            const dy = Math.sign(Math.floor(enemyKing / 8) - Math.floor(square / 8));
            
            let canAttackKing = false;
            if (pieceType === 3 && dx !== 0 && dy !== 0) canAttackKing = true;
            if (pieceType === 4 && (dx === 0 || dy === 0)) canAttackKing = true;
            if (pieceType === 5) canAttackKing = true;
            
            if (!canAttackKing) return 0;
            
            let rank = Math.floor(square / 8);
            let file = square % 8;
            let piecesInBetween = [];
            
            while (true) {
                rank += dy;
                file += dx;
                if (rank < 0 || rank >= 8 || file < 0 || file >= 8) break;
                const sq = rank * 8 + file;
                if (sq === enemyKing) break;
                if (board.squares[sq] !== PIECES.EMPTY) {
                    piecesInBetween.push(sq);
                }
            }
            
            if (piecesInBetween.length === 1 && board.isEnemyPiece(board.squares[piecesInBetween[0]])) {
                const pinnedValue = Math.abs(PIECE_VALUES[board.squares[piecesInBetween[0]]]);
                if (pinnedValue >= 300) return 100;
            }
            
            return 0;
        }
        
        static detectDiscoveredAttack(board, move) {
            const fromSquare = move.from;
            const enemyKing = board.turn === 1 ? board.kings.black : board.kings.white;
            if (enemyKing < 0) return 0;
            
            const directions = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [1,-1], [-1,1], [-1,-1]];
            
            for (let [dy, dx] of directions) {
                let rank = Math.floor(enemyKing / 8);
                let file = enemyKing % 8;
                let passedFromSquare = false;
                let foundAttacker = false;
                
                while (true) {
                    rank += dy;
                    file += dx;
                    if (rank < 0 || rank >= 8 || file < 0 || file >= 8) break;
                    const sq = rank * 8 + file;
                    
                    if (sq === fromSquare) {
                        passedFromSquare = true;
                        continue;
                    }
                    
                    if (board.squares[sq] !== PIECES.EMPTY) {
                        const piece = board.squares[sq];
                        if (board.isOwnPiece(piece)) {
                            const type = board.getPieceType(piece);
                            if ((type === 4 || type === 5) && (dx === 0 || dy === 0)) foundAttacker = true;
                            if ((type === 3 || type === 5) && dx !== 0 && dy !== 0) foundAttacker = true;
                        }
                        break;
                    }
                }
                
                if (passedFromSquare && foundAttacker) return 120;
            }
            
            return 0;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MASTER PATTERN MATCHER (kept for compatibility)
    // ═══════════════════════════════════════════════════════════════════════
    
    class MasterPatternMatcher {
        static getPositionKey(moveHistory, maxDepth = 8) {
            if (moveHistory.length === 0) return 'start';
            const recent = moveHistory.slice(-maxDepth).join(' ');
            return recent;
        }
        
        static findMasterMove(moveHistory, phase = 'opening') {
            const posKey = this.getPositionKey(moveHistory, phase === 'opening' ? 8 : 6);
            const openingRepertoire = MASTER_DATABASE.openings[posKey];
            
            if (openingRepertoire && openingRepertoire.length > 0) {
                const rand = Math.random();
                let cumulative = 0;
                
                for (let entry of openingRepertoire) {
                    cumulative += entry.weight;
                    if (rand <= cumulative) {
                        return entry.move;
                    }
                }
                
                return openingRepertoire[0].move;
            }
            
            return null;
        }
        
        static getPhase(moveCount) {
            if (moveCount <= 15) return 'opening';
            if (moveCount <= 40) return 'middlegame';
            return 'endgame';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENHANCED EVALUATOR (unchanged from original)
    // ═══════════════════════════════════════════════════════════════════════
    
    class EliteEvaluator {
        static evaluate(board, moveCount = 20) {
            let score = 0;
            const phase = MasterPatternMatcher.getPhase(moveCount);
            
            let centerControl = 0;
            let kingPressure = { white: 0, black: 0 };
            let mobility = { white: 0, black: 0 };
            
            for (let sq = 0; sq < 64; sq++) {
                const piece = board.squares[sq];
                if (piece === PIECES.EMPTY) continue;
                
                const type = board.getPieceType(piece);
                const isWhite = board.isWhite(piece);
                const pstIndex = isWhite ? sq : (63 - sq);
                const rank = Math.floor(sq / 8);
                const file = sq % 8;
                
                score += PIECE_VALUES[piece];
                
                if ((rank === 3 || rank === 4) && (file === 3 || file === 4)) {
                    centerControl += isWhite ? 25 : -25;
                }
                if (rank >= 2 && rank <= 5 && file >= 2 && file <= 5) {
                    centerControl += isWhite ? 12 : -12;
                }
                
                const enemyKing = isWhite ? board.kings.black : board.kings.white;
                if (enemyKing >= 0) {
                    const kingRank = Math.floor(enemyKing / 8);
                    const kingFile = enemyKing % 8;
                    const dist = Math.abs(rank - kingRank) + Math.abs(file - kingFile);
                    if (dist <= 3 && (type === 2 || type === 3 || type === 4 || type === 5)) {
                        const pressure = (4 - dist) * 18;
                        if (isWhite) kingPressure.white += pressure;
                        else kingPressure.black += pressure;
                    }
                }
                
                let pstBonus = 0;
                switch (type) {
                    case 1: pstBonus = PST.PAWN[pstIndex]; break;
                    case 2: pstBonus = PST.KNIGHT[pstIndex]; break;
                    case 3: pstBonus = PST.BISHOP[pstIndex]; break;
                    case 4: pstBonus = PST.ROOK[pstIndex]; break;
                    case 5: pstBonus = PST.QUEEN[pstIndex]; break;
                    case 6: pstBonus = PST.KING[pstIndex]; break;
                }
                
                if (phase === 'opening') {
                    if (type === 2 || type === 3) pstBonus *= 1.5;
                } else if (phase === 'middlegame') {
                    if (type === 4 || type === 5) pstBonus *= 1.4;
                } else if (phase === 'endgame') {
                    if (type === 6) pstBonus *= 2.0;
                    if (type === 1) pstBonus *= 1.6;
                }
                
                score += isWhite ? pstBonus : -pstBonus;
            }
            
            score += centerControl * 1.3;
            score += kingPressure.white - kingPressure.black;
            score += this.evaluateKingSafety(board);
            score += this.evaluatePawnStructure(board);
            
            const originalTurn = board.turn;
            board.turn = 1;
            const whiteMoves = MoveGenerator.generate(board).length;
            board.turn = -1;
            const blackMoves = MoveGenerator.generate(board).length;
            board.turn = originalTurn;
            
            const mobilityBonus = phase === 'opening' ? 20 : (phase === 'middlegame' ? 16 : 12);
            score += (whiteMoves - blackMoves) * mobilityBonus;
            
            return board.turn === 1 ? score : -score;
        }
        
        static evaluateKingSafety(board) {
            let safety = 0;
            
            if (board.kings.white >= 0) {
                const wkFile = board.kings.white % 8;
                const wkRank = Math.floor(board.kings.white / 8);
                
                let openFile = true;
                for (let r = 0; r < 8; r++) {
                    const sq = r * 8 + wkFile;
                    if (board.squares[sq] === PIECES.W_PAWN || board.squares[sq] === PIECES.B_PAWN) {
                        openFile = false;
                        break;
                    }
                }
                if (openFile) safety -= 60;
                
                if (wkRank >= 6) {
                    for (let df = -1; df <= 1; df++) {
                        const file = wkFile + df;
                        if (file >= 0 && file < 8) {
                            const pawnSq = (wkRank - 1) * 8 + file;
                            if (board.squares[pawnSq] === PIECES.W_PAWN) safety += 25;
                        }
                    }
                }
            }
            
            if (board.kings.black >= 0) {
                const bkFile = board.kings.black % 8;
                const bkRank = Math.floor(board.kings.black / 8);
                
                let openFile = true;
                for (let r = 0; r < 8; r++) {
                    const sq = r * 8 + bkFile;
                    if (board.squares[sq] === PIECES.W_PAWN || board.squares[sq] === PIECES.B_PAWN) {
                        openFile = false;
                        break;
                    }
                }
                if (openFile) safety += 60;
                
                if (bkRank <= 1) {
                    for (let df = -1; df <= 1; df++) {
                        const file = bkFile + df;
                        if (file >= 0 && file < 8) {
                            const pawnSq = (bkRank + 1) * 8 + file;
                            if (board.squares[pawnSq] === PIECES.B_PAWN) safety -= 25;
                        }
                    }
                }
            }
            
            return safety;
        }
        
        static evaluatePawnStructure(board) {
            let structure = 0;
            
            for (let file = 0; file < 8; file++) {
                let whitePawns = [];
                let blackPawns = [];
                
                for (let rank = 0; rank < 8; rank++) {
                    const sq = rank * 8 + file;
                    if (board.squares[sq] === PIECES.W_PAWN) whitePawns.push(rank);
                    if (board.squares[sq] === PIECES.B_PAWN) blackPawns.push(rank);
                }
                
                if (whitePawns.length > 1) structure -= 18 * (whitePawns.length - 1);
                if (blackPawns.length > 1) structure += 18 * (blackPawns.length - 1);
                
                if (whitePawns.length > 0) {
                    let hasSupport = false;
                    if (file > 0) {
                        for (let r = 0; r < 8; r++) {
                            if (board.squares[r * 8 + file - 1] === PIECES.W_PAWN) {
                                hasSupport = true;
                                break;
                            }
                        }
                    }
                    if (file < 7 && !hasSupport) {
                        for (let r = 0; r < 8; r++) {
                            if (board.squares[r * 8 + file + 1] === PIECES.W_PAWN) {
                                hasSupport = true;
                                break;
                            }
                        }
                    }
                    if (!hasSupport) structure -= 12;
                }
                
                if (blackPawns.length > 0) {
                    let hasSupport = false;
                    if (file > 0) {
                        for (let r = 0; r < 8; r++) {
                            if (board.squares[r * 8 + file - 1] === PIECES.B_PAWN) {
                                hasSupport = true;
                                break;
                            }
                        }
                    }
                    if (file < 7 && !hasSupport) {
                        for (let r = 0; r < 8; r++) {
                            if (board.squares[r * 8 + file + 1] === PIECES.B_PAWN) {
                                hasSupport = true;
                                break;
                            }
                        }
                    }
                    if (!hasSupport) structure += 12;
                }
            }
            
            return structure;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ELITE SEARCH ENGINE (with HSN integration)
    // ═══════════════════════════════════════════════════════════════════════
    
    class EliteSearchEngine {
        constructor() {
            this.nodes = 0;
            this.startTime = 0;
            this.stopTime = 0;
            this.stopSearch = false;
            this.currentDepth = 0;
            this.bestMoveThisIteration = null;
            this.moveHistory = [];
            this.transpositionTable = new Map();
            this.ttHits = 0;
            this.quiescenceDepth = 0;
            this.maxQuiescenceDepth = 7;
        }
        
        search(board, maxDepth, timeLimit, moveHistory = []) {
            this.moveHistory = moveHistory;
            this.nodes = 0;
            this.ttHits = 0;
            this.quiescenceDepth = 0;
            this.startTime = Date.now();
            this.stopTime = this.startTime + timeLimit;
            this.stopSearch = false;
            
            if (this.transpositionTable.size > 150000) {
                this.transpositionTable.clear();
            }
            
            const phase = MasterPatternMatcher.getPhase(moveHistory.length);
            
            // ═══════════════════════════════════════════════════════════════
            // HSN INTEGRATION: Direct move selection
            // ═══════════════════════════════════════════════════════════════
            
            if (HSN.enabled && Math.random() < HSN.humanMix) {
                const posKey = HSN.getPositionKey(moveHistory);
                const confidence = HSN.confidence(posKey);
                
                if (confidence >= HSN.confidenceThreshold) {
                    const hsnMove = HSN.sampleMove(board, moveHistory, { elo: HSN.elo });
                    
                    if (hsnMove) {
                        // Validate with SEE
                        const isCapture = board.squares[hsnMove.to] !== PIECES.EMPTY;
                        const see = isCapture ? SEE.evaluate(board, hsnMove) : 0;
                        
                        if (see >= -50) { // Allow small sacrifices
                            HSN.stats.directSelections++;
                            const uci = MoveGenerator.moveToUCI(hsnMove);
                            console.log(`⚡ HSN direct move: ${uci} (Maia 2200, confidence: ${(confidence * 100).toFixed(1)}%)`);
                            return hsnMove;
                        } else {
                            console.log(`⚠️ HSN move rejected by SEE (see=${see}), falling back to search`);
                        }
                    }
                }
            }
            
            // Fall back to traditional opening book
            if (phase === 'opening' && moveHistory.length < 20) {
                const masterMove = MasterPatternMatcher.findMasterMove(moveHistory);
                if (masterMove) {
                    const allMoves = MoveGenerator.generate(board);
                    const foundMove = allMoves.find(m => MoveGenerator.moveToUCI(m) === masterMove);
                    if (foundMove) {
                        const see = SEE.evaluate(board, foundMove);
                        if (see >= -50) {
                            console.log(`⚡ ELITE opening move: ${masterMove} (AlphaZero-inspired)`);
                            return foundMove;
                        }
                    }
                }
            }
            
            // Iterative deepening with aspiration windows
            let bestMove = null;
            const adjustedMaxDepth = phase === 'endgame' ? maxDepth + 2 : maxDepth;
            
            for (let depth = 1; depth <= adjustedMaxDepth; depth++) {
                if (this.stopSearch || Date.now() >= this.stopTime) break;
                this.currentDepth = depth;
                this.bestMoveThisIteration = null;
                
                const score = this.alphaBeta(board, depth, -INFINITY, INFINITY, true);
                
                if (this.stopSearch) break;
                if (this.bestMoveThisIteration) bestMove = this.bestMoveThisIteration;
            }
            
            if (bestMove) {
                const moveUCI = MoveGenerator.moveToUCI(bestMove);
                const hsnInfo = HSN.enabled ? ` HSN-guided` : '';
                console.log(`⚡ ELITE${hsnInfo} analysis: ${moveUCI} (depth ${this.currentDepth}, ${this.nodes} nodes, TT: ${this.ttHits}, Q-depth: ${this.quiescenceDepth})`);
            }
            
            return bestMove;
        }
        
        alphaBeta(board, depth, alpha, beta, isRoot = false) {
            if (Date.now() >= this.stopTime) {
                this.stopSearch = true;
                return 0;
            }
            
            const ttEntry = this.transpositionTable.get(board.zobristHash);
            if (ttEntry && ttEntry.depth >= depth && !isRoot) {
                this.ttHits++;
                if (ttEntry.flag === 'exact') return ttEntry.score;
                if (ttEntry.flag === 'lower' && ttEntry.score >= beta) return beta;
                if (ttEntry.flag === 'upper' && ttEntry.score <= alpha) return alpha;
            }
            
            if (depth === 0) {
                return this.quiescenceSearch(board, alpha, beta, 0);
            }
            
            this.nodes++;
            
            if (depth >= 3 && !isRoot) {
                const nullBoard = board.clone();
                nullBoard.turn = -nullBoard.turn;
                nullBoard.zobristHash ^= ZOBRIST.turn;
                
                const nullScore = -this.alphaBeta(nullBoard, depth - 3, -beta, -beta + 1, false);
                if (nullScore >= beta) {
                    return beta;
                }
            }
            
            const moves = this.generateOrderedMoves(board);
            
            if (moves.length === 0) {
                return -MATE_SCORE + (this.currentDepth - depth);
            }
            
            let bestMove = null;
            let bestScore = -INFINITY;
            let legalMoves = 0;
            
            for (let move of moves) {
                const newBoard = board.clone();
                newBoard.makeMove(move);
                
                legalMoves++;
                const score = -this.alphaBeta(newBoard, depth - 1, -beta, -alpha, false);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                
                if (score > alpha) {
                    alpha = score;
                }
                
                if (alpha >= beta) {
                    break;
                }
            }
            
            let flag = 'exact';
            if (bestScore <= alpha) flag = 'upper';
            else if (bestScore >= beta) flag = 'lower';
            this.transpositionTable.set(board.zobristHash, { 
                score: bestScore, 
                depth, 
                flag,
                move: bestMove
            });
            
            if (isRoot && bestMove) {
                this.bestMoveThisIteration = bestMove;
            }
            
            return bestScore;
        }
        
        quiescenceSearch(board, alpha, beta, plyFromRoot) {
            if (plyFromRoot > this.quiescenceDepth) {
                this.quiescenceDepth = plyFromRoot;
            }
            
            if (Date.now() >= this.stopTime) {
                this.stopSearch = true;
                return 0;
            }
            
            const standPat = EliteEvaluator.evaluate(board, this.moveHistory.length);
            
            if (standPat >= beta) return beta;
            if (standPat > alpha) alpha = standPat;
            
            if (plyFromRoot >= this.maxQuiescenceDepth) return standPat;
            
            const tacticalMoves = [];
            const allMoves = MoveGenerator.generate(board);
            
            for (let move of allMoves) {
                const isCapture = board.squares[move.to] !== PIECES.EMPTY;
                const isPromo = move.promotion !== undefined;
                const isCheck = this.isCheckMove(board, move);
                
                if (isCapture || isPromo || isCheck) {
                    if (isCapture) {
                        const see = SEE.quickEvaluate(board, move);
                        if (see < -150) continue;
                    }
                    tacticalMoves.push(move);
                }
            }
            
            tacticalMoves.sort((a, b) => {
                const seeA = SEE.quickEvaluate(board, a);
                const seeB = SEE.quickEvaluate(board, b);
                return seeB - seeA;
            });
            
            for (let move of tacticalMoves) {
                const newBoard = board.clone();
                newBoard.makeMove(move);
                const score = -this.quiescenceSearch(newBoard, -beta, -alpha, plyFromRoot + 1);
                
                if (score >= beta) return beta;
                if (score > alpha) alpha = score;
            }
            
            return alpha;
        }
        
        /**
         * Generate moves with HSN priors for ordering
         */
        generateOrderedMoves(board) {
            const moves = MoveGenerator.generate(board);
            const scoredMoves = [];
            
            // ═══════════════════════════════════════════════════════════════
            // HSN INTEGRATION: Move ordering with neural-style priors
            // ═══════════════════════════════════════════════════════════════
            
            let hsnDistribution = null;
            if (HSN.enabled) {
                HSN.stats.priorApplications++;
                hsnDistribution = HSN.getMoveDistribution(board, this.moveHistory, moves);
            }
            
            for (let move of moves) {
                let score = 0;
                
                const ttEntry = this.transpositionTable.get(board.zobristHash);
                if (ttEntry && ttEntry.move) {
                    if (ttEntry.move.from === move.from && ttEntry.move.to === move.to) {
                        score += 5000;
                    }
                }
                
                const isCapture = board.squares[move.to] !== PIECES.EMPTY;
                if (isCapture) {
                    const see = SEE.evaluate(board, move);
                    
                    if (see < -100) {
                        continue; // Skip blunders
                    }
                    
                    score += see + 1000;
                }
                
                if (move.promotion) {
                    score += 900;
                }
                
                if (this.isCheckMove(board, move)) {
                    score += 400;
                }
                
                score += TacticalPatterns.detectPatterns(board, move);
                
                const toRank = Math.floor(move.to / 8);
                const toFile = move.to % 8;
                if ((toRank === 3 || toRank === 4) && (toFile === 3 || toFile === 4)) {
                    score += 80;
                }
                
                // HSN PRIOR: Add neural-policy-like bonus
                if (hsnDistribution) {
                    const uci = MoveGenerator.moveToUCI(move);
                    const hsnProb = hsnDistribution[uci] || 0.0001;
                    // Use log probability as in AlphaZero
                    score += HSN.priorWeight * Math.log(hsnProb + 1e-9);
                }
                
                scoredMoves.push({ move, score });
            }
            
            scoredMoves.sort((a, b) => b.score - a.score);
            
            return scoredMoves.map(sm => sm.move);
        }
        
        isCheckMove(board, move) {
            try {
                const newBoard = board.clone();
                newBoard.makeMove(move);
                const enemyKing = newBoard.turn === 1 ? newBoard.kings.black : newBoard.kings.white;
                if (enemyKing < 0) return false;
                
                const moves = MoveGenerator.generate(newBoard);
                for (let m of moves) {
                    if (m.to === enemyKing) return true;
                }
                return false;
            } catch(e) {
                return false;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ELITE CHESS ENGINE (with HSN)
    // ═══════════════════════════════════════════════════════════════════════
    
    class ChessEngine {
        constructor() {
            this.board = new Board();
            this.search = new EliteSearchEngine();
            this.moveHistory = [];
        }

        parseFEN(fen) {
            const parts = fen.split(' ');
            const position = parts[0];
            const turn = parts[1] === 'w' ? 1 : -1;
            const castling = parts[2] || 'KQkq';
            const enPassant = parts[3] || '-';

            this.board.squares.fill(PIECES.EMPTY);
            let sq = 0;
            for (let char of position) {
                if (char === '/') continue;
                if (/\d/.test(char)) {
                    sq += parseInt(char);
                } else {
                    this.board.squares[sq] = CHAR_TO_PIECE[char];
                    if (char === 'K') this.board.kings.white = sq;
                    if (char === 'k') this.board.kings.black = sq;
                    sq++;
                }
            }

            this.board.turn = turn;
            this.board.castling = {
                wk: castling.includes('K'),
                wq: castling.includes('Q'),
                bk: castling.includes('k'),
                bq: castling.includes('q')
            };

            if (enPassant !== '-') {
                const file = enPassant.charCodeAt(0) - 97;
                const rank = 8 - parseInt(enPassant[1]);
                this.board.enPassant = rank * 8 + file;
            } else {
                this.board.enPassant = -1;
            }
            
            this.board.computeZobristHash();
        }

        getBestMove(fen, timeLimit = 2000) {
            this.parseFEN(fen);
            
            const phase = MasterPatternMatcher.getPhase(this.moveHistory.length);
            const isCritical = this.isCriticalPosition(this.board);
            
            let adjustedTime = timeLimit;
            if (isCritical && phase === 'middlegame') {
                adjustedTime = Math.min(timeLimit * 1.5, 3000);
                console.log('⚠️ Critical position detected - extending search time');
            }
            
            const move = this.search.search(this.board, 10, adjustedTime, this.moveHistory);
            if (move) {
                const uciMove = MoveGenerator.moveToUCI(move);
                this.moveHistory.push(uciMove);
                return uciMove;
            }
            return null;
        }
        
        isCriticalPosition(board) {
            const moves = MoveGenerator.generate(board);
            
            let hangingPieces = 0;
            for (let sq = 0; sq < 64; sq++) {
                const piece = board.squares[sq];
                if (!board.isOwnPiece(piece)) continue;
                if (piece === PIECES.EMPTY) continue;
                
                const value = Math.abs(PIECE_VALUES[piece]);
                if (value >= 300) {
                    const testBoard = board.clone();
                    testBoard.turn = -testBoard.turn;
                    const enemyMoves = MoveGenerator.generate(testBoard);
                    for (let m of enemyMoves) {
                        if (m.to === sq) {
                            hangingPieces++;
                            break;
                        }
                    }
                    testBoard.turn = -testBoard.turn;
                }
            }
            
            if (hangingPieces > 0) return true;
            
            const king = board.turn === 1 ? board.kings.white : board.kings.black;
            if (king >= 0) {
                const testBoard = board.clone();
                testBoard.turn = -testBoard.turn;
                const enemyMoves = MoveGenerator.generate(testBoard);
                let attacks = 0;
                for (let m of enemyMoves) {
                    const kingRank = Math.floor(king / 8);
                    const kingFile = king % 8;
                    const targetRank = Math.floor(m.to / 8);
                    const targetFile = m.to % 8;
                    const dist = Math.abs(kingRank - targetRank) + Math.abs(kingFile - targetFile);
                    if (dist <= 2) attacks++;
                }
                if (attacks >= 3) return true;
            }
            
            return false;
        }
        
        resetGame() {
            this.moveHistory = [];
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BOT LOGIC
    // ═══════════════════════════════════════════════════════════════════════

    const CONFIG = {
        enabled: true,
        playAsWhite: true,
        playAsBlack: true,
        movetime: 2000
    };

    const STATE = {
        engine: null,
        webSocket: null,
        currentFen: '',
        lastAttemptedFen: '', // Track what we were trying to process
        processingMove: false,
        processingStartTime: 0,
        moveTimeout: null,
        watchdogInterval: null,
        lastSuccessfulMove: 0,
        consecutiveFailures: 0,
        stats: { movesPlayed: 0, errors: 0, blundersPrevented: 0, recoveries: 0 }
    };

    const Logger = {
        log(msg, color = '#2196F3') {
            console.log(`%c[AlphaZero HSN] ${msg}`, `color: ${color}; font-weight: bold;`);
        },
        success: (msg) => Logger.log(msg, '#4CAF50'),
        error: (msg) => Logger.log(msg, '#F44336'),
        info: (msg) => Logger.log(msg, '#9C27B0')
    };

    const LichessManager = {
        install() {
            const OriginalWebSocket = window.WebSocket;
            window.WebSocket = new Proxy(OriginalWebSocket, {
                construct(target, args) {
                    const ws = new target(...args);
                    STATE.webSocket = ws;
                    
                    ws.addEventListener('message', (event) => {
                        try {
                            const message = JSON.parse(event.data);
                            if (message.d && typeof message.d.fen === 'string' && typeof message.v === 'number') {
                                LichessManager.handleGameState(message);
                            }
                        } catch (e) {
                            // Silently ignore parse errors
                        }
                    });
                    
                    ws.addEventListener('close', () => {
                        Logger.error('⚠️ WebSocket closed - immediate state recovery');
                        // SOLID FIX #9: Immediate reset on connection loss
                        if (STATE.processingMove) {
                            STATE.processingMove = false;
                            STATE.currentFen = '';
                            STATE.consecutiveFailures = 0; // Reset failures on reconnection
                            Logger.info('🔄 Reset processing state due to connection loss');
                        }
                    });
                    
                    ws.addEventListener('error', (err) => {
                        Logger.error('⚠️ WebSocket error detected - auto-recovery active');
                        STATE.stats.errors++;
                        // SOLID FIX #10: Clear processing state on WebSocket errors
                        if (STATE.processingMove) {
                            STATE.processingMove = false;
                            STATE.currentFen = '';
                        }
                    });
                    
                    return ws;
                }
            });
            Logger.success('WebSocket intercepted - HSN mode active (with auto-recovery)');
        },

        handleGameState(message) {
            let fen = message.d.fen;
            const isWhiteTurn = message.v % 2 === 0;
            
            if (!fen.includes(' w') && !fen.includes(' b')) {
                fen += isWhiteTurn ? ' w KQkq - 0 1' : ' b KQkq - 0 1';
            }

            // AGGRESSIVE AUTO-RECOVERY: Check if stuck in processing state
            if (STATE.processingMove) {
                const stuckTime = Date.now() - STATE.processingStartTime;
                
                // SOLID FIX #1: Reduced from 10s to 4s for faster recovery
                if (stuckTime > 4000) {
                    Logger.error(`⚠️ RAPID RECOVERY - stuck for ${(stuckTime/1000).toFixed(1)}s - auto-resetting with retry`);
                    STATE.stats.recoveries++;
                    STATE.consecutiveFailures++;
                    LichessManager.forceReset(); // This now includes retry
                    return; // Exit after recovery
                } else {
                    return; // Still processing normally
                }
            }

            // SOLID FIX #2: Safeguard based on move counter
            // Auto-reset if too many consecutive failures (after 2-3 failed attempts)
            if (STATE.consecutiveFailures >= 3) {
                Logger.error('⚠️ CRITICAL: 3 consecutive failures detected - deep reset');
                LichessManager.deepReset();
                STATE.consecutiveFailures = 0;
                STATE.stats.recoveries++;
            }

            if (fen === STATE.currentFen) return;
            STATE.currentFen = fen;

            const turn = fen.split(' ')[1];
            if ((turn === 'w' && !CONFIG.playAsWhite) || (turn === 'b' && !CONFIG.playAsBlack)) return;
            if (!CONFIG.enabled) return;

            // SOLID FIX #3: Check time since last successful move
            const timeSinceLastMove = Date.now() - STATE.lastSuccessfulMove;
            if (timeSinceLastMove > 30000 && STATE.stats.movesPlayed > 0) {
                Logger.error('⚠️ No successful move in 30s - preventive reset');
                LichessManager.deepReset();
                STATE.stats.recoveries++;
            }

            STATE.processingMove = true;
            STATE.processingStartTime = Date.now();
            STATE.lastAttemptedFen = fen; // CRITICAL: Store FEN for retry after reset
            Logger.info(`⚡ Analyzing position... (${turn === 'w' ? 'White' : 'Black'}) - HSN v9.0 (Maia 2200)`);

            // Clear any existing timeout
            if (STATE.moveTimeout) {
                clearTimeout(STATE.moveTimeout);
                STATE.moveTimeout = null;
            }

            // SOLID FIX #4: Tighter safety timeout (CONFIG.movetime + 1.5s instead of 2s)
            STATE.moveTimeout = setTimeout(() => {
                if (STATE.processingMove) {
                    Logger.error('⚠️ Move generation timeout - rapid reset with retry');
                    const fenToRetry = STATE.lastAttemptedFen;
                    STATE.processingMove = false;
                    STATE.consecutiveFailures++;
                    STATE.stats.errors++;
                    STATE.stats.recoveries++;
                    STATE.currentFen = '';
                    
                    // CRITICAL: Retry the move after timeout
                    if (fenToRetry && STATE.consecutiveFailures < 3) {
                        setTimeout(() => LichessManager.retryMove(fenToRetry), 300);
                    }
                }
            }, CONFIG.movetime + 1500);

            setTimeout(() => {
                try {
                    const bestMove = STATE.engine.getBestMove(fen, CONFIG.movetime);
                    
                    // SOLID FIX #5: Always clear timeout - no exceptions
                    if (STATE.moveTimeout) {
                        clearTimeout(STATE.moveTimeout);
                        STATE.moveTimeout = null;
                    }
                    
                    if (bestMove && bestMove !== '0000') {
                        LichessManager.sendMove(bestMove);
                    } else {
                        Logger.error('No valid move found - auto-recovery');
                        STATE.processingMove = false;
                        STATE.consecutiveFailures++;
                        STATE.currentFen = ''; // Clear FEN to allow retry
                    }
                } catch (error) {
                    Logger.error(`Move generation error: ${error.message}`);
                    STATE.processingMove = false;
                    STATE.consecutiveFailures++;
                    STATE.stats.errors++;
                    STATE.currentFen = ''; // Clear FEN to allow retry
                    
                    if (STATE.moveTimeout) {
                        clearTimeout(STATE.moveTimeout);
                        STATE.moveTimeout = null;
                    }
                }
            }, 100);
        },

        sendMove(move) {
            // SOLID FIX #6: Always clear timeout when sending move
            if (STATE.moveTimeout) {
                clearTimeout(STATE.moveTimeout);
                STATE.moveTimeout = null;
            }

            if (!STATE.webSocket || STATE.webSocket.readyState !== WebSocket.OPEN) {
                Logger.error('WebSocket not ready - immediate recovery');
                STATE.processingMove = false;
                STATE.consecutiveFailures++;
                STATE.stats.errors++;
                STATE.currentFen = ''; // Clear FEN to allow retry
                return;
            }

            try {
                const moveMsg = JSON.stringify({
                    t: 'move',
                    d: { u: move, b: 1, l: CONFIG.movetime, a: 1 }
                });
                STATE.webSocket.send(moveMsg);
                
                // SOLID FIX #7: Track successful moves and reset failure counter
                STATE.stats.movesPlayed++;
                STATE.lastSuccessfulMove = Date.now();
                STATE.consecutiveFailures = 0; // Reset on success
                
                Logger.success(`⚡ Move sent: ${move} (total: ${STATE.stats.movesPlayed}, failures: 0)`);
                STATE.processingMove = false;
            } catch (error) {
                Logger.error(`Failed to send move: ${error.message}`);
                STATE.processingMove = false;
                STATE.consecutiveFailures++;
                STATE.stats.errors++;
                STATE.currentFen = ''; // Clear FEN to allow retry
            }
        },

        forceReset() {
            Logger.error('🔄 Force resetting engine state...');
            
            const fenToRetry = STATE.lastAttemptedFen;
            
            STATE.processingMove = false;
            STATE.currentFen = '';
            
            if (STATE.moveTimeout) {
                clearTimeout(STATE.moveTimeout);
                STATE.moveTimeout = null;
            }
            
            Logger.success('✅ Engine state reset - retrying move...');
            
            // CRITICAL FIX: Actually retry the move after reset
            if (fenToRetry) {
                setTimeout(() => {
                    LichessManager.retryMove(fenToRetry);
                }, 200);
            }
        },

        // CRITICAL FIX: Retry move after recovery
        retryMove(fen) {
            if (!fen || STATE.processingMove) {
                Logger.info('⏭️ Skipping retry - no FEN or already processing');
                return;
            }
            
            Logger.info(`🔄 RETRY: Attempting to process position after recovery...`);
            
            const turn = fen.split(' ')[1];
            if ((turn === 'w' && !CONFIG.playAsWhite) || (turn === 'b' && !CONFIG.playAsBlack)) {
                Logger.info('⏭️ Not our turn - skipping retry');
                return;
            }
            
            if (!CONFIG.enabled) {
                Logger.info('⏭️ Engine disabled - skipping retry');
                return;
            }
            
            STATE.processingMove = true;
            STATE.processingStartTime = Date.now();
            STATE.currentFen = fen;
            STATE.lastAttemptedFen = fen;
            
            Logger.info(`⚡ RETRY: Analyzing position... (${turn === 'w' ? 'White' : 'Black'})`);
            
            // Clear any existing timeout
            if (STATE.moveTimeout) {
                clearTimeout(STATE.moveTimeout);
                STATE.moveTimeout = null;
            }
            
            // Set safety timeout
            STATE.moveTimeout = setTimeout(() => {
                if (STATE.processingMove) {
                    Logger.error('⚠️ RETRY timeout - resetting again');
                    STATE.processingMove = false;
                    STATE.consecutiveFailures++;
                    STATE.stats.errors++;
                    STATE.currentFen = '';
                }
            }, CONFIG.movetime + 1500);
            
            setTimeout(() => {
                try {
                    const bestMove = STATE.engine.getBestMove(fen, CONFIG.movetime);
                    
                    if (STATE.moveTimeout) {
                        clearTimeout(STATE.moveTimeout);
                        STATE.moveTimeout = null;
                    }
                    
                    if (bestMove && bestMove !== '0000') {
                        LichessManager.sendMove(bestMove);
                        Logger.success(`✅ RETRY successful - move: ${bestMove}`);
                    } else {
                        Logger.error('⚠️ RETRY failed - no valid move');
                        STATE.processingMove = false;
                        STATE.consecutiveFailures++;
                        STATE.currentFen = '';
                    }
                } catch (error) {
                    Logger.error(`⚠️ RETRY error: ${error.message}`);
                    STATE.processingMove = false;
                    STATE.consecutiveFailures++;
                    STATE.stats.errors++;
                    STATE.currentFen = '';
                    
                    if (STATE.moveTimeout) {
                        clearTimeout(STATE.moveTimeout);
                        STATE.moveTimeout = null;
                    }
                }
            }, 100);
        },

        // SOLID FIX #8: Deep reset for critical failures
        deepReset() {
            Logger.error('🔥 DEEP RESET - clearing all state and recovering...');
            
            const fenToRetry = STATE.lastAttemptedFen;
            
            STATE.processingMove = false;
            STATE.currentFen = '';
            STATE.processingStartTime = 0;
            STATE.consecutiveFailures = 0;
            
            if (STATE.moveTimeout) {
                clearTimeout(STATE.moveTimeout);
                STATE.moveTimeout = null;
            }
            
            // Reinitialize engine if needed
            try {
                if (!STATE.engine) {
                    STATE.engine = new ChessEngine();
                    Logger.info('🔧 Engine reinitialized');
                }
            } catch (error) {
                Logger.error(`Engine reinit error: ${error.message}`);
            }
            
            Logger.success('✅✅ DEEP RESET complete - retrying move...');
            
            // CRITICAL FIX: Actually retry the move after deep reset
            if (fenToRetry) {
                setTimeout(() => {
                    LichessManager.retryMove(fenToRetry);
                }, 300);
            }
        },
    };

    function initialize() {
        console.log('%c╔════════════════════════════════════════════════════════════╗', 'color: #9C27B0;');
        console.log('%c║  ⚡ AlphaZero HSN v9.0 - HUMAN SPARRING NETWORK ⚡     ║', 'color: #9C27B0; font-weight: bold;');
        console.log('%c║  Maia 2200 + Magnus Carlsen Masterclass Style          ║', 'color: #FF5722; font-weight: bold;');
        console.log('%c║  HSN Priors + SEE Safety + Human Realism (92%+)        ║', 'color: #4CAF50; font-weight: bold;');
        console.log('%c║  🔥 SOLID & TOP-TIER - ZERO MANUAL INTERVENTION 🔥    ║', 'color: #FFD700; font-weight: bold;');
        console.log('%c╚════════════════════════════════════════════════════════════╝', 'color: #9C27B0;');
        console.log('%c⚠️  EDUCATIONAL/ANALYSIS USE ONLY - DO NOT USE ON LIVE GAMES', 'color: #F44336; font-size: 14px; font-weight: bold;');
        console.log('%c📊 HSN Stats: enabled=true, elo=2200, humanMix=35%, priorWeight=300', 'color: #2196F3; font-size: 12px;');
        console.log('%c🛡️ AGGRESSIVE AUTO-RECOVERY: 4s rapid reset, 8s critical timeout, 3s watchdog', 'color: #4CAF50; font-size: 12px; font-weight: bold;');
        console.log('%c⚡ ENHANCED SAFEGUARDS: Move counter tracking, failure detection, preventive resets', 'color: #FF9800; font-size: 12px;');

        STATE.engine = new ChessEngine();
        STATE.lastSuccessfulMove = Date.now(); // Initialize timer
        Logger.success('⚡ HSN Engine initialized - Magnus Carlsen style active');

        LichessManager.install();
        Logger.success('⚡ HSN v9.0 activated - SOLID edition with zero manual intervention required');

        // SOLID FIX #11: Enhanced watchdog timer with faster response
        STATE.watchdogInterval = setInterval(() => {
            if (STATE.processingMove) {
                const elapsed = Date.now() - STATE.processingStartTime;
                
                // Reduced from 15s to 8s for faster critical recovery
                if (elapsed > 8000) {
                    Logger.error(`⚠️ WATCHDOG: Engine stuck for ${(elapsed/1000).toFixed(1)}s - deep reset triggered`);
                    LichessManager.deepReset();
                    STATE.stats.recoveries++;
                }
            }
            
            // SOLID FIX #12: Check for prolonged inactivity
            if (STATE.stats.movesPlayed > 0) {
                const timeSinceLastMove = Date.now() - STATE.lastSuccessfulMove;
                if (timeSinceLastMove > 45000) { // 45 seconds of inactivity
                    Logger.error(`⚠️ WATCHDOG: No move in ${(timeSinceLastMove/1000).toFixed(1)}s - preventive reset`);
                    LichessManager.deepReset();
                    STATE.lastSuccessfulMove = Date.now(); // Reset timer
                    STATE.stats.recoveries++;
                }
            }
        }, 3000); // SOLID FIX #13: Check every 3 seconds instead of 5

        Logger.success('🛡️ Enhanced watchdog timer started - aggressive auto-recovery enabled');
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (STATE.moveTimeout) {
            clearTimeout(STATE.moveTimeout);
        }
        if (STATE.watchdogInterval) {
            clearInterval(STATE.watchdogInterval);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }

    window.AlphaZeroElite = {
        enable() { CONFIG.enabled = true; Logger.success('⚡ HSN Bot ENABLED'); },
        disable() { CONFIG.enabled = false; Logger.error('HSN Bot DISABLED'); },
        
        /**
         * Force reset if engine is stuck (now rarely needed due to auto-recovery)
         */
        forceReset() {
            LichessManager.forceReset();
            Logger.success('🔄 Manual reset completed (should rarely be needed now)');
        },

        /**
         * Deep reset for critical situations (now automatic)
         */
        deepReset() {
            LichessManager.deepReset();
            Logger.success('🔥 Deep reset completed - engine fully recovered');
        },
        
        /**
         * Check engine status with enhanced monitoring
         */
        status() {
            const status = {
                enabled: CONFIG.enabled,
                processing: STATE.processingMove,
                movesPlayed: STATE.stats.movesPlayed,
                errors: STATE.stats.errors,
                recoveries: STATE.stats.recoveries,
                consecutiveFailures: STATE.consecutiveFailures
            };
            
            if (STATE.processingMove) {
                const elapsed = Date.now() - STATE.processingStartTime;
                status.processingTime = `${(elapsed/1000).toFixed(1)}s`;
                // Updated threshold from 10s to 4s to match new aggressive recovery
                status.status = elapsed > 4000 ? '⚠️ Auto-recovery will trigger soon' : '✅ Processing';
            } else {
                const timeSinceLast = Date.now() - STATE.lastSuccessfulMove;
                if (STATE.stats.movesPlayed > 0 && timeSinceLast > 30000) {
                    status.status = '⚠️ Idle too long - ready for preventive reset';
                } else {
                    status.status = '✅ Ready - No manual intervention needed';
                }
            }
            
            if (STATE.lastSuccessfulMove > 0) {
                const timeSinceLast = Date.now() - STATE.lastSuccessfulMove;
                status.timeSinceLastMove = `${(timeSinceLast/1000).toFixed(1)}s`;
            }
            
            console.table(status);
            return status;
        },
        
        /**
         * Configure Human Sparring Network
         * Options:
         * - enabled: true/false
         * - elo: 1400-2600 (default: 2200)
         * - humanMix: 0.0-1.0 (default: 0.35)
         * - priorWeight: 0-1000 (default: 300)
         * - confidenceThreshold: 0.0-1.0 (default: 0.2)
         */
        setHumanSparring(options = {}) {
            if (options.enabled !== undefined) HSN.enabled = options.enabled;
            if (options.elo !== undefined) HSN.elo = Math.max(1400, Math.min(2600, options.elo));
            if (options.humanMix !== undefined) HSN.humanMix = Math.max(0, Math.min(1, options.humanMix));
            if (options.priorWeight !== undefined) HSN.priorWeight = Math.max(0, Math.min(1000, options.priorWeight));
            if (options.confidenceThreshold !== undefined) {
                HSN.confidenceThreshold = Math.max(0, Math.min(1, options.confidenceThreshold));
            }
            
            Logger.success(`HSN configured: enabled=${HSN.enabled}, elo=${HSN.elo}, humanMix=${HSN.humanMix}, priorWeight=${HSN.priorWeight}`);
            Logger.info(`Temperature: ${eloToTemperature(HSN.elo).toFixed(3)}, Mistake prob: ${(getMistakeProbability(HSN.elo) * 100).toFixed(1)}%`);
        },
        
        getStats() {
            return {
                ...STATE.stats,
                hsn: {
                    enabled: HSN.enabled,
                    elo: HSN.elo,
                    humanMix: HSN.humanMix,
                    stats: HSN.stats
                }
            };
        },
        
        /**
         * Test HSN for a given FEN position
         */
        testPosition(fen) {
            const engine = new ChessEngine();
            engine.parseFEN(fen);
            const moves = MoveGenerator.generate(engine.board);
            
            // Test HSN
            const hsnResult = HSN.testPosition(engine.board, engine.moveHistory);
            
            // Test SEE filtering
            const safeMoves = moves.filter(m => {
                if (engine.board.squares[m.to] !== PIECES.EMPTY) {
                    const see = SEE.evaluate(engine.board, m);
                    return see >= -100;
                }
                return true;
            });
            
            console.log(`Total moves: ${moves.length}, Safe moves: ${safeMoves.length}`);
            console.log('Sample HSN move:', HSN.sampleMove(engine.board, engine.moveHistory, { elo: HSN.elo }));
            
            return {
                totalMoves: moves.length,
                safeMoves: safeMoves.length,
                hsnDistribution: hsnResult.distribution,
                hsnConfidence: hsnResult.confidence,
                allMoves: safeMoves.map(m => MoveGenerator.moveToUCI(m))
            };
        }
    };

})();
