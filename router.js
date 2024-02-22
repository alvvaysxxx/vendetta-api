const Router = require("express");
const router = new Router();
const AccountHandler = require("./handlers/accountHandler");
const accountHandler = new AccountHandler();
const auth = require("./middleware/auth");
const TasksHandler = require("./handlers/tasksHandler");
const tasksHandler = new TasksHandler();
const BankHandler = require("./handlers/bankHandler");
const bankHandler = new BankHandler();
const RequestHandler = require("./handlers/requestHandler");
const requestHandler = new RequestHandler();
const GalleryHandler = require("./handlers/galleryHandler");
const galleryHandler = new GalleryHandler();
const ShopHandler = require("./handlers/shopHandler");
const shopHandler = new ShopHandler();
const ItemsHandler = require("./handlers/itemsHandler");
const itemsHandler = new ItemsHandler();

/* account */

router.post("/account/register", (req, res) => {
  accountHandler.register(req, res);
});
router.get("/account/check", auth, (req, res) => {
  accountHandler.checkAccount(req, res);
});
router.get("/account/profile", auth, (req, res) => {
  accountHandler.myProfile(req, res);
});

router.post("/account/change", auth, (req, res) => {
  accountHandler.changeProfile(req, res);
});

/* tasks */

router.post("/tasks/create", auth, (req, res) => {
  tasksHandler.createTask(req, res);
});

router.get("/tasks/get", auth, (req, res) => {
  tasksHandler.getTasks(req, res);
});

router.post("/tasks/complete", auth, (req, res) => {
  tasksHandler.completeTask(req, res);
});

/* banking */

router.get("/bank/balance", auth, (req, res) => {
  bankHandler.getBalance(req, res);
});

router.post("/bank/convert", auth, (req, res) => {
  bankHandler.convert(req, res);
});

router.get("/bank/card", auth, (req, res) => {
  bankHandler.cardDetails(req, res);
});

router.post("/bank/send", auth, (req, res) => {
  bankHandler.sendVendettix(req, res);
});

/* requests */

router.post("/requests/new", auth, (req, res) => {
  requestHandler.newRequest(req, res);
});

/* gallery */

router.get("/gallery/get", (req, res) => {
  galleryHandler.getGallery(req, res);
});

/* shop */

router.get("/shop/get", (req, res) => {
  shopHandler.getProducts(req, res);
});

router.post("/shop/buy", auth, (req, res) => {
  shopHandler.buyProduct(req, res);
});

/* items */

router.post("/items/sendAnonMsg", auth, (req, res) => {
  itemsHandler.sendAnonymousMsg(req, res);
});

router.get("/items/spin", auth, (req, res) => {
  itemsHandler.spin(req, res);
});

router.get("/items/tillnextspin", auth, (req, res) => {
  itemsHandler.getTimeTillNextSpin(req, res);
});

module.exports = router;
