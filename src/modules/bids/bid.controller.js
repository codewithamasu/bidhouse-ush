import BidService from "./bid.service.js";

class BidController {
  async placeBid(req, res) {
    try {
      const auctionId = Number(req.params.auctionId);
      const amount = req.body.amount; 
      const userId = req.user.id;

      const bid = await BidService.placeBid(auctionId, userId, amount);
      res.json({ bid });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getHistory(req, res) {
    try {
      const auctionId = Number(req.params.auctionId);
      const history = await BidService.getHistory(auctionId);
      res.json({ history });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default new BidController();
