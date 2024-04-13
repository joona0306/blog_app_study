require("dotenv").config();
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");
const serve = require("koa-static");
const path = require("path");
const send = require("koa-send");

const api = require("./api");
const jwtMiddleware = require("./lib/jwtMiddleware");
const { createFakeData } = require("./createFakeData");

// 구조분해 할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // createFakeData();
  })
  .catch(error => {
    console.error(error);
  });

const app = new koa();
// koa-router를 사용하여 Router 인스턴스 생성
const router = new Router();

// 라우터 설정
router.use("/api", api.routes()); // api 라우트 적용

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

const buildDirectory = path.resolve(__dirname, "../build");
app.use(serve(buildDirectory));
app.use(async ctx => {
  // Not Found이고, 주소가 /api 로 시작하지 않는 경우
  if (ctx.status === 404 && ctx.path.indexOf("/api") !== 0) {
    // index.html 내용을 반환
    await send(ctx, "index.html", { root: buildDirectory });
  }
});

// PORT가 지정되어 있지 않다면 4000을 사용
const port = PORT || 4000;
app.listen(port, () => {
  console.log("Listening to port %d", port);
});
