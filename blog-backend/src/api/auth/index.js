const Router = require("koa-router");
const authCtrl = require("./auth.ctrl");

// auth 라우터 생성
const auth = new Router();

auth.post("/register", authCtrl.register);
auth.post("/login", authCtrl.login);
auth.get("/check", authCtrl.check);
auth.post("/logout", authCtrl.logout);

module.exports = auth;
