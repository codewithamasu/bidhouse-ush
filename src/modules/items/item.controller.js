import ItemService from "./item.service.js";

class ItemController {
  async create(req, res) {
    try {
      const { title, description, imageUrl, basePrice } = req.body;
      const adminId = req.user.id;

      const item = await ItemService.createItem({
        title,
        description,
        imageUrl,
        basePrice,
        adminId,
      });

      res.status(201).json({ item });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const itemId = req.params.id;
      const data = req.body;

      const item = await ItemService.updateItem(itemId, data);
      res.json({ item });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async remove(req, res) {
    try {
      const itemId = req.params.id;
      await ItemService.deleteItem(itemId);
      res.json({ message: "Item deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getOne(req, res) {
    try {
      const item = await ItemService.getItem(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json({ item });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.perPage) || 20;
      const data = await ItemService.listItems({ page, perPage });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new ItemController();
