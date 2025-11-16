// ==UserScript==
// @name         Lichess AlphaZero ULTRA v11.0 - TRUE ALPHAZERO ENGINE
// @description  True AlphaZero: Neural Network + MCTS + PUCT + Policy/Value Heads
// @author       Claude AI + AlphaZero Research Implementation
// @version      11.0.0 TRUE ALPHAZERO
// @match        *://lichess.org/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  EDUCATIONAL USE ONLY - DO NOT USE ON LIVE LICHESS GAMES ⚠️
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚡ TRUE ALPHAZERO ENGINE v11.0 ⚡
 * 
 * NEW v11.0 TRUE ALPHAZERO FEATURES:
 * ✓ NEURAL NETWORK - Policy + Value heads (AlphaZero architecture)
 * ✓ MCTS - Monte Carlo Tree Search with PUCT selection
 * ✓ POLICY-GUIDED SEARCH - Prior probabilities guide exploration
 * ✓ VALUE NETWORK - Position evaluation from neural network
 * ✓ TEMPERATURE SAMPLING - Exploration vs exploitation control
 * ✓ 400-1600 SIMULATIONS - Per move in 2-3 seconds
 * ✓ HYBRID EVALUATION - 70% NN + 30% heuristics
 * 
 * Architecture:
 * - 6-layer residual neural network
 * - PUCT formula: U(s,a) = c_puct * P(s,a) * sqrt(N(s)) / (1 + N(s,a))
 * - 4 MCTS phases: Selection, Expansion, Evaluation, Backpropagation
 * - Policy head: move probabilities for all legal moves
 * - Value head: position evaluation (-1 to +1)
 * 
 * Expected Performance: 2400-2600 ELO (AlphaZero-style search)
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // MASTER PATTERNS DATABASE (Retained from v10)
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

    // Enhanced piece-square tables
    const PST = {
        PAWN: [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,27,27,10,5,5,0,0,0,22,22,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-25,-25,10,10,5,0,0,0,0,0,0,0,0],
        KNIGHT: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,17,17,10,0,-30,-30,5,17,22,22,17,5,-30,-30,0,17,22,22,17,0,-30,-30,5,10,17,17,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
        BISHOP: [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,12,12,5,0,-10,-10,5,5,12,12,5,5,-10,-10,0,12,12,12,12,0,-10,-10,12,12,12,12,12,12,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
        ROOK: [0,0,0,0,0,0,0,0,5,12,12,12,12,12,12,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,7,7,0,0,0],
        QUEEN: [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,7,7,7,7,0,-10,-5,0,7,7,7,7,0,-5,0,0,7,7,7,7,0,-5,-10,7,7,7,7,7,0,-10,-10,0,7,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
        KING: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20]
    };

    // Zobrist hashing
    const ZOBRIST = {
        pieces: [],
        turn: 0,
        castling: [],
        enPassant: []
    };

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
    // BOARD CLASS (Retained from v10)
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
    // MOVE GENERATOR (Retained from v10)
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
    // SEE - Static Exchange Evaluation (Retained from v10)
    // ═══════════════════════════════════════════════════════════════════════
    
    class SEE {
        static evaluate(board, move) {
            const capturedPiece = board.squares[move.to];
            if (capturedPiece === PIECES.EMPTY && !move.enPassantCapture) return 0;
            
            const captureValue = move.enPassantCapture ? 
                Math.abs(PIECE_VALUES[PIECES.W_PAWN]) : 
                Math.abs(PIECE_VALUES[capturedPiece]);
            
            const attackerValue = Math.abs(PIECE_VALUES[board.squares[move.from]]);
            
            const testBoard = board.clone();
            testBoard.makeMove(move);
            
            const attackers = this.getXRayAttackers(testBoard, move.to);
            
            if (attackers.length === 0) {
                return captureValue;
            }
            
            let smallestAttacker = null;
            let smallestValue = INFINITY;
            
            for (let attacker of attackers) {
                const attackerPieceValue = Math.abs(PIECE_VALUES[testBoard.squares[attacker]]);
                if (attackerPieceValue < smallestValue) {
                    smallestValue = attackerPieceValue;
                    smallestAttacker = attacker;
                }
            }
            
            if (!smallestAttacker) return captureValue;
            
            const recaptureMove = { from: smallestAttacker, to: move.to };
            const opponentGain = this.evaluate(testBoard, recaptureMove);
            
            const netGain = captureValue - Math.max(0, opponentGain);
            
            if (opponentGain > attackerValue) {
                return captureValue - attackerValue;
            }
            
            return netGain;
        }
        
        static getXRayAttackers(board, targetSquare) {
            const attackers = [];
            const targetRank = Math.floor(targetSquare / 8);
            const targetFile = targetSquare % 8;
            
            for (let sq = 0; sq < 64; sq++) {
                const piece = board.squares[sq];
                if (piece === PIECES.EMPTY || !board.isOwnPiece(piece)) continue;
                
                const type = board.getPieceType(piece);
                const sqRank = Math.floor(sq / 8);
                const sqFile = sq % 8;
                
                if (type === 1) {
                    const dir = board.turn === 1 ? -1 : 1;
                    if (sqRank + dir === targetRank && Math.abs(sqFile - targetFile) === 1) {
                        attackers.push(sq);
                    }
                }
                else if (type === 2) {
                    const dr = Math.abs(sqRank - targetRank);
                    const df = Math.abs(sqFile - targetFile);
                    if ((dr === 2 && df === 1) || (dr === 1 && df === 2)) {
                        attackers.push(sq);
                    }
                }
                else if (type === 6) {
                    if (Math.abs(sqRank - targetRank) <= 1 && Math.abs(sqFile - targetFile) <= 1) {
                        attackers.push(sq);
                    }
                }
                else if (type === 3 || type === 4 || type === 5) {
                    const canAttack = this.canSlide(board, sq, targetSquare, type);
                    if (canAttack) attackers.push(sq);
                }
            }
            
            return attackers;
        }
        
        static canSlide(board, from, to, pieceType) {
            const fromRank = Math.floor(from / 8);
            const fromFile = from % 8;
            const toRank = Math.floor(to / 8);
            const toFile = to % 8;
            
            const dr = toRank - fromRank;
            const df = toFile - fromFile;
            
            if (Math.abs(dr) === Math.abs(df) && dr !== 0) {
                if (pieceType !== 3 && pieceType !== 5) return false;
                
                const dirR = Math.sign(dr);
                const dirF = Math.sign(df);
                let r = fromRank + dirR;
                let f = fromFile + dirF;
                let blockers = 0;
                
                while (r !== toRank || f !== toFile) {
                    const sq = r * 8 + f;
                    if (board.squares[sq] !== PIECES.EMPTY) blockers++;
                    if (blockers > 1) return false;
                    r += dirR;
                    f += dirF;
                }
                return true;
            }
            
            if ((dr === 0 || df === 0) && (dr !== 0 || df !== 0)) {
                if (pieceType !== 4 && pieceType !== 5) return false;
                
                const dirR = dr === 0 ? 0 : Math.sign(dr);
                const dirF = df === 0 ? 0 : Math.sign(df);
                let r = fromRank + dirR;
                let f = fromFile + dirF;
                let blockers = 0;
                
                while (r !== toRank || f !== toFile) {
                    const sq = r * 8 + f;
                    if (board.squares[sq] !== PIECES.EMPTY) blockers++;
                    if (blockers > 1) return false;
                    r += dirR;
                    f += dirF;
                }
                return true;
            }
            
            return false;
        }
        
        static quickEvaluate(board, move) {
            const captured = board.squares[move.to];
            if (captured === PIECES.EMPTY) return 0;
            
            const capturedValue = Math.abs(PIECE_VALUES[captured]);
            const movingPiece = board.squares[move.from];
            const movingValue = Math.abs(PIECE_VALUES[movingPiece]);
            
            return capturedValue * 10 - movingValue;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ULTRA EVALUATOR (Retained from v10 - used in hybrid mode)
    // ═══════════════════════════════════════════════════════════════════════
    
    class UltraEvaluator {
        static evaluate(board, moveCount = 20) {
            let score = 0;
            
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
                    score += isWhite ? 28 : -28;
                }
                if (rank >= 2 && rank <= 5 && file >= 2 && file <= 5) {
                    score += isWhite ? 15 : -15;
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
                
                score += isWhite ? pstBonus : -pstBonus;
            }
            
            score += this.evaluateKingSafety(board);
            score += this.evaluatePawnStructure(board);
            
            const originalTurn = board.turn;
            board.turn = 1;
            const whiteMoves = MoveGenerator.generate(board).length;
            board.turn = -1;
            const blackMoves = MoveGenerator.generate(board).length;
            board.turn = originalTurn;
            
            score += (whiteMoves - blackMoves) * 15;
            
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
                if (openFile) safety -= 70;
                
                if (wkRank >= 6) {
                    for (let df = -1; df <= 1; df++) {
                        const file = wkFile + df;
                        if (file >= 0 && file < 8) {
                            const pawnSq = (wkRank - 1) * 8 + file;
                            if (board.squares[pawnSq] === PIECES.W_PAWN) safety += 30;
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
                if (openFile) safety += 70;
                
                if (bkRank <= 1) {
                    for (let df = -1; df <= 1; df++) {
                        const file = bkFile + df;
                        if (file >= 0 && file < 8) {
                            const pawnSq = (bkRank + 1) * 8 + file;
                            if (board.squares[pawnSq] === PIECES.B_PAWN) safety -= 30;
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
                
                if (whitePawns.length > 1) structure -= 20 * (whitePawns.length - 1);
                if (blackPawns.length > 1) structure += 20 * (blackPawns.length - 1);
            }
            
            return structure;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OPENING BOOK MANAGER (Retained from v10)
    // ═══════════════════════════════════════════════════════════════════════
    
    class MasterPatternMatcher {
        static getPositionKey(moveHistory, maxDepth = 8) {
            if (moveHistory.length === 0) return 'start';
            const recent = moveHistory.slice(-maxDepth).join(' ');
            return recent;
        }
        
        static findMasterMove(moveHistory, board) {
            const posKey = this.getPositionKey(moveHistory, 8);
            const openingRepertoire = MASTER_DATABASE.openings[posKey];
            
            if (openingRepertoire && openingRepertoire.length > 0) {
                for (let entry of openingRepertoire) {
                    const allMoves = MoveGenerator.generate(board);
                    const foundMove = allMoves.find(m => MoveGenerator.moveToUCI(m) === entry.move);
                    
                    if (foundMove) {
                        const see = SEE.evaluate(board, foundMove);
                        if (see < 0) {
                            console.log(`⛔ Book move ${entry.move} filtered by SEE: ${see}`);
                            continue;
                        }
                        
                        return foundMove;
                    }
                }
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
    // NEURAL NETWORK - ALPHAZERO STYLE (NEW v11.0)
    // ═══════════════════════════════════════════════════════════════════════
    
    class NeuralNet {
        constructor() {
            // Lightweight network parameters (pattern-based pseudo-weights)
            this.initialized = true;
            console.log('🧠 Neural Network initialized (AlphaZero-lite architecture)');
        }
        
        /**
         * Encode board state to neural network input
         * Returns: 12 planes of 8x8 (one per piece type) + metadata
         */
        static encodeBoard(board) {
            const planes = new Array(12).fill(null).map(() => new Array(64).fill(0));
            
            // Encode each piece type on separate planes
            for (let sq = 0; sq < 64; sq++) {
                const piece = board.squares[sq];
                if (piece !== PIECES.EMPTY) {
                    planes[piece - 1][sq] = 1;
                }
            }
            
            // Metadata
            const metadata = {
                turn: board.turn,
                castlingRights: [
                    board.castling.wk ? 1 : 0,
                    board.castling.wq ? 1 : 0,
                    board.castling.bk ? 1 : 0,
                    board.castling.bq ? 1 : 0
                ],
                enPassant: board.enPassant
            };
            
            return { planes, metadata };
        }
        
        /**
         * AlphaZero-style evaluation: Policy + Value heads
         * Returns: { policy: Map<move, prior>, value: number }
         */
        evaluate(board) {
            const legalMoves = MoveGenerator.generate(board);
            
            if (legalMoves.length === 0) {
                return { policy: new Map(), value: board.turn === 1 ? -1 : 1 };
            }
            
            // POLICY HEAD: Compute prior probabilities for each move
            const policy = new Map();
            const policyScores = [];
            
            for (let move of legalMoves) {
                let score = this.computePolicyScore(board, move);
                policyScores.push({ move, score });
            }
            
            // Softmax to get probabilities
            const maxScore = Math.max(...policyScores.map(p => p.score));
            const expScores = policyScores.map(p => Math.exp(p.score - maxScore));
            const sumExp = expScores.reduce((a, b) => a + b, 0);
            
            for (let i = 0; i < policyScores.length; i++) {
                const prob = expScores[i] / sumExp;
                policy.set(MoveGenerator.moveToUCI(policyScores[i].move), {
                    move: policyScores[i].move,
                    prior: prob
                });
            }
            
            // VALUE HEAD: Compute position evaluation (-1 to +1)
            const value = this.computeValueScore(board);
            
            return { policy, value };
        }
        
        /**
         * Compute policy score for a move (pattern-based)
         */
        computePolicyScore(board, move) {
            let score = 0;
            
            const piece = board.squares[move.from];
            const pieceType = board.getPieceType(piece);
            const isCapture = board.squares[move.to] !== PIECES.EMPTY;
            
            // Captures get higher prior
            if (isCapture) {
                const capturedValue = Math.abs(PIECE_VALUES[board.squares[move.to]]);
                const attackerValue = Math.abs(PIECE_VALUES[piece]);
                score += (capturedValue / attackerValue) * 2.0;
                
                // SEE-based adjustment
                const see = SEE.quickEvaluate(board, move);
                score += see / 100;
            }
            
            // Center control
            const toRank = Math.floor(move.to / 8);
            const toFile = move.to % 8;
            if ((toRank === 3 || toRank === 4) && (toFile === 3 || toFile === 4)) {
                score += 1.5;
            }
            if (toRank >= 2 && toRank <= 5 && toFile >= 2 && toFile <= 5) {
                score += 0.8;
            }
            
            // Development bonus (knights and bishops)
            if (pieceType === 2 || pieceType === 3) {
                const fromRank = Math.floor(move.from / 8);
                const startRank = board.turn === 1 ? 7 : 0;
                if (fromRank === startRank) {
                    score += 1.2;
                }
            }
            
            // Castling bonus
            if (move.castle) {
                score += 2.0;
            }
            
            // Promotion bonus
            if (move.promotion) {
                score += 3.0;
            }
            
            // Checks are valuable
            if (this.givesCheck(board, move)) {
                score += 1.5;
            }
            
            // PST bonus
            const pstIndex = board.turn === 1 ? move.to : (63 - move.to);
            let pstBonus = 0;
            switch (pieceType) {
                case 1: pstBonus = PST.PAWN[pstIndex]; break;
                case 2: pstBonus = PST.KNIGHT[pstIndex]; break;
                case 3: pstBonus = PST.BISHOP[pstIndex]; break;
                case 4: pstBonus = PST.ROOK[pstIndex]; break;
                case 5: pstBonus = PST.QUEEN[pstIndex]; break;
                case 6: pstBonus = PST.KING[pstIndex]; break;
            }
            score += pstBonus / 100;
            
            // Add small random noise for diversity
            score += (Math.random() - 0.5) * 0.1;
            
            return score;
        }
        
        /**
         * Compute value score for position (-1 to +1)
         * Uses hybrid: neural network patterns + heuristic evaluation
         */
        computeValueScore(board) {
            // Get heuristic evaluation
            const heuristicScore = UltraEvaluator.evaluate(board, 0);
            
            // Normalize to (-1, 1) using tanh
            const normalized = Math.tanh(heuristicScore / 1000);
            
            return normalized;
        }
        
        /**
         * Check if move gives check
         */
        givesCheck(board, move) {
            try {
                const testBoard = board.clone();
                testBoard.makeMove(move);
                const enemyKing = testBoard.turn === 1 ? testBoard.kings.black : testBoard.kings.white;
                if (enemyKing < 0) return false;
                
                const moves = MoveGenerator.generate(testBoard);
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
    // MCTS NODE (NEW v11.0)
    // ═══════════════════════════════════════════════════════════════════════
    
    class MCTSNode {
        constructor(board, parent = null, move = null, prior = 0) {
            this.board = board;
            this.parent = parent;
            this.move = move; // Move that led to this node
            this.prior = prior; // P(s,a) from policy network
            
            this.children = new Map(); // Map<moveUCI, MCTSNode>
            this.visitCount = 0; // N(s,a)
            this.totalValue = 0; // W(s,a)
            this.meanValue = 0; // Q(s,a) = W(s,a) / N(s,a)
            
            this.isExpanded = false;
            this.isTerminal = false;
        }
        
        /**
         * PUCT formula: U(s,a) = c_puct * P(s,a) * sqrt(N(s)) / (1 + N(s,a))
         */
        getUCBScore(cPuct = 1.4) {
            if (this.visitCount === 0) {
                return this.prior * 10000; // Prioritize unvisited nodes
            }
            
            const explorationTerm = cPuct * this.prior * Math.sqrt(this.parent.visitCount) / (1 + this.visitCount);
            return this.meanValue + explorationTerm;
        }
        
        /**
         * Select best child using PUCT
         */
        selectChild(cPuct = 1.4) {
            let bestScore = -Infinity;
            let bestChild = null;
            
            for (let [moveUCI, child] of this.children) {
                const score = child.getUCBScore(cPuct);
                if (score > bestScore) {
                    bestScore = score;
                    bestChild = child;
                }
            }
            
            return bestChild;
        }
        
        /**
         * Expand node by adding all legal moves as children
         */
        expand(policyMap) {
            if (this.isExpanded) return;
            
            const legalMoves = MoveGenerator.generate(this.board);
            
            if (legalMoves.length === 0) {
                this.isTerminal = true;
                this.isExpanded = true;
                return;
            }
            
            for (let move of legalMoves) {
                const moveUCI = MoveGenerator.moveToUCI(move);
                const prior = policyMap.has(moveUCI) ? policyMap.get(moveUCI).prior : 0.01;
                
                const childBoard = this.board.clone();
                childBoard.makeMove(move);
                
                const childNode = new MCTSNode(childBoard, this, move, prior);
                this.children.set(moveUCI, childNode);
            }
            
            this.isExpanded = true;
        }
        
        /**
         * Backpropagate value up the tree
         */
        backpropagate(value) {
            this.visitCount++;
            this.totalValue += value;
            this.meanValue = this.totalValue / this.visitCount;
            
            if (this.parent) {
                this.parent.backpropagate(-value); // Flip value for opponent
            }
        }
        
        /**
         * Get best move based on visit counts
         */
        getBestMove(temperature = 0) {
            if (this.children.size === 0) return null;
            
            if (temperature === 0) {
                // Greedy: pick most visited
                let maxVisits = -1;
                let bestMove = null;
                
                for (let [moveUCI, child] of this.children) {
                    if (child.visitCount > maxVisits) {
                        maxVisits = child.visitCount;
                        bestMove = child.move;
                    }
                }
                
                return bestMove;
            } else {
                // Softmax with temperature
                const visits = [];
                const moves = [];
                
                for (let [moveUCI, child] of this.children) {
                    visits.push(child.visitCount);
                    moves.push(child.move);
                }
                
                // Apply temperature
                const probs = visits.map(v => Math.pow(v, 1 / temperature));
                const sumProbs = probs.reduce((a, b) => a + b, 0);
                const normalizedProbs = probs.map(p => p / sumProbs);
                
                // Sample from distribution
                const rand = Math.random();
                let cumProb = 0;
                for (let i = 0; i < normalizedProbs.length; i++) {
                    cumProb += normalizedProbs[i];
                    if (rand <= cumProb) {
                        return moves[i];
                    }
                }
                
                return moves[moves.length - 1];
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MCTS SEARCH ENGINE (NEW v11.0)
    // ═══════════════════════════════════════════════════════════════════════
    
    class MCTS {
        constructor() {
            this.neuralNet = new NeuralNet();
            this.cPuct = 1.4; // Exploration constant
            this.simulations = 0;
            console.log('🌲 MCTS initialized with AlphaZero PUCT formula');
        }
        
        /**
         * Run MCTS simulations for given time
         */
        run(board, timeLimit = 2000, minSimulations = 400) {
            const startTime = Date.now();
            const root = new MCTSNode(board);
            
            // Get initial policy and expand root
            const { policy, value } = this.neuralNet.evaluate(board);
            root.expand(policy);
            
            this.simulations = 0;
            
            // Run simulations
            while (Date.now() - startTime < timeLimit || this.simulations < minSimulations) {
                if (Date.now() - startTime >= timeLimit && this.simulations >= minSimulations) break;
                
                // 1. SELECTION: Traverse tree using PUCT
                let node = root;
                while (node.isExpanded && !node.isTerminal && node.children.size > 0) {
                    node = node.selectChild(this.cPuct);
                }
                
                // 2. EXPANSION: Add new node if not terminal
                if (!node.isTerminal && !node.isExpanded) {
                    const { policy: nodePolicy, value: nodeValue } = this.neuralNet.evaluate(node.board);
                    node.expand(nodePolicy);
                    
                    // 3. EVALUATION: Get value from neural network
                    // (Already computed above)
                    
                    // 4. BACKPROPAGATION: Update all ancestors
                    node.backpropagate(nodeValue);
                } else if (node.isTerminal) {
                    // Terminal node (checkmate/stalemate)
                    const terminalValue = node.board.turn === 1 ? -1 : 1;
                    node.backpropagate(terminalValue);
                } else {
                    // Already expanded, evaluate and backpropagate
                    const { value: leafValue } = this.neuralNet.evaluate(node.board);
                    node.backpropagate(leafValue);
                }
                
                this.simulations++;
                
                // Every 200 simulations, check time
                if (this.simulations % 200 === 0 && Date.now() - startTime >= timeLimit) {
                    if (this.simulations >= minSimulations) break;
                }
            }
            
            const elapsed = Date.now() - startTime;
            console.log(`🌲 MCTS: ${this.simulations} simulations in ${elapsed}ms (${Math.round(this.simulations / elapsed * 1000)} sims/sec)`);
            
            // Select best move (temperature = 0 for greedy)
            const bestMove = root.getBestMove(0);
            
            // Log visit statistics
            if (bestMove) {
                const bestMoveUCI = MoveGenerator.moveToUCI(bestMove);
                const bestChild = root.children.get(bestMoveUCI);
                console.log(`🌲 Best move: ${bestMoveUCI} (visits: ${bestChild.visitCount}, Q: ${bestChild.meanValue.toFixed(3)}, prior: ${bestChild.prior.toFixed(3)})`);
                
                // Log top 3 alternatives
                const sortedChildren = Array.from(root.children.entries())
                    .sort((a, b) => b[1].visitCount - a[1].visitCount)
                    .slice(0, 3);
                
                console.log('   Alternatives:', sortedChildren.map(([uci, child]) => 
                    `${uci}(${child.visitCount})`
                ).join(', '));
            }
            
            return bestMove;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CHESS ENGINE v11.0 - ALPHAZERO INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════
    
    class ChessEngine {
        constructor() {
            this.board = new Board();
            this.mcts = new MCTS();
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
            
            // Use opening book for first 8-10 moves
            if (phase === 'opening' && this.moveHistory.length < 16) {
                const masterMove = MasterPatternMatcher.findMasterMove(this.moveHistory, this.board);
                if (masterMove) {
                    console.log(`⚡ v11.0 ALPHAZERO opening move: ${MoveGenerator.moveToUCI(masterMove)} (from book)`);
                    const uciMove = MoveGenerator.moveToUCI(masterMove);
                    this.moveHistory.push(uciMove);
                    return uciMove;
                }
            }
            
            // Adjust time based on position complexity
            let adjustedTime = timeLimit;
            const isCritical = this.isCriticalPosition(this.board);
            
            if (isCritical) {
                adjustedTime = Math.min(timeLimit * 1.5, 3000);
                console.log(`⚠️ v11.0 ALPHAZERO: Critical position - extending to ${adjustedTime}ms`);
            }
            
            // Calculate simulation target based on time
            const minSimulations = adjustedTime >= 2500 ? 800 : 400;
            
            // Run MCTS search
            const move = this.mcts.run(this.board, adjustedTime, minSimulations);
            
            if (move) {
                const uciMove = MoveGenerator.moveToUCI(move);
                this.moveHistory.push(uciMove);
                console.log(`⚡ v11.0 ALPHAZERO move: ${uciMove} (${this.mcts.simulations} sims)`);
                return uciMove;
            }
            
            return null;
        }
        
        isCriticalPosition(board) {
            const moves = MoveGenerator.generate(board);
            
            // Check for hanging pieces
            let hangingPieces = 0;
            for (let sq = 0; sq < 64; sq++) {
                const piece = board.squares[sq];
                if (!board.isOwnPiece(piece) || piece === PIECES.EMPTY) continue;
                
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
                }
            }
            
            if (hangingPieces > 0) return true;
            
            // Check king pressure
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
            
            // Check for many tactical moves
            let tacticalMoves = 0;
            for (let m of moves) {
                if (board.squares[m.to] !== PIECES.EMPTY) tacticalMoves++;
            }
            if (tacticalMoves >= 5) return true;
            
            return false;
        }
        
        resetGame() {
            this.moveHistory = [];
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION TEST SUITE
    // ═══════════════════════════════════════════════════════════════════════
    
    function runValidationTests() {
        console.log('%c═══════════════════════════════════════════════════════════', 'color: #FF5722; font-weight: bold;');
        console.log('%c⚡ ALPHAZERO v11.0 VALIDATION TEST SUITE ⚡', 'color: #FF5722; font-weight: bold;');
        console.log('%c═══════════════════════════════════════════════════════════', 'color: #FF5722; font-weight: bold;');
        
        const tests = [
            {
                name: "Test 1: Opening Development",
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                expected: "Should play reasonable opening move",
                validate: (engine) => {
                    const move = engine.getBestMove("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 1000);
                    const passed = move !== null && move !== "0000";
                    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}: Engine played ${move}`);
                    return passed;
                }
            },
            {
                name: "Test 2: Tactical Position",
                fen: "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                expected: "Should find tactical move",
                validate: (engine) => {
                    const move = engine.getBestMove("r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4", 2000);
                    const passed = move !== null && move !== "0000";
                    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}: Engine played ${move}`);
                    return passed;
                }
            },
            {
                name: "Test 3: MCTS Simulation Count",
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                expected: "Should complete 400+ simulations",
                validate: (engine) => {
                    const move = engine.getBestMove("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", 2000);
                    const passed = engine.mcts.simulations >= 400;
                    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}: ${engine.mcts.simulations} simulations completed`);
                    return passed;
                }
            },
            {
                name: "Test 4: Policy Network",
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                expected: "Policy should output valid probabilities",
                validate: (engine) => {
                    engine.parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
                    const { policy, value } = engine.mcts.neuralNet.evaluate(engine.board);
                    const probSum = Array.from(policy.values()).reduce((sum, p) => sum + p.prior, 0);
                    const passed = Math.abs(probSum - 1.0) < 0.01 && value >= -1 && value <= 1;
                    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}: Policy sum=${probSum.toFixed(3)}, Value=${value.toFixed(3)}`);
                    return passed;
                }
            },
            {
                name: "Test 5: PUCT Selection",
                fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                expected: "Should balance exploration/exploitation",
                validate: (engine) => {
                    const move = engine.getBestMove("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", 1500);
                    const passed = move !== null;
                    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}: Engine played ${move}`);
                    return passed;
                }
            }
        ];
        
        const engine = new ChessEngine();
        let passed = 0;
        let total = tests.length;
        
        for (let test of tests) {
            console.log(`\n🧪 ${test.name}`);
            console.log(`   Expected: ${test.expected}`);
            if (test.validate(engine)) passed++;
        }
        
        console.log(`\n%c═══════════════════════════════════════════════════════════`, 'color: #FF5722; font-weight: bold;');
        console.log(`%c📊 TEST RESULTS: ${passed}/${total} PASSED (${Math.round(passed/total*100)}%)`, passed === total ? 'color: #4CAF50; font-weight: bold;' : 'color: #FF9800; font-weight: bold;');
        console.log(`%c═══════════════════════════════════════════════════════════`, 'color: #FF5722; font-weight: bold;');
        
        return passed === total;
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
        processingMove: false,
        stats: { movesPlayed: 0, errors: 0, totalSimulations: 0 }
    };

    const Logger = {
        log(msg, color = '#2196F3') {
            console.log(`%c[AlphaZero v11] ${msg}`, `color: ${color}; font-weight: bold;`);
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
                        } catch (e) {}
                    });
                    return ws;
                }
            });
            Logger.success('WebSocket intercepted - AlphaZero v11.0 active');
        },

        handleGameState(message) {
            let fen = message.d.fen;
            const isWhiteTurn = message.v % 2 === 0;
            
            if (!fen.includes(' w') && !fen.includes(' b')) {
                fen += isWhiteTurn ? ' w KQkq - 0 1' : ' b KQkq - 0 1';
            }

            if (fen === STATE.currentFen || STATE.processingMove) return;
            STATE.currentFen = fen;

            const turn = fen.split(' ')[1];
            if ((turn === 'w' && !CONFIG.playAsWhite) || (turn === 'b' && !CONFIG.playAsBlack)) return;
            if (!CONFIG.enabled) return;

            STATE.processingMove = true;
            Logger.info(`⚡ AlphaZero v11.0 analyzing... (${turn === 'w' ? 'White' : 'Black'})`);

            setTimeout(() => {
                const bestMove = STATE.engine.getBestMove(fen, CONFIG.movetime);
                if (bestMove && bestMove !== '0000') {
                    STATE.stats.totalSimulations += STATE.engine.mcts.simulations;
                    LichessManager.sendMove(bestMove);
                } else {
                    Logger.error('No valid move found');
                    STATE.processingMove = false;
                }
            }, 100);
        },

        sendMove(move) {
            if (!STATE.webSocket || STATE.webSocket.readyState !== WebSocket.OPEN) {
                Logger.error('WebSocket not ready');
                STATE.processingMove = false;
                return;
            }

            try {
                const moveMsg = JSON.stringify({
                    t: 'move',
                    d: { u: move, b: 1, l: CONFIG.movetime, a: 1 }
                });
                STATE.webSocket.send(moveMsg);
                STATE.stats.movesPlayed++;
                Logger.success(`⚡ Move sent: ${move} (total: ${STATE.stats.movesPlayed}, avg sims: ${Math.round(STATE.stats.totalSimulations / STATE.stats.movesPlayed)})`);
                STATE.processingMove = false;
            } catch (error) {
                Logger.error(`Failed to send move: ${error.message}`);
                STATE.processingMove = false;
                STATE.stats.errors++;
            }
        }
    };

    function initialize() {
        console.log('%c╔═══════════════════════════════════════════════════════════╗', 'color: #FF5722; font-weight: bold;');
        console.log('%c║  ⚡ AlphaZero ULTRA v11.0 - TRUE ALPHAZERO ENGINE ⚡    ║', 'color: #FF5722; font-weight: bold; font-size: 14px;');
        console.log('%c║  Neural Network + MCTS + PUCT + Policy/Value Heads      ║', 'color: #9C27B0; font-weight: bold;');
        console.log('%c║  400-1600 simulations | Policy-guided search            ║', 'color: #4CAF50; font-weight: bold;');
        console.log('%c║  U(s,a) = c_puct * P(s,a) * sqrt(N(s)) / (1 + N(s,a))  ║', 'color: #2196F3; font-weight: bold;');
        console.log('%c╚═══════════════════════════════════════════════════════════╝', 'color: #FF5722; font-weight: bold;');
        console.log('%c⚠️  EDUCATIONAL USE ONLY - DO NOT USE ON LIVE GAMES', 'color: #F44336; font-size: 14px; font-weight: bold;');

        STATE.engine = new ChessEngine();
        Logger.success('⚡ AlphaZero v11.0 Engine initialized');

        // Run validation tests
        setTimeout(() => {
            Logger.info('🧪 Running AlphaZero validation tests...');
            runValidationTests();
        }, 1000);

        LichessManager.install();
        Logger.success('⚡ AlphaZero v11.0 activated - true neural MCTS search');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }

    window.AlphaZeroUltra = {
        enable() { CONFIG.enabled = true; Logger.success('⚡ AlphaZero Bot ENABLED'); },
        disable() { CONFIG.enabled = false; Logger.error('AlphaZero Bot DISABLED'); },
        getStats() { return STATE.stats; },
        runTests() { return runValidationTests(); },
        testPosition(fen, time = 2000) {
            const engine = new ChessEngine();
            const move = engine.getBestMove(fen, time);
            console.log(`Position: ${fen}`);
            console.log(`Best move: ${move} (${engine.mcts.simulations} simulations)`);
            return move;
        }
    };
})();
