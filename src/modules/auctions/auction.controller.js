import AuctionService from "./auction.service.js";

class AuctionController {
  async startAuction(req, res) {
    try {
      const { itemId } = req.params;
      const auction = await AuctionService.startAuction(Number(itemId));
      res.json({ auction });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async endAuction(req, res) {
    try {
      const { itemId } = req.params;
      const result = await AuctionService.endAuction(Number(itemId));
      res.json({ result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async listAuctions(req, res) {
    try {
      const auctions = await AuctionService.listAuctions();
      res.json({ auctions });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAuctionDetail(req, res) {
    try {
      const { itemId } = req.params;
      const auction = await AuctionService.getAuctionDetail(Number(itemId));
      res.json({ auction });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AuctionController();
