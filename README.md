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

#### 21.5.3 REST API

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

#### 중간 용어 정리

- 라우트 : URL 경로에 따라 특정 페이지나 컨텐츠를 보여주는 규칙
- 라우터 : 라우트들을 관리하고, 요청받은 URL에 따라 적절한 라우트로 연결해주는 시스템

#### 21.5.4 라우트 모듈화

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
