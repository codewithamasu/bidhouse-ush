import prisma from "../src/config/db.js";
import { nowWIB } from "../src/utils/time.js";
import bcrypt from "bcrypt";
import { Decimal } from "@prisma/client/runtime/library";

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function main() {
  console.log("🌱 Starting BidHouse WIB seed...");

  // ADMIN
  const admin = await prisma.user.create({
    data: {
      email: "admin@bidhouse.test",
      password: hash("admin123"),
      name: "Admin BidHouse",
      role: "ADMIN",
    },
  });

  // USERS
  const names = ["Alex", "Budi", "Citra", "Dara"];
  const users = [];

  for (let n of names) {
    const u = await prisma.user.create({
      data: {
        email: `${n.toLowerCase()}@bidhouse.test`,
        password: hash("password123"),
        name: n,
        role: "USER",
      },
    });
    users.push(u);
  }

  // ITEMS
  const itemData = [
    { title: "Antique Vase", price: "1500000.00" },
    { title: "Vintage Watch", price: "2500000.00" },
    { title: "Gaming Laptop RTX 4080", price: "12000000.00" },
    { title: "MacBook Pro M3", price: "21000000.00" },
  ];

  const items = [];
  for (const it of itemData) {
    const item = await prisma.item.create({
      data: {
        title: it.title,
        description: "Auto-generated for demo",
        basePrice: new Decimal(it.price),
        adminId: admin.id,
        imageUrl: "https://picsum.photos/seed/" + it.title.replace(/\s/g, "") + "/400"
      },
    });
    items.push(item);
  }

  // WIB timestamp
  const now = nowWIB();

  // AUCTION: RUNNING (Item 1)
  const running = await prisma.auction.create({
    data: {
      itemId: items[0].id,
      status: "RUNNING",
      startTime: now.subtract(5, "minute").toDate(),
      endTime: now.add(25, "minute").toDate(),
      currentPrice: new Decimal("1500000.00"),
    },
  });

  // AUCTION: UPCOMING (Item 2)
  const upcoming = await prisma.auction.create({
    data: {
      itemId: items[1].id,
      status: "DRAFT",
      startTime: now.add(1, "day").toDate(),
      endTime: now.add(1, "day").add(30, "minute").toDate(),
      currentPrice: new Decimal("0")
    }
  });

  // AUCTION: ENDED (Item 3)
  const ended = await prisma.auction.create({
    data: {
      itemId: items[2].id,
      status: "ENDED",
      startTime: now.subtract(2, "hour").toDate(),
      endTime: now.subtract(1, "hour").toDate(),
      currentPrice: new Decimal("15000000.00")
    }
  });

  // AUCTION: CANCELED (Item 4)
  await prisma.auction.create({
    data: {
      itemId: items[3].id,
      status: "CANCELED",
      startTime: now.subtract(1, "hour").toDate(),
      endTime: now.add(1, "hour").toDate(),
      currentPrice: new Decimal("0")
    }
  });

  // BIDS FOR RUNNING AUCTION
  let latestBid = null;
  const bidAmounts = ["1600000.00", "1750000.00", "1900000.00"];

  for (let i = 0; i < bidAmounts.length; i++) {
    latestBid = await prisma.bid.create({
      data: {
        amount: new Decimal(bidAmounts[i]),
        auctionId: running.id,
        userId: users[i].id
      }
    });
  }

  await prisma.auction.update({
    where: { id: running.id },
    data: {
      highestBidId: latestBid.id,
      currentPrice: latestBid.amount.toString()
    }
  });

  console.log("🌱 WIB seed finished.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
