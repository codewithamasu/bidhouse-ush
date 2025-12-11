import { Router } from "express";
import ItemController from "./item.controller.js";
import { authMiddleware } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/role.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Item Management (Admin)
 *   description: Endpoints for managing auction items. Only administrators can create, update, or delete items.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     ItemRequest:
 *       type: object
 *       required:
 *         - title
 *         - basePrice
 *       properties:
 *         title:
 *           type: string
 *           example: Antique Vase
 *         description:
 *           type: string
 *           example: A rare 19th century antique vase made in Japan.
 *         imageUrl:
 *           type: string
 *           example: https://example.com/images/vase.png
 *         basePrice:
 *           type: string
 *           description: Decimal value as string
 *           example: "1500000.00"
 *
 *     ItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         title:
 *           type: string
 *           example: Antique Vase
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *         basePrice:
 *           type: string
 *           example: "1500000.00"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         adminId:
 *           type: number
 *           example: 1
 *
 *     ItemListResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemResponse'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               example: 25
 *             page:
 *               type: number
 *               example: 1
 *             perPage:
 *               type: number
 *               example: 20
 */


// PUBLIC ENDPOINT
/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get list of all items
 *     description: Public endpoint. Returns list of items including auction info.
 *     tags: [Item Management (Admin)]
 *     responses:
 *       200:
 *         description: List of items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemListResponse'
 */
router.get("/", ItemController.list);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get details of a specific item
 *     description: Public endpoint. Returns item details along with auction status.
 *     tags: [Item Management (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of item
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemResponse'
 *       404:
 *         description: Item not found
 */
router.get("/:id", ItemController.getOne);

// ADMIN PROTECTED ENDPOINTS
/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item (ADMIN ONLY)
 *     description: Endpoint used by admins to create auctionable items.
 *     security:
 *       - bearerAuth: []
 *     tags: [Item Management (Admin)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemRequest'
 *     responses:
 *       201:
 *         description: Item successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemResponse'
 *       400:
 *         description: Invalid input or missing fields
 */
router.post("/", authMiddleware, requireRole("ADMIN"), ItemController.create);

/**
 * @swagger
 * /items/{id}:
 *   patch:
 *     summary: Update an item (ADMIN ONLY)
 *     description: Modify item fields such as title, description, imageUrl, or basePrice.
 *     security:
 *       - bearerAuth: []
 *     tags: [Item Management (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the item to modify
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemRequest'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Item not found
 */
router.patch("/:id", authMiddleware, requireRole("ADMIN"), ItemController.update);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item (ADMIN ONLY)
 *     description: Removes item permanently from the system. Only allowed if auction is not running.
 *     security:
 *       - bearerAuth: []
 *     tags: [Item Management (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 */
router.delete("/:id", authMiddleware, requireRole("ADMIN"), ItemController.remove);

export default router;
