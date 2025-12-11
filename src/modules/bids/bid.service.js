import prisma from "../../config/db.js";
import { nowWIB } from "../../utils/time.js";
import { Decimal } from "@prisma/client/runtime/library";
import auctionService from "../auctions/auction.service.js";

class BidService {

  async placeBid(auctionId, userId, amountStr) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      item: true,
      highestBid: true,
    },
  });

  if (!auction) throw new Error("Auction not found");

  // Auto-end if needed
  await auctionService.autoEndIfNeeded(auction);

  if (auction.status !== "RUNNING") {
    throw new Error("Auction is not running");
  }

  const now = nowWIB();

  if (now.isBefore(auction.startTime)) {
    throw new Error("Auction has not started");
  }

  if (now.isAfter(auction.endTime)) {
    await prisma.auction.update({
      where: { id: auction.id },
      data: { status: "ENDED" },
    });
    throw new Error("Auction has ended");
  }

  // User cannot bid on their own item
  if (auction.item.adminId === userId) {
    throw new Error("You cannot bid on your own item");
  }

  // Parse amount safely
  const parsed = parseFloat(amountStr);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error("Invalid bid amount");
  }

  const amount = new Decimal(parsed);

  // currentPrice fallback to 0 if null
  const current = auction.currentPrice
    ? new Decimal(auction.currentPrice)
    : new Decimal(0);

  if (amount.lte(current)) {
    throw new Error("Bid must be higher than current price");
  }

  // Transaction
  const bid = await prisma.$transaction(async (tx) => {
    const createdBid = await tx.bid.create({
      data: {
        amount,
        auctionId,
        userId,
      },
    });

    await tx.auction.update({
      where: { id: auction.id },
      data: {
        highestBidId: createdBid.id,
        currentPrice: createdBid.amount,
      },
    });

      return createdBid;
    });

    return bid;
  }


  async getHistory(auctionId) {
    return prisma.bid.findMany({
      where: { auctionId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

export default new BidService();
