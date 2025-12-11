import prisma from "../../config/db.js";
import { nowWIB } from "../../utils/time.js";
import { Decimal } from "@prisma/client/runtime/library";

class AuctionService {
  
  // Create & Start Auction (ADMIN)
  async startAuction(itemId, durationMinutes = 30) {
    
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new Error("Item not found");

    // Prevent double auction
    const existing = await prisma.auction.findUnique({
      where: { itemId },
    });

    if (existing) throw new Error("Auction already exists for this item");

    const now = nowWIB();

    const auction = await prisma.auction.create({
      data: {
        itemId,
        startTime: now.toDate(),
        endTime: now.add(durationMinutes, "minute").toDate(),
        status: "RUNNING",
        currentPrice: item.basePrice ?? new Decimal("0"),
      },
      include: {
        highestBid: true,
      },
    });

    return auction;
  }

  // Get Auction Detail
  async getAuctionDetail(itemId) {
    const auction = await prisma.auction.findUnique({
      where: { itemId },
      include: {
        item: true,
        bids: {
          orderBy: { createdAt: "desc" },
          include: { user: true },
        },
        highestBid: {
          include: { user: true },
        },
      },
    });

    if (!auction) throw new Error("Auction not found");

    return this.autoEndIfNeeded(auction);
  }

  // End Auction (ADMIN)
  async endAuction(itemId) {
    const auction = await prisma.auction.findUnique({
      where: { itemId },
      include: {
        bids: true,
        highestBid: {
          include: { user: true },
        },
      },
    });

    if (!auction) throw new Error("Auction not found");

    const now = nowWIB();

    // If still running but force ended → convert status
    if (auction.status === "RUNNING" && now.isBefore(auction.endTime)) {
      // allow force end
    }

    // Get highest bid
    let winner = null;

    if (auction.highestBidId) {
      winner = auction.highestBid;
    }

    const updated = await prisma.auction.update({
      where: { id: auction.id },
      data: {
        status: "ENDED",
      },
      include: {
        highestBid: {
          include: { user: true },
        },
      },
    });

    return {
      message: "Auction ended",
      winner,
      auction: updated,
    };
  }

  // List All Auctions
  async listAuctions() {
    const auctions = await prisma.auction.findMany({
      include: { item: true, highestBid: { include: { user: true } } },
    });

    return Promise.all(auctions.map(a => this.autoEndIfNeeded(a)));

  }

  async autoEndIfNeeded(auction) {
    const now = nowWIB();

    if (auction.status !== "RUNNING") return auction;

    if (now.isBefore(auction.endTime)) return auction; // masih aktif

    // waktu habis → END auction
    const updated = await prisma.auction.update({
      where: { id: auction.id },
      data: { status: "ENDED" },
      include: {
        highestBid: {
            include: { user: true },
          },
        },
      });

      return updated;
  }
}

export default new AuctionService();
