import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.js";
import BidController from "./bid.controller.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Bidding
 *   description: User bidding operations and bid history retrieval.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     BidRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: string
 *           description: Bid amount in decimal format (must be higher than currentPrice)
 *           example: "2000000.00"
 *
 *     BidResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 15
 *         amount:
 *           type: string
 *           example: "2500000.00"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         userId:
 *           type: number
 *           example: 5
 *         auctionId:
 *           type: number
 *           example: 10
 *
 *     BidHistoryEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 15
 *         amount:
 *           type: string
 *           example: "2600000.00"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *             email:
 *               type: string
 *               example: bidder@mail.com
 *             name:
 *               type: string
 *               example: Bidder User
 *
 *     BidHistoryResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/BidHistoryEntry'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Cannot bid lower than current price
 */

/**
 * @swagger
 * /bids/{auctionId}:
 *   post:
 *     summary: Place a new bid on an auction
 *     description: |
 *       Users place bids on active auctions.  
 *       The bid must be **strictly higher** than current auction price.  
 *       This endpoint performs an atomic database transaction to ensure
 *       concurrency safety (prevents race conditions).
 *
 *     tags: [Bidding]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the auction to bid on
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BidRequest'
 *
 *     responses:
 *       200:
 *         description: Bid successfully placed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BidResponse'
 *
 *       400:
 *         description: Invalid bid (lower than current price, auction ended, etc)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *       403:
 *         description: Only authenticated users may place bids
 */
router.post("/:auctionId", authMiddleware, BidController.placeBid);

/**
 * @swagger
 * /bids/{auctionId}/history:
 *   get:
 *     summary: Get bidding history for an auction
 *     description: |
 *       Returns a list of bids ordered by creation time (newest first).  
 *       Includes bidder information.
 *
 *     tags: [Bidding]
 *
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The auction whose bid history is being retrieved
 *
 *     responses:
 *       200:
 *         description: Bid history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BidHistoryResponse'
 *
 *       404:
 *         description: Auction not found
 */
router.get("/:auctionId/history", BidController.getHistory);

export default router;
