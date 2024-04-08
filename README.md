# 21. 백엔드 프로그래밍 Node.js의 Koa 프레임워크

## 21.1 소개하기

### 21.1.1 백엔드

### 21.1.2 Node.js

### 21.1.3 koa

## 21.2 작업 환경 준비

### 21.2.1 Node 설치확인

### 21.2.2 프로젝트 생성

- blog-app-study\blog-backend 에서 통합터미널 열기
- `yarn init -y`
- blog-backend/pakage.json 확인
- Koa 웹 프레임워크 설치
- `yarn add koa`

### 21.2.3 ESLint와 Prettier 설정

- `yarn add --dev eslint`
- `yarn run eslint --init`
- To check syntax and find problems 선택
- CommonJS (require/exports) 선택
- None of these 선택
- TypeScript No 선택
- Node 선택
- JSON 선택

- .prettierrc.json

```json
{
  "singleQuote": false,
  "semi": true,
  "useTabs": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

- Prettier에서 관리하는 코드 스타일은 ESLint에서 관리하지 않도록
- `yarn add eslint-config-prettier`
- .eslintrc.json

```json
{
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "prettier"],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {}
}
```

- blog-backend/src/index.js 생성

```js
const hello = "hello";
```

- .eslintrc.json 수정

```json
{
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "prettier"],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}
```

## 21.3 Koa 기본 사용법

### 21.3.1 서버 띄우기

- src/index.js

```js
const koa = require("koa");

const app = new koa();

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(4000, () => {
  console.log("listening to port 4000");
});

// 서버 포트 4000번으로 열고, 서버에 접속하면 "hello world"라는 텍스트를 반환하도록 설정함
```

- 서버실행
- index.js 파일은 예외로 디렉토리까지만 입력해도 실행함
- `node src`
- 웹 브라우저로 localhost:4000 접속

### 21.3.2 미들웨어

- Koa 애플리케이션은 미들웨어의 배열로 구성되어 있음
- app.use 함수 : 미들웨어 함수를 애플리케이션에 등록 함
- 미들웨어 함수는 아래와 같은 구조로 이루어져 있음

```js
(ctx, next) => {};
```

- Koa의 미들웨어 함수는 두 개의 파라미터를 받음
- 첫 번째 파라미터 ctx
- 두 번째 파라미터 next
- ctx : Context 의 줄임말, 웹 요청과 응답에 관한 정보를 지니고 있음
- next : 현재 처리 중인 미들웨어의 다음 미들웨어를 호출하는 함수
- 미들웨어를 등록하고 next 함수를 호출하지 않으면 그다음 미들웨어를 처리하지 않음

- 만약 미들웨어에서 next를 사용하지 않으면 ctx => {} 와 같은 형태로 파라미터에 next를 설정하지 않아도 됨
- 주로 다음 미들웨어를 처리할 필요가 없는 라우트 미들웨어를 나중에 설정할 때 이렇게 next를 생략하여 미들웨어 작성

- 미들웨어는 app.use 를 사용하여 등록되는 순서대로 처리 됨
- 아래는 현재 요청을 받은 주소와 우리가 정해 준 숫자를 기록하는 두 개의 미들웨
- src/index.js

```js
const koa = require("koa");

const app = new koa();

app.use((ctx, next) => {
  console.log(ctx.url);
  console.log(1);
  next();
});

app.use((ctx, next) => {
  console.log(2);
  next();
});

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

- 서버를 끄고 다시 node src 명령어를 입력하고 localhost:4000 을 열어보면 서버가 실행되고 있는 터미널에
  아래와 같은 결과물이 나타남

listening to port 4000
/
1
2
/favicon.ico
1
2

- 크롬 브라우저는 사용자가 웹 페이지에 들어가면 해당 사이트의 아이콘 파일인 /favicon.ico 파일을 서버에 요청하기 때문에
  / 경로도 나타나고 /favicon.ico 경로도 나타남

- 첫 번째 미들웨어에 next() 함수를 주석 처리하면 next를 호출하지 않으니 첫 번째 미들웨어까지만 실행

- 실습. 요청 경로에 authorized=1 이라는 쿼리 파라미터가 포함되어 있으면 이후 미들웨어를 처리해 주고,
  그렇지 않으면 이후 미들웨어를 처리하지 않음

- src/index.js

```js
const koa = require("koa");

const app = new koa();

app.use((ctx, next) => {
  console.log(ctx.url);
  console.log(1);
  if (ctx.query.authorized !== "1") {
    ctx.status = 401; // Unauthorized
    return;
  }
  next();
});

app.use((ctx, next) => {
  console.log(2);
  next();
});

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

- localhost:4000
- localhost:4000/?authorized=1

#### 21.3.2.1 next 함수는 Promise를 반환

- next 함수를 호출하면 Promise를 반환, Express와 차별화 되는 부분
- next 함수가 반환하는 Promise는 다음에 처리해야 할 미들웨어가 끝나야 완료
- 실습. next 함수 호출 이후에 then을 사용하여 Promise가 끝난 다음에 콘솔에 END를 기록하도록 수정

- src/index.js

```js
const koa = require("koa");

const app = new koa();

app.use((ctx, next) => {
  console.log(ctx.url);
  console.log(1);
  if (ctx.query.authorized !== "1") {
    ctx.status = 401; // Unauthorized
    return;
  }
  next().then(() => {
    console.log("END");
  });
});

app.use((ctx, next) => {
  console.log(2);
  next();
});

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

- 서버 재시작
- localhost:4000/?authorized=1

listening to port 4000
/?authorized=1
1
2
END

#### 21.3.2.2 async/await 사용하기

- src/index.js

```js
const koa = require("koa");

const app = new koa();

app.use(async (ctx, next) => {
  console.log(ctx.url);
  console.log(1);
  if (ctx.query.authorized !== "1") {
    ctx.status = 401; // Unauthorized
    return;
  }
  await next().then(() => {
    console.log("END");
  });
});

app.use((ctx, next) => {
  console.log(2);
  next();
});

app.use((ctx) => {
  ctx.body = "hello world";
});

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

## 21.4 nodemon 사용하기

- 서버 코드를 변경할 때마다 서버를 재시작하는 것이 번거로움
- nodemon 사용하면 서버를 자동으로 재시작
- `yarn add --dev nodemon`

- package.json

```json
{
  "name": "blog-backend",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "eslint-config-prettier": "^9.1.0",
    "koa": "^2.15.2"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "nodemon": "^3.1.0"
  },
  "scripts": {
    "start": "node src",
    "start:dev": "nodemon --watch src/ src/index.js"
  }
}
```

- 재시작이 필요없을 때 yarn start
- 재시작이 필요할 때 yarn start:dev

- yarn start:dev 명령어 실행 후 index.js 미들웨어 모두 제거 후 터미널 확인
- src/index.js

```js
const koa = require("koa");

const app = new koa();

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

## 21.5 koa-router 사용하기

- 리액트의 라우터 처럼 koa를 사용할 때도 다른 주소로 요청이 들어올 경우 다른 작업을 처리할 수 있도록 라우터 사용
- koa-router 모듈 설치
- `yarn add koa-router`

### 21.5.1 기본 사용법

- src/index.js

```js
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");

const app = new koa();
// koa-router를 사용하여 Router 인스턴스 생성
const router = new Router();

// 라우터 설정
//  / 경로로 들어오면 "홈" 을 띄우고
// /about 경로로들어오면 "소개" 텍스트가 나타나도록 설정

// 라우트를 설정할 때 router.get의 첫 번째 파라미터에는 라우트의 경로
// 두 번째 파라미터에는 해당 라우트에 적용할 미들웨어 함수를 넣어줌
// 여기서 get 키워드는 해당 라우트에서 사용할 HTTP 메서드를 의미 get 대신 post, put, delete 등을 넣을 수 있음
router.get("/", (ctx) => {
  ctx.body = "홈";
});
router.get("/about", (ctx) => {
  ctx.body = "소개";
});

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

- localhost:4000/
- localhost:4000/about

### 21.5.2 라우트 파라미터와 쿼리

- 라우트의 파라미터와 쿼리를 읽는 방법
- 라우터의 파라미터를 설정할 때는 /about/:name 형식으로 콜론 사용
- 또 파라미터가 있을 수도, 없을 수도 있다면 /about/:name? 같은 형식으로 파라미터 이름 뒤에 물음표 사용
- 이렇게 설정한 파라미터는 함수의 ctx.params 객체에서 조회할 수 있음

- URL 쿼리의 경우, 예를 들어 /posts/?id=10 같은 형식으로 요청했다면
- 해당 값을 ctx.query에서 조회할 수 있음
- 쿼리 문자열을 자동으로 객체 형태로 파싱해 주므로 별도로 파싱 함수를 돌릴 필요가 없음
  (문자열 형태의 쿼리 문자열을 조회해야 할 때는 ctx.querystring을 사용)

- index.js

```js
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");

const app = new koa();
// koa-router를 사용하여 Router 인스턴스 생성
const router = new Router();

// 라우터 설정
//  / 경로로 들어오면 "홈" 을 띄우고
// /about 경로로들어오면 "소개" 텍스트가 나타나도록 설정

// 라우트를 설정할 때 router.get의 첫 번째 파라미터에는 라우트의 경로
// 두 번째 파라미터에는 해당 라우트에 적용할 미들웨어 함수를 넣어줌
// 여기서 get 키워드는 해당 라우트에서 사용할 HTTP 메서드를 의미 get 대신 post, put, delete 등을 넣을 수 있음
router.get("/", (ctx) => {
  ctx.body = "홈";
});

router.get("/about/:name?", (ctx) => {
  const { name } = ctx.params;
  // name의 존재 유무에 따라 다른 결과 출력
  ctx.body = name ? `${name}의 소개` : "소개";
});

router.get("/posts", (ctx) => {
  const { id } = ctx.query;
  // id의 존재 유무에 따라 다른 결과 출력
  ctx.body = id ? `포스트 #${id}` : "포스트 아이디가 없습니다.";
});

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

- localhost:4000/about/react
- localhost:4000/posts
- localhost:4000/posts?id=10

- 파라미터와 쿼리는 둘 다 주소를 통해 특정 값을 받아 올 때 사용함
- 정해진 규칙은 없지만 용도가 서로 조금씩 다름

- 파라미터 : 처리할 작업의 카테고리를 받아 오거나, 고유 ID 혹은 이름으로 특정 데이터를 조회할 때
- 쿼리 : 옵션에 관련된 정보를 받아옴, 여러 항목을 리스팅하는 API라면 어떤 조건을 만족하는 항목을 보여줄지
  또는 어떤 기준으로 정렬할지를 정해야 할 때

### 21.5.3 REST API

- 웹 애플리케이션을 만들려면 데이터베이스에 정보를 입력하고 읽어 와야 함
- 웹 브라우저에서 데이터베이스에 직접 접속하여 데이터를 변경한다면 보안상 문제가 생길수 있음
- 그래서 REST API를 만들어서 사용
- DB ==처리==> 서버 REST API ==응답==> 클라이언트
- DB <==== 서버 REST API <==데이터 조회,생성,삭제,업데이트 요청하기== 클라이언트

- 클라이언트가 서버에 자신이 데이터를 조회/생성/삭제/업데이트 하겠다고 요청하면
- 서버는 필요한 로직에 따라 데이터베이스에 접근하여 작업을 처리

- REST API는 요청 종류에 따라 다른 HTTP 메서드를 사용합니다. 주로 사용하는 HTTP 메서드
- GET : 데이터를 조회
- POST : 데이터를 등록할 때 사용, 인증 작업을 거칠 때 사용하기도 함
- DELETE : 데이터를 지울 때 사용
- PUT : 데이터를 새 정보로 통째로 교체할 때 사용
- PATCH : 데이터의 특정 필드를 수정할 때 사용

- 블로그 포스트용 REST API 예시
- POST /posts 포스트 작성
- GET /posts 포스트 목록 조회
- GET /posts/:id 특정 포스트 조회
- DELETE /posts/:id 특정 포스트 삭제
- PATCH /posts/:id 특정 포스트 업데이트(구현 방식에 따라 PUT으로도 사용 가능)
- POST /posts/:id/comments 특정 포스트에 댓글 등록
- GET /posts/:id/comments 특정 포스트의 댓글 목록 조회
- DELETE /posts/:id/comments/:commentId 특정 포스트의 특정 댓글 삭제

### 중간 용어 정리

- 라우트 : URL 경로에 따라 특정 페이지나 컨텐츠를 보여주는 규칙
- 라우터 : 라우트들을 관리하고, 요청받은 URL에 따라 적절한 라우트로 연결해주는 시스템

### 21.5.4 라우트 모듈화

- 코드가 길어지는 것을 방비하고 유지보수를 위해 라우터를 여러 파일에 분리시켜서 작성
- src/api/index.js

```js
const Router = require("koa-router");
const api = new Router();

api.get("/test", (ctx) => {
  ctx.body = "test 성공";
});

// 라우터를 내보냄
module.exports = api;
```

- 그다음 api 라우트를 src/index.js 파일에 불러와서 기존 라우터에 /api 경로로 적용

```js
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");
const api = require("./api");

const app = new koa();
// koa-router를 사용하여 Router 인스턴스 생성
const router = new Router();

// 라우터 설정
router.use("/api", api.routes()); // api 라우트 적용

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

- localhost:4000/api/test

### 21.5.5 posts 라우트 생성

- api 라우트 내부에 posts 라우트를 만들어보자
- api/posts/index.js

```js
const Router = require("koa-router");
const posts = new Router();

const printInfo = (ctx) => {
  // 문자열이 아닌 JSON 객체를 반환하도록 설정
  // 이 객체에는 현재 요청의 메서드, 경로, 파라미터를 담았음
  ctx.body = {
    method: ctx.method,
    path: ctx.path,
    params: ctx.params,
  };
};

// posts 라우트에 여러 종류의 라우트를 설정한 후 모두 printInfo 함수를 호출
posts.get("/", printInfo);
posts.post("/", printInfo);
posts.get("/:id", printInfo);
posts.delete("/:id", printInfo);
posts.put("/:id", printInfo);
posts.patch("/:id", printInfo);

module.exports = posts;
```

- api 라우트에 posts 라우트를 연결
- src/api/index.js

```js
const Router = require("koa-router");
const posts = require("./posts");

const api = new Router();

api.use("/posts", posts.routes());

// 라우터를 내보냄
module.exports = api;
```

#### 21.5.5.1 Postman의 설치 및 사용

- https://www.getpostman.com

- GET: http://localhost:4000/api/posts
- PATCH: http://localhost:4000/api/posts/10
- PUT: http://localhost:4000/api/posts/10
- DELETE: http://localhost:4000/api/posts/10

#### 21.5.5.2 컨트롤러 파일 작성

- 라우트를 작성하는 과정에서 특정 경로에 미들웨어를 등록할 때는
  다음과 같이 두 번째 인자에 함수를 선언해서 바로 넣어 줄 수 있음

```js
router.get("/", (ctx) => {});
```

- 각 라우트 처리 함수의 코드가 길면 라우터 설정을 한눈에 보기 힘들다.
- 그렇기 때문에 라우트 처리 함수들은 다른 파일로 따로 분리해서 관리할 수도 있다.
- 이 라우트 처리 함수만 모아 놓은 파일을 **컨트롤러**라고 한다.
- 지금은 아직 데이터베이스를 연결하지 않았으므로 자바스크리트의 **배열** 기능만 사용하여 **임시로** 기능 구현

- API 기능을 본격적으로 구현하기 전에 먼저 **koa-bodyparser** 미들웨어를 적용해야 함
- 이 미들웨어는 post/put/patch 같은 메서드의 **Request Body**에 **JSON** 혁식으로 데이터를 넣어주면
- 이를 **파싱**하여 서버에서 사용할 수 있게 함
- `yarn add koa-bodyparser`

- router를 적용하는 코드의 **윗부분**에서 미들웨어를 불러와 적용해야 함
- src/index.js

```js
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const api = require("./api");

const app = new koa();
// koa-router를 사용하여 Router 인스턴스 생성
const router = new Router();

// 라우터 설정
router.use("/api", api.routes()); // api 라우트 적용

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

app.listen(4000, () => {
  console.log("listening to port 4000");
});
```

- 그리고 posts 경로에 post.ctrl.js 파일을 만든다.
- src/api/posts/posts.ctrl.js

```js
let postId = 1; // id의 초기값

// posts 배열 초기 데이터
const posts = [
  {
    id: 1,
    title: "제목",
    body: "내용",
  },
];

/* 포스트 작성
POST /api/posts
{title, body}
*/
exports.write = (ctx) => {
  // REST API의 Request Body는 ctx.request.body에서 조회할 수 있음
  const { title, body } = ctx.request.body;
  postId += 1; // 기존 postId에 값에 1을 더함
  const post = { id: postId, title, body };
  posts.push(post);
  ctx.body = post;
};

/* 포스트 목록 조회
GET /api/posts
*/
exports.list = (ctx) => {
  ctx.body = posts;
};

/* 특정 포스트 조회
GET /api/posts/:id
*/
exports.read = (ctx) => {
  const { id } = ctx.params;
  // 주어진 id 값으로 포스트를 찾는다.
  // 파라미터로 받아 온 값은 문자열 형식이므로 파라미터를 숫자로 변환하거나
  // 비교할 p.id 값을 문자열로 변경해야 한다.
  const post = posts.find((p) => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환한다.
  if (!post) {
    ctx.status = 404;
    ctx.body = {
      message: "포스트가 존재하지 않습니다.",
    };
    return;
  }
  ctx.body = post;
};

/* 특정 포스트 제거
DELETE /api/posts/:id
*/
exports.remove = (ctx) => {
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인한다.
  const index = posts.findIndex((p) => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환한다.
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: "포스트가 존재하지 않습니다.",
    };
    return;
  }
  // index번째 아이템을 제거한다.
  posts.splice(index, 1);
  ctx.status = 204; // No Content
};

/* 포스트 수정(교체)
PUT /api/posts/:id
{title, body} */
exports.replace = (ctx) => {
  // PUT 메서드는 전체 포스트 정보를 입력하여 데이터를 통째로 교체할 때 사용한다.
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인
  const index = posts.findIndex((p) => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환한다.
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: "포스트가 존재하지 않습니다.",
    };
    return;
  }
  // 전체 객체를 덮어 씌운다.
  // 따라서 id를 제외한 기존 정보를 날리고, 객체를 새로 만든다.
  posts[index] = { id, ...ctx.request.body };
  ctx.body = posts[index];
};

/* 포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{title, body} */
exports.update = (ctx) => {
  // PATCH 메서드는 주어진 필드만 교체한다.
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인한다.
  const index = posts.findIndex((p) => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환한다.
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: "포스트가 존재하지 않습니다.",
    };
    return;
  }
  // 기존 값에 정보를 덮어 씌운다.
  posts[index] = { ...posts[index], ...ctx.request.body };
  ctx.body = posts[index];
};
```

- 컨트롤러를 만들 때 exports.이름 = ... 형식으로 함수를 내보내었음
- 아래와 같은 형식으로 불러올 수 있음

```js
const 모듈이름 = require("파일이름");
모듈이름.이름();
```

- require("./posts.ctrl")을 입력하여 posts.ctrl.js 파일을 불러온다면 다음 객체를 불러오게 됨
  {
  wirte: Function,
  list: Function,
  read: Function,
  remove: Function,
  replace: Function,
  update: Function,
  };

- 만든 컨트롤러 함수를 라우트에 연결
- src/api/posts/index.js

```js
const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", postsCtrl.write);
posts.get("/:id", postsCtrl.read);
posts.delete("/:id", postsCtrl.remove);
posts.put("/:id", postsCtrl.replace);
posts.patch("/:id", postsCtrl.update);

module.exports = posts;
```

## 21.6 정리

- REST API를 살펴본 후 어떻게 작동하는지를 자바스크립트 배열을 사용하여 구현하면서 알아봄
- 자바스크립트 배열을 사용하여 구현하면 서버를 재시작할 때 당연히 데이터가 소멸
- 데이터베이스를 사용하면 다양하고 효율적인 방식으로 많은 양의 데이터를 읽고 쓸 수 있음
- 이 책에서는 MongoDB를 사용하여 백엔드 구현할 예정

# 22. mongoose를 이용한 MongoDB연동 실습

## 22.1 소개하기

- MongoDB 는 NoSQL 데이터베이스
- 스키마: 데이터베이스에 어떤 형식의 데이터를 넣을지에 대한 정보를 가리킨다.
- 예를 들어 회원 정보 스키마라면 계정명, 이메일, 이름 등이 되겠다.

### 22.1.1 문서란?

- 여기서 말하는 문서(document)는 RDBMS의 레코드(record)와 개념이 비슷
- 문서의 데이터 구조는 한 개 이상의 **키-값** 쌍으로 되어 있다.
  {
  "\_id" : ObjectId("5099803df3f4948bd2f98391:),
  "username": "velopert",
  "name": {first: "M.J.", last: "Kim"}
  }

- 문서는 **BSON(바이너리 형태의 JSON)** 형태로 저장된다.
- 새로운 문서를 만들면 \_id라는 고유한 값을 자동으로 생성한다.
- 이 값은 시간, 머신 아이디, 프로세스 아이디, 순차 번호로 되어 있어 값의 고유함을 보장한다.

- 여러 문서가 들어 있는 곳을 **컬렉션**이라고 한다.
- MongoDB는 다른 스키마를 가지고 있는 문서들이 한 컬렉션에서 공존할 수 있다.

### 22.1.2 MogoDB 구조

- 서버 하나에 데이터베이스를 여러 개 가지고 있을 수 있다.
- 각 데이터베이스에는 여러 개의 컬렉션이 있으며, 컬렉션 내부에는 문서들이 들어있다.

### 22.1.3 스키마 디자인

- MongoDB에서 스키마를 디자인하는 방식은 기존 RDBMS에서 스키마를 디자인하는 방식과 완전히 다르다
- NoSQL에서는 그냥 모든 것을 문서 하나에 넣는다. (교재 p640 참고)

- 이런 상황에서 보통 MongoDB는 댓글을 포스트 문서 내부에 넣는다.
- 문서 내부에 또 다른 문서가 위차할 수 있는데, 이를 **서브다큐먼트(subdocument)**라고 한다.
- 서브다큐먼트 또한 일반 문서를 다루는 것처럼 쿼리할 수 있다.

- 문서 하나에는 최대 16MB만큼 데이터를 넣을 수 있다.
- 100자 댓글 데이터라면 대략 0.24KB를 차지한다. 16MB는 16.384KB이니 문서 하나에 댓글 데이터를 약 6,8000개 넣을 수 있는 셈이다.
- 서브다큐먼트에서 이 용량을 초과할 가능성이 있다면 컬렉션을 분리시키는 것이 좋다

## 22.2 MongoDB 서버 준비

### 22.2.1 설치

- https://www.mongodb.com/try/download/community
- Complete로 설치
- Window는 Compass 자동으로 설치 됨

### 22.2.2 MongoDB 작동 확인

- C:\Program Files\MongoDB\Server\버전(7.0)\bin 터미널에서
  mongo와 version() 명령어를 사용하면 실행과 버전을 확인할 수 있다고 하나
  명령어 실행이 되지 않아 확인하지 못함(추후 확인해보자)

## 22.3 mongoose의 설치 및 적용

- mongoose는 Node.js 환경에서 사용하는 MongoDB 기반 ODM(Object Data Modelling) 라이브러리이다.
- 이 라이브러리는 데이터베이스 문서들을 자바스크립트 객체처럼 사용할 수 있게 해준다.
- `yarn add mongoose`
- `yarn add dotenv`

### 22.3.1 .env 환경변수 파일 생성

- .env

```txt
PORT=4000
MONGO_URI=mongodb://localhost:27017/blog
```

- src/index.js

```js
require("dotenv").config();
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");

// 구조분해 할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT } = process.env;

const api = require("./api");

const app = new koa();
// koa-router를 사용하여 Router 인스턴스 생성
const router = new Router();

// 라우터 설정
router.use("/api", api.routes()); // api 라우트 적용

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

// PORT가 지정되어 있지 않다면 4000을 사용
const port = PORT || 4000;
app.listen(port, () => {
  console.log("Listening to port %d", port);
});
```

### 22.3.2 mongoose로 서버와 데이터베이스 연결

- mongoose를 이용하여 서버와 데이터베이스를 연결
- mongoose의 connect 함수 사용
- src/index.js

```js
require("dotenv").config();
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");

const api = require("./api");

// 구조분해 할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error(error);
  });

const app = new koa();
// koa-router를 사용하여 Router 인스턴스 생성
const router = new Router();

// 라우터 설정
router.use("/api", api.routes()); // api 라우트 적용

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

// PORT가 지정되어 있지 않다면 4000을 사용
const port = PORT || 4000;
app.listen(port, () => {
  console.log("Listening to port %d", port);
});
```

## 22.4 esm으로 ES 모듈 import/export 문법 사용하기

- node.js에서 module 타입을 지원하지만
  import/export 문법 사용시 nodemon에서 오류를 감지하여 추후에 적용하기로 하였다.

### 22.4.1 기존 코드 ES Module 형태로 바꾸기

## 22.5 데이터베이스의 스키마와 모델

- mongoose에는 **스키마(schema)** 와 **모델(model)** 이라는 개념이 있다.
- 스키마 : 컬렉션에 들어가는 문서 내부와 각 필드가 어떤 형식으로 되어 있는지 **정의하는 객체**
- 모델 : 스키마를 사용하여 만드는 **인스턴스**, 데이터베이스에서 실제 작업을 처리할 수 있는 함수들을 지니고 있는 객체

### 22.5.1 스키마 생성

- 제목
- 내용
- 태그
- 작성일

- 각 정보에 대한 필드 이름과 데이터 타입을 설정하여 스키마를 만든다.
- src/models/post.js

```js
import mongoose from "mongoose";

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String], // 문자열로 이루어진 배열
  publishedDate: {
    type: Date,
    default: Date.now, // 현재 날짜를 기본값으로 지정
  },
});
```

- Schema를 만들 때는 mongoose 모듈의 Schema를 사용하여 정의한다.
- 그리고 각 필드 이름과 필드의 데이터 타입 정보가 들어 있는 객체를 작성한다.
- Schema에서 기본적으로 지원하는 타입은 아래와 같다

  - String : 문자열
  - Number : 숫자
  - Date : 날짜
  - Buffer : 파일을 담을 수 있는 버퍼
  - Boolean : true 또는 false 값
  - Mixed(Schema, Types, Mixed) : 어떤 데이터도 넣을 수 있는 형식
  - ObjectId(Schema, Types, ObjectId) : 객체 아이디 주로 다른 객체를 참조할 때 넣음
  - Array : 배열 형태의 값으로 []로 감싸서 사용

- 스키마 내부에 다른 스키마를 내장시킬 수도 있다. ( 교재 653p 참고)

### 22.5.2 모델 생성

- 모델을 만들 때는 mongoose.model 함수를 사용
- src/models/post.js

```js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: String,
  body: String,
  tags: [String], // 문자열로 이루어진 배열
  publishedDate: {
    type: Date,
    default: Date.now, // 현재 날짜를 기본값으로 지정
  },
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
```

- model() 함수는 기본적으로 두 개의 파라미터가 필요하다.
- 첫 번째 파라미터는 스키마 이름
- 두 번째 파라미터는 스키마 객체
- 데이터베이스는 스키마 이름을 정해 주면 그 이름의 복수 형태로 데이터베이스에 컬렉션 이름을 만든다.
- 예를 들어 스키마 이름을 Post로 설정하면, 실제 데이터베이스에 만드는 컬렉션 이름은 posts이다.

## 22.6 MongoDB Compass의 설치 및 이용

- Window는 MongoDB를 설치 할 때 함께 Compass 설치 해준다.

## 22.7 데이터 생성과 조회

- MongoDB에 데이터를 등록하여 데이터를 보존해보자.

### 22.7.1 데이터 생성

- src/api/posts/index.js

```js
const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", postsCtrl.write);
posts.get("/:id", postsCtrl.read);
// put 메서드 사용하지 않을거라서 삭제
posts.delete("/:id", postsCtrl.remove);
posts.patch("/:id", postsCtrl.update);

module.exports = posts;
```

- src/api/posts/posts.ctrl.js 의 write 함수

```js
const Post = require("../../models/post");

let postId = 1; // id의 초기값

// posts 배열 초기 데이터
const posts = [
  {
    id: 1,
    title: "제목",
    body: "내용",
  },
];

/* 포스트 작성
POST /api/posts
{title, body}
*/
exports.write = async (ctx) => {
  const { title, body, tags } = ctx.request.body;
  // 포스트의 인스턴스를 만들 때는 new 키워드를 사용
  // 그리고 생성자 함수의 파라미터에 정보를 지닌 객체럴 넣음
  const post = new Post({
    title,
    body,
    tags,
  });
  try {
    // save()함수를 실행시켜야 데이터베이스에 저장
    // 이 함수의 반환 값은 Promise이므로 async/await 문법으로
    // 데이터베이스 저장 요청을 완료할 때까지 await를 사용하여 대기
    // await를 사용할 때는 try/catch 문으로 오류를 처리
    await post.save();
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};

/* 포스트 목록 조회
GET /api/posts
*/
exports.list = (ctx) => {
  ctx.body = posts;
};

/* 특정 포스트 조회
GET /api/posts/:id
*/
exports.read = (ctx) => {
  const { id } = ctx.params;
  // 주어진 id 값으로 포스트를 찾는다.
  // 파라미터로 받아 온 값은 문자열 형식이므로 파라미터를 숫자로 변환하거나
  // 비교할 p.id 값을 문자열로 변경해야 한다.
  const post = posts.find((p) => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환한다.
  if (!post) {
    ctx.status = 404;
    ctx.body = {
      message: "포스트가 존재하지 않습니다.",
    };
    return;
  }
  ctx.body = post;
};

/* 특정 포스트 제거
DELETE /api/posts/:id
*/
exports.remove = (ctx) => {
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인한다.
  const index = posts.findIndex((p) => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환한다.
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: "포스트가 존재하지 않습니다.",
    };
    return;
  }
  // index번째 아이템을 제거한다.
  posts.splice(index, 1);
  ctx.status = 204; // No Content
};

/* 포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{title, body} */
exports.update = (ctx) => {
  // PATCH 메서드는 주어진 필드만 교체한다.
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인한다.
  const index = posts.findIndex((p) => p.id.toString() === id);
  // 포스트가 없으면 오류를 반환한다.
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: "포스트가 존재하지 않습니다.",
    };
    return;
  }
  // 기존 값에 정보를 덮어 씌운다.
  posts[index] = { ...posts[index], ...ctx.request.body };
  ctx.body = posts[index];
};
```

- MongoDB Compass에서 좌측 상단에 새로고침 버튼을 누르면 blog 데이터베이스가 나타남
- blog 데이터베이스를 선택한 뒤 posts 컬렉션을 열어보자

### 22.7.2 데이터조회

- 모델 인스턴스의 find()함수 사용
- src/api/posts/posts.ctrl.js 의 list 함수

```js
/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async (ctx) => {
  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- Postman으로 GET http://localhost:4000/api/posts 으로 확인 해보기

### 22.7.3 특정 포스트 조회

- 특정 id를 가진 데이터를 조회할 때는 findById() 함수 사용
- src/api/posts/posts.ctrl.js 의 read 함수

```js
/* 특정 포스트 조회
GET /api/posts/:id
*/
exports.read = async (ctx) => {
  const { id } = ctx.params;
  try {
    // findById()함수를 호출한 후에 exec()를 붙여 주어야 서버에 쿼리를 요청함
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

## 22.8 데이터 삭제와 수정

### 22.8.1 데이터 삭제

- 데이터를 삭제할 때는 여러 종류의 함수를 사용할 수 있다.

  - delete() : 특정 조건을 만족하는 데이터를 모두 지운다.
  - findByIdAndDelete() : id를 찾아서 지운다.
  - findOneAndDelete() : 특정 조건을 만족하는 데이터 하나를 찾아서 제거한다.

- 여기서는 findByIdAndDelete() 함수를 사용 해보자
- src/api/posts/posts.ctrl.js

```js
/* 특정 포스트 제거
DELETE /api/posts/:id
*/
exports.remove = async (ctx) => {
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인한다.
  try {
    await Post.findByIdAndDelete(id).exec();
    ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없음)
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

### 22.8.2 데이터 수정

- findByIdAndUpdate() 함수 사용
- 이 함수는 **세 가지 파라미터**를 넣어 주어야 한다.
- 첫 번째 파라미터는 **id**, 두 번째 파라미터는 **업데이트 내용**, 세 번째 파라미터는 **업데이트 옵션**
- src/api/posts/posts.ctrl.js

```js
/* 포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{
  title: "수정",
  body: "수정 내용",
  tags: ["수정", "태그"]
} 
*/
exports.update = async (ctx) => {
  // PATCH 메서드는 주어진 필드만 교체한다.
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환한다.
      // false 일 때는 업데이트되기 전의 데이터를 반환한다.
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

## 22.9 요청 검증

### 22.9.1 ObjectId 검증

- 앞서 read API를 실행할 때, id가 올바른 ObjectId 형식이 아니면 500 오류가 발생함
- 500 오류는 보통 서버에서 처리하지 않아 내부적으로 문제가 생겼을 때 발생
- 잘못된 id를 전달했다면 클라이언트가 요청을 잘못 보낸 것이니 400 Bad Request 오류를 띄워 주는것이 맞다.
- 그러려면 id 값이 올바른 ObjectiId인지 확인해야 한다.
- 검증 방법

```js
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;
ObjectId.isValid(id);
```

- ObjectId를 검증해야 하는 API는 read, remove, update 세가지
- 코드를 한번만 작성하여 여러 라우트에 쉽게 적용하는 방법이 있다.
- 바로 미들웨어를 만드는 것이다.
- src/api/posts/posts.ctrl.js

```js
const Post = require("../../models/post");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

exports.checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  return next();
};

// 아래 코드 생략
```

- src/api/posts/index.js 에서 ObjectId 검증이 필요한 부분에 만든 미들웨어를 추가

```js
const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", postsCtrl.write);
posts.get("/:id", postsCtrl.checkObjectId, postsCtrl.read);
// put 메서드 사용하지 않을거라서 삭제
posts.delete("/:id", postsCtrl.checkObjectId, postsCtrl.remove);
posts.patch("/:id", postsCtrl.checkObjectId, postsCtrl.update);

module.exports = posts;
```

### 22.9.2 Request Body 검증

- write, update API에서 전달받은 요청 내용을 검증하는 방법
- 지금은 따로 검증 처리를 하지 않았기 때문에 내용을 비운 상태에서 write API를 실행 해도 요청이 성공함
- title, body, tags 값을 모두 전달받아야 하고 클라이언트가 값을 빼먹었을 때는 400 오류 발생시키도록 해보자.
- 객체를 검증하기 위해 각 값을 if 문으로 비교하는 방법도 있으나 여기서는 joi 라이브러리 사용
- `yarn add joi`

- src/api/posts/posts.ctrl.js - write 함수

```js
const Post = require("../../models/post");
const mongoose = require("mongoose");
const Joi = require("joi");

// ...

/* 포스트 작성
POST /api/posts
{title, body}
*/
exports.write = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증
    title: Joi.string().required(), // required()가 있으면 필수 항목
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(), // 문자열로 이루어진 배열
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  // 포스트의 인스턴스를 만들 때는 new 키워드를 사용
  // 그리고 생성자 함수의 파라미터에 정보를 지닌 객체럴 넣음
  const post = new Post({
    title,
    body,
    tags,
  });
  try {
    // save()함수를 실행시켜야 데이터베이스에 저장
    // 이 함수의 반환 값은 Promise이므로 async/await 문법으로
    // 데이터베이스 저장 요청을 완료할 때까지 await를 사용하여 대기
    // await를 사용할 때는 try/catch 문으로 오류를 처리
    await post.save();
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};

// ...
```

- update API 에는 required()가 없음
- src/api/posts/posts.ctrl.js

```js
/* 포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{
  title: "수정",
  body: "수정 내용",
  tags: ["수정", "태그"]
} 
*/
exports.update = async (ctx) => {
  // PATCH 메서드는 주어진 필드만 교체한다.
  const { id } = ctx.params;

  // write에서 사용한 schema와 비슷하지만 required()가 없습니다.
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // 검증하고 나서 검증 실패인 경우 에러 처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400; // Bad Request
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환한다.
      // false 일 때는 업데이트되기 전의 데이터를 반환한다.
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

## 22.10 페이지네이션 구현

- 블로그에서 포스트 목록을 볼 때 한 페이지에 보이는 포스트의 개수는 10~20개 정도
- 포스트 목록을 볼 때 포스트 전체 내용을 보여 줄 필요는 없고, 처음 200자(글자) 정도만 보여주자

### 22.10.1 가짜 데이터 생성하기

- 페이지네이션 기능을 구현하기 위해 가짜 데이터 생성하는 스크립트 작성
- src/createFakeData.js

```js
const Post = require("./models/post");

exports.createFakeData = async () => {
  // 0, 1, ... 39로 이루어진 배열을 생성한 후 포스트 데이터로 변환
  const posts = [...Array(40).keys()].map((i) => ({
    title: `포스트 #${i}`,
    // http://www.lipsum.com/ 에서 복사한 200자 이상의 텍스트
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nec felis dapibus, 
    aliquet libero a, tincidunt nisl. Nunc maximus, justo at auctor lacinia, ipsum orci aliquam massa, 
    sit amet auctor justo velit eu mauris. Ut vitae efficitur mauris, sit amet sodales magna. Sed vehicula, 
    diam in porttitor placerat, nisi nisi consequat nisl, non auctor nunc lacus a dui. Vivamus consequat, 
    nulla non sodales molestie, ipsum eros vulputate mi, a consequat mi lorem a nunc. Pellentesque habitant 
    morbi tristique senectus et netus et malesuada fames ac turpis egestas.`,
    tags: ["가짜", "데이터"],
  }));

  try {
    const docs = await Post.insertMany(posts);
    console.log(docs);
  } catch (error) {
    console.error(error);
  }
};
```

- src/index.js

```js
// ...
const { createFakeData } = require("./createFakeData");
// ...
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    createFakeData();
  })
  .catch((error) => {
    console.error(error);
  });

// ...
```

### 22.10.2 포스트를 역순으로 불러오기

- 블로그에 방문한 사람에게 가장 최근 작성된 포스트를 먼저 보여주자
- list API에서 exec()를 하기전에 sort() 구문을 넣으면 된다.
- sort() 함수의 파라미터는 {key: 1} 형식으로 넣는다.
- key는 정렬(sorting)할 필드를 설정하는 부분이며,
- 오른쪽 값을 1로 설정하면 오름차순, -1로 설정하면 내림차순으로 정렬
- 내림차순으로 정렬해야 하므로 {\_id: -1}로 설정

- src/api/posts/posts.ctrl.js - list 함수
- Postman에서 확인

```js
/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async (ctx) => {
  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find().sort({ _id: -1 }).exec();
    ctx.body = posts;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

### 22.10.3 보이는 개수 제한

- 개수를 제한할 때는 limit() 함수를 사용한다.
- 파라미터에는 제한할 숫자를 넣으면 된다.

- src/api/posts/posts.ctrl.js - list 함수

```js
/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async (ctx) => {
  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find().sort({ _id: -1 }).limit(10).exec();
    ctx.body = posts;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

### 22.10.4 페이지 기능 구현

- 페이지 기능을 구현하려면 limit() 함수와 추가로 skip() 함수를 사용해야한다.
- skip() 함수에 파라미터로 10을 넣어 주면, 처음 10개를 제외하고 그다음 데이터를 불러온다.
- 20을 넣어주면 처음 20개를 제외하고 그다음 데이터

- skip() 함수에 파라미터에는 (page - 1) \* 10을 넣어주면
- 1페이지에는 처음 10개를 불러오고, 2페이지에는 그다음 10개를 불러온다.
- page 값은 query에서 받아 오도록 설정한다.
- 이 값이 없으면 page 값을 1로 간주하도록 코드를 작성한다.

- src/api/posts/posts.ctrl.js - list 함수

```js
/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async (ctx) => {
  // query는 문자열이기 때문에 숫자로 변환해 주어야 한다.
  // 값이 주어지지 않았다면 1을 기본으로 사용한다.
  const page = parseInt(ctx.query.page || "1", 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find()
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    ctx.body = posts;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- http://localhost:4000/api/posts?page=2 형식으로 페이지를 지정하여 조회할 수 있다.

### 22.10.5 마지막 페이지 번호 알려주기

- 응답 내용의 형식을 바꾸어 새로운 필드를 설정하는 방법
- Response 헤더 중 Link를 설정하는 방법
- 커스텀 헤더를 설정하는 방법 으로 이 정보를 알려 줄수도 있다.

- 여기서는 커스텀 헤더를 설정하는 방법을 사용해보자

- src/api/posts/posts.ctrl.js - list 함수

```js
/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async (ctx) => {
  // query는 문자열이기 때문에 숫자로 변환해 주어야 한다.
  // 값이 주어지지 않았다면 1을 기본으로 사용한다.
  const page = parseInt(ctx.query.page || "1", 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find()
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();
    const postCount = await Post.countDocuments().exec();
    ctx.set("Last-Page", Math.ceil(postCount / 10));
    ctx.body = posts;
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- Postman에서 아래쪽 Headers 확인

### 22.10.6 내용 길이 제한

- body의 길이가 200자 이상이면 뒤에 '...'을 붙이고 문자열을 자르는 기능을 구현해보자
- find()를 통해 조회한 데이터는 mongoose 문서 인스턴스의 형태이므로 데이터를 바로 변형할 수 없다.
- 그 대신 toJSON() 함수를 실행하여 JSON 형태로 변환한 뒤 필요한 변형을 일으켜 주어야 한다.

- src/api/posts/posts.ctrl.js - list 함수

```js
/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async (ctx) => {
  // query는 문자열이기 때문에 숫자로 변환해 주어야 한다.
  // 값이 주어지지 않았다면 1을 기본으로 사용한다.
  const page = parseInt(ctx.query.page || "1", 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find()
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .exec();

    const postCount = await Post.countDocuments().exec();

    ctx.set("Last-Page", Math.ceil(postCount / 10));

    ctx.body = posts
      .map((post) => post.toJSON())
      .map((post) => ({
        ...post,
        body:
          post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
      }));
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- lean() 함수를 사용하는 방법, 데이터를 처음부터 JSON 형태로 조회할 수 있다.

```js
/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async (ctx) => {
  // query는 문자열이기 때문에 숫자로 변환해 주어야 한다.
  // 값이 주어지지 않았다면 1을 기본으로 사용한다.
  const page = parseInt(ctx.query.page || "1", 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find()
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean()
      .exec();

    const postCount = await Post.countDocuments().exec();

    ctx.set("Last-Page", Math.ceil(postCount / 10));

    ctx.body = posts.map((post) => ({
      ...post,
      body:
        post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    }));
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- 추가: 서버를 재실행 할 때마다 새로운 40개의 더미 데이터가 생성되어 부족한 만큼만 새로 생성하고 40개일 때는 생성하지 않는 코드
- src/createFakeDaga.js

```js
const Post = require("./models/post");

exports.createFakeData = async () => {
  // Post 모델을 사용하여 데이터베이스에서 포스트의 수를 확인
  const postCount = await Post.countDocuments();

  // 포스트 데이터가 40개 미만일 경우만 더미 데이터 생성
  if (postCount < 40) {
    const posts = [...Array(40 - postCount).keys()].map((i) => ({
      title: `포스트 #${postCount + i}`,
      body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent nec felis dapibus, 
      aliquet libero a, tincidunt nisl. Nunc maximus, justo at auctor lacinia, ipsum orci aliquam massa, 
      sit amet auctor justo velit eu mauris. Ut vitae efficitur mauris, sit amet sodales magna. Sed vehicula, 
      diam in porttitor placerat, nisi nisi consequat nisl, non auctor nunc lacus a dui. Vivamus consequat, 
      nulla non sodales molestie, ipsum eros vulputate mi, a consequat mi lorem a nunc. Pellentesque habitant 
      morbi tristique senectus et netus et malesuada fames ac turpis egestas.`,
      tags: ["가짜", "데이터"],
    }));

    try {
      const docs = await Post.insertMany(posts);
      console.log(`${docs.length}개의 포스트를 생성했습니다.`);
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("더미 데이터 생성을 건너뜁니다.");
  }
};
```

- REST API에 MongoDB 연동 편...
