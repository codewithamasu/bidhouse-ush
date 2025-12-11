import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import itemRoutes from "./modules/items/item.routes.js";
import auctionRoutes from "./modules/auctions/auction.routes.js";
import bidRoutes from "./modules/bids/bid.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/items", itemRoutes);
router.use("/auctions", auctionRoutes);
router.use("/bids", bidRoutes);

export default router;