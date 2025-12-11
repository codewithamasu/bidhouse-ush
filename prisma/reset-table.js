import prisma from "../src/config/db.js";

async function wipe() {
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  console.log("All data wiped clean!");
}

wipe();
