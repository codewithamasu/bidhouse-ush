import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/role.js";
import AuctionController from "./auction.controller.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Auction Management
 *   description: Operations for managing and interacting with auctions.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     AuctionStartRequest:
 *       type: object
 *       properties:
 *         durationMinutes:
 *           type: number
 *           description: Optional duration override (default 30 minutes)
 *           example: 30
 *
 *     AuctionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 5
 *         itemId:
 *           type: number
 *           example: 10
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [DRAFT, RUNNING, ENDED, CANCELED]
 *         currentPrice:
 *           type: string
 *           example: "1500000.00"
 *         highestBidId:
 *           type: number
 *           nullable: true
 *           example: 22
 *
 *     AuctionListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/AuctionResponse'
 *
 *     AuctionWinnerResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Auction ended
 *         winner:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: number
 *               example: 22
 *             amount:
 *               type: string
 *               example: "2000000.00"
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Something went wrong
 */


// admin — start auction
/**
 * @swagger
 * /auctions/{itemId}/start:
 *   post:
 *     summary: Start an auction for a specific item (ADMIN ONLY)
 *     description: |
 *       Initializes a new auction with default duration (30 minutes) unless specified.  
 *       Auction transitions to `RUNNING` state immediately.
 *
 *     tags: [Auction Management]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the item to start auction for
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuctionStartRequest'
 *
 *     responses:
 *       200:
 *         description: Auction successfully started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuctionResponse'
 *
 *       400:
 *         description: Item not found or auction already exists
 *       403:
 *         description: Unauthorized — admin only
 */
router.post("/:itemId/start", authMiddleware, requireRole("ADMIN"), AuctionController.startAuction);

// admin — end auction
/**
 * @swagger
 * /auctions/{itemId}/end:
 *   post:
 *     summary: End an auction and determine the winner (ADMIN ONLY)
 *     description: |
 *       Forces an auction to end.  
 *       The system sets the auction to `ENDED` and returns the highest bid as winner (if any).
 *
 *     tags: [Auction Management]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the item whose auction should be ended
 *
 *     responses:
 *       200:
 *         description: Auction ended successfully, returns winner if exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuctionWinnerResponse'
 *
 *       400:
 *         description: Auction not found or already ended
 *       403:
 *         description: Admin access required
 */
router.post("/:itemId/end", authMiddleware, requireRole("ADMIN"), AuctionController.endAuction);

// public
/**
 * @swagger
 * /auctions:
 *   get:
 *     summary: Get all auctions
 *     description: Returns all auctions with their status and associated items.
 *     tags: [Auction Management]
 *
 *     responses:
 *       200:
 *         description: List of auctions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuctionListResponse'
 */
router.get("/", AuctionController.listAuctions);

/**
 * @swagger
 * /auctions/{itemId}:
 *   get:
 *     summary: Get detailed auction info
 *     description: |
 *       Retrieves auction details, bids, highest bidder, and linked item information.
 *
 *     tags: [Auction Management]
 *
 *     parameters:
 *       - in: path
 *         name: itemId
 *         description: ID of item whose auction details are requested
 *         required: true
 *         schema:
 *           type: integer
 *
 *     responses:
 *       200:
 *         description: Auction details returned successfully
 *       404:
 *         description: Auction not found
 */
router.get("/:itemId", AuctionController.getAuctionDetail);

export default router;
