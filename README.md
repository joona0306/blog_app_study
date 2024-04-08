# 23. JWT를 통한 회원 인증 시스템 구현하기

## 23.1 JWT의 이해

- JSON Web Token의 약자로 JSON으로 이루어져 있는 토큰을 의미한다.
- 두 개체가 서로 안전하게 정보를 주고받을 수 있도록 웹 표준으로 정의된 기술

### 23.1.1 세션 기반 인증과 토큰 기반 인증의 차이

#### 23.1.1.1 세션 기반 인증 시스템

- 교재 684p 참고

#### 23.1.1.2 토큰 기반 인증 시스템

- 토큰은 로그인 이후 서버가 만들어 주는 문자열이다.
- 해당 문자열 안엔느 사용자의 로그인 정보가 들어 있고, 해당 정보가 서버에서 발급되었음을 증명하는 서명이 들어있다.
- 서명 데이터는 해싱 알고리즘을 통해 만들어진다. 주로 HMAC SHA256 혹은 RSA SHA256 알고리즘이 사용됨

- 토큰 기반 인증 시스템
  사용자 ======로그인======> 서버
  사용자 <====토큰 발급===== 서버
  사용자 =토큰과 함께 요청=> 서버(토큰 유효성 검사)
  사용자 <======응답======= 서버(토큰 유효성 검사)

- 서버에서 만들어 준 토큰은 서명이 있기 때문에 무결성이 보장된다.
- 무결성이란 정보가 변경되거나 위조되지 않았음을 의미하는 성질이다.
- 사용자가 로그인하면 서버에서 사용자에게 해당 사용자의 정보를 지니고 있는 토큰을 발급해 주고,
- 추후 사용자가 다른 API를 요청하게 될 때 발급받은 토큰과 함께 요청하게 된다.
- 그러면 서버는 해당 토크이 유효한지 검사하고, 결과에 따라 작업을 처리하고 응답한다.

- 토큰 기반 인증 시스템의 장점은 서버에서 사용자 로그인 정보를 기억하기 위해 사용하는 리소스가 적다는 것이다.
- 사용자 쪽에서 로그인 상태를 지닌 토큰을 가지고 있으므로 서버의 확장성이 매우 높다.
- 서버의 인스턴스가 여러 개로 늘어나도 서버끼리 사용자의 로그인 상태를 공유하고 있을 필요가 없다.

1. User 스키마/모델 만들기
2. 회원 인증 API 만들기
3. 토큰 발급 및 검증하기
4. posts API에 회원 인증 시스템 도입하기
5. username/tags로 포스트 필터링하기

## 23.2 User 스키마/모델 만들기

- User 스키마와 모델을 작성하여 사용자의 정보를 MongoDB에 담고 조회해보자
- 앞으로 만들 사용자 스키마에는 사용자 계정명과 비밀번호가 필요하다.

- 비밀번호를 데이터베이스에 저장할 때 플레인(아무런 가공도 하지 않은) 텍스트로 저장하면 보안상 위험하다.
- 단방향 해싱 함수를 지원해 주는 bcrypt라는 라이브러리를 사용하여 비밀번호를 안전하게 저장해보자.

- src/models/user.js

```js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
```

- `yarn add bcrypt`

### 23.2.1 모델 메서드 만들기

- 모델 메서드는 모델에서 사용할 수 있는 함수를 의미한다. 두 가지 종류가 있다.
- 첫 번째: 인스턴스 메서드, 모델을 통해 만든 문서 인스턴스에서 사용할 수 있는 함수를 의미

```js
const user = new User({ username: "velopert" });
user.setPassword("mypass123");
```

- 두 번째: 스태틱(static) 메서드, 모델에서 바로 사용할 수 있는 함수를 의미

```js
const user = User.findByUsername("velopert");
```

#### 23.2.1.1 인스턴스 메서드 만들기

- 두 개의 인스턴스 메서드를 만들어보자
- 첫 번째 메서드 setPassword : 비밀번호를 파라미터로 받아서 계정의 hashedPassword 값을 설정해 준다.
- 두 번째 메서드 checkPassword : 파라미터로 받은 비밀번호가 해당 계정의 비밀번호와 일치하는지 검증해 준다.

- src/models/user.js

```js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 인스턴스 메서드를 작성할 때는 화살표 함수가 아닌 function 키워드 사용하 구현해야 한다.
// 함수 내부에서 this에 접근해야 하기 때문이다.
// 여기서 this는 문서 인스턴스를 가리킨다.
UserSchema.method.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.method.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // true / false
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
```

### 23.2.2 스태틱 메서드 만들기

- findByUsername 이라는 메서드 작성
- 이 메서드는 username으로 데이터를 찾을 수 있게 해준다.

- src/models/user.js

```js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 인스턴스 메서드를 작성할 때는 화살표 함수가 아닌 function 키워드 사용하 구현해야 한다.
// 함수 내부에서 this에 접근해야 하기 때문이다.
// 여기서 this는 문서 인스턴스를 가리킨다.
UserSchema.method.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.method.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // true / false
};

UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
```

## 23.3 회원 인증 API 만들기

- 먼저 새로운 라우트 정의
- src/api/auth/auth.ctrl.js

```js
exports.register = async (ctx) => {
  // 회원가입
};

exports.login = async (ctx) => {
  // 로그인
};

exports.check = async (ctx) => {
  // 로그인 상태 확인
};

exports.logout = async (ctx) => {
  // 로그아웃
};
```

- src/api/auth/index.js

```js
const Router = require("koa-router");
const authCtrl = require("./auth.ctrl");

// auth 라우터 생성
const auth = new Router();

auth.post("/register", authCtrl.register);
auth.post("/login", authCtrl.login);
auth.get("/check", authCtrl.check);
auth.post("/logout", authCtrl.logout);

module.exports = auth;
```

- auth 라우터를 api 라우터에 적용
- src/api/index.js

```js
const Router = require("koa-router");
const posts = require("./posts");
const auth = require("./auth");

const api = new Router();

api.use("/posts", posts.routes());
api.use("/auth", auth.routes());

// 라우터를 내보냄
module.exports = api;
```
