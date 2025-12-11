import prisma from "../../config/db.js";

class ItemService {
  async createItem({ title, description, imageUrl, basePrice, adminId }) {
    if (!title) throw new Error("title is required");
    if (!basePrice) throw new Error("basePrice is required");

    // Prisma Decimal: safer to pass as string
    const item = await prisma.item.create({
      data: {
        title,
        description,
        imageUrl,
        basePrice: basePrice.toString(),
        admin: { connect: { id: adminId } },
        // auction will be created later by admin starting an auction
      },
    });

    return item;
  }

  async updateItem(id, data) {
    const updatable = {};
    if (data.title !== undefined) updatable.title = data.title;
    if (data.description !== undefined) updatable.description = data.description;
    if (data.imageUrl !== undefined) updatable.imageUrl = data.imageUrl;
    if (data.basePrice !== undefined) updatable.basePrice = data.basePrice.toString();

    const item = await prisma.item.update({
      where: { id: Number(id) },
      data: updatable,
    });

    return item;
  }

  async deleteItem(id) {
    // optionally check if auction exists and prevent deletion if active
    return prisma.item.delete({ where: { id: Number(id) } });
  }

  async getItem(id) {
    return prisma.item.findUnique({
      where: { id: Number(id) },
      include: {
        auction: {
          include: {
            highestBid: { include: { user: true } },
          },
        },
      },
    });
  }

  async listItems({ page = 1, perPage = 20 } = {}) {
    const skip = (page - 1) * perPage;
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        skip,
        take: perPage,
        orderBy: { createdAt: "desc" },
        include: {
          auction: {
            select: {
              id: true,
              status: true,
              currentPrice: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      }),
      prisma.item.count(),
    ]);

    return { items, meta: { total, page, perPage } };
  }
}

export default new ItemService();
