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
UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
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
UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
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

### 23.3.1 회원가입 구현하기

- src/api/auth/auth.ctrl.js - register 함수

```js
const User = require("../../models/user");
const Joi = require("joi");

/* 
POST /api/auth/register
{
  username: "velopert",
  password: "mypass123"
}
*/
exports.register = async (ctx) => {
  // 회원가입
  // Request Body 검증하기
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    // username이 이미 존재하는지 확인
    const exist = await User.findByUsername(username);
    if (exist) {
      ctx.status = 409; // Conflict
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 데이터베이스에 저장

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = user.serialize();
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- 함수의 마지막 부분에서 hashedPassword 필드가 응답되지 않도록 데이터를 JSON으로 변환한 후 delete로 해당 필드 삭제
- src/models/user.js - serialize

```js
UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};
```

- Postman에서 POST http://localhost:4000/api/auth/register 테스트 해보기
  {
  username: "test"
  password: "1234"
  }
- 같은 username으로 다시 요청 보내서 Conflict 에러 확인하기

### 23.3.2 로그인 구현하기

- src/api/auth/auth.ctrl.js - login

```js
/*
POST /api/auth/login
{
  username: "test",
  password: "1234"
}
*/
exports.login = async (ctx) => {
  // 로그인
  const { username, password } = ctx.request.body;

  // username, password가 없으면 에러처리
  if (!username || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }

  try {
    const user = await User.findByUsername(username);
    // 계정이 존재하지 않으면 에러 처리
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    // 잘못된 비밀번호
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- Postman에서 POST http://localhost:4000/api/auth/login 테스트 해보기
  {
  username: "test"
  password: "1234"
  }
- 없는 계정, 틀린 비밀번호로 테스트 해서 Unautorized 에러 확인하기

## 23.4 토큰 발급 및 검증하기

- 클라이언트에서 사용자 로그인 정보를 지니고 있을 수 있도록 서버에서 토큰을 발급해주자.
- JWT 토큰을 만들기 위해서는 jsonwebtoken 이라는 모듈을 설치해야한다.
- `yarn add jsonwebtoken`

### 23.4.1 비밀키 설정하기

- .env 파일에서 JWT_SECRET 값으로 설정 Windows에서는 아무 문자열이나 직접 입력, 문자열 길이는 자유
- 이 비밀키는 나중에 JWT 토큰의 서명을 만드는 과정에서 사용한다.
- **비밀키는 외부에 공개되면 절대로 안된다.** 공개 되는 순간, 누구든지 마음대로 JWT 토큰을 발급할 수 있기 때문이다.

### 23.4.2 토큰 발급하기

- 비밀키 설정 후 user 모델 파일에서 generateToken이라는 인스턴스 메서드를 만들자.
- src/models/user.js - generateToken

```js
// ...
const jwt = require("jsonwebtoken");

//...

UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    // 첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣는다.
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET, // 두 번째 파라미터에는 JWT 암호를 넣는다.
    {
      expiresIn: "7d", // 7일 동안 유효함
    }
  );
  return token;
};
```

- 이제 회원가입과 로그인에 성공했을 때 토큰을 사용자에게 전달 해주자.
- 사용자가 브라우저에서 토큰을 사용할 때는 주로 두 가지 방법을 사용한다.
- 첫 번째는 브라우저의 localStorage 혹은 sessionStorage에 담아서 사용하는 방법
- 두 번째는 브라우저의 쿠키에 담아서 사용하는 방법

- 브라우저의 localStorage 혹은 sessionStorage에 토큰을 담으면 사용하기가 매우 편리하고 구현하기 쉽다.
- 그러나 만약 누군가가 페이지에 악성 스크립트를 삽입한다면 쉽게 토큰을 탈취할 수 있다.
- 이러한 공격을 XXS(Cross Site Scripting)이라고 부른다.

- 쿠키에 담아도 같은 문제가 발생할 수 있지만, httpOnly라는 속성을 활성화하면
- 자바스크립트를 통해 쿠키를 조회할 수 없으므로 악성 스크립트로부터 안전하다.
- 그 대신 CSRF(Cross Site Request Forgery)라는 공격에 취약해질 수 있다.
- 이 공격은 토큰을 쿠키에 담으면 사용자가 서버로 요청을 할 때마다 무조건 토큰이 함께 전달되는 점을 이용해서
- 사용자가 모르게 원하지 않는 API 요청을 하게 만든다.
- 예를 들어 사용자가 자신도 모르는 상황에서 어떠한 글을 작성하거나 삭제하거나, 또는 탈퇴하게 만들 수도 있다.

- 단, CSRF는 CSRF 토큰 사용 및 Referer 검증 등의 방식으로 제대로 막을 수 있는 방법이 있다.

- 여기서는 토큰을 쿠키에 담아서 사용해보자

- src/api/auth/auth.ctrl.js - register, login

```js
/* 
POST /api/auth/register
{
  username: "test",
  password: "1234"
}
*/
exports.register = async (ctx) => {
  // 회원가입
  // Request Body 검증하기
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    // username이 이미 존재하는지 확인
    const exist = await User.findByUsername(username);
    if (exist) {
      ctx.status = 409; // Conflict
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // 데이터베이스에 저장

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (error) {
    ctx.throw(500, error);
  }
};

/*
POST /api/auth/login
{
  username: "test",
  password: "1234"
}
*/
exports.login = async (ctx) => {
  // 로그인
  const { username, password } = ctx.request.body;

  // username, password가 없으면 에러처리
  if (!username || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }

  try {
    const user = await User.findByUsername(username);
    // 계정이 존재하지 않으면 에러 처리
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    // 잘못된 비밀번호
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
    });
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- Postman으로 로그인 요청후 응답 부분의 Headers에서 Set-Cookie 확인

### 23.4.3 토큰 검증하기

- 사용자의 토큰을 확인한 후 검증하는 작업을 미들웨어를 통해서 처리해보자.
- src/lib/jwtMiddleware.js

```js
const jwt = require("jsonwebtoken");

const jwtMiddleware = (ctx, next) => {
  const token = ctx.cookies.get("access_token");
  if (!token) return next(); // 토큰이 없음
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    return next();
  } catch (error) {
    // 토큰 검증 실패
    return next();
  }
};

module.exports = jwtMiddleware;
```

- src/index.js

```js
require("dotenv").config();
const koa = require("koa");
// koa-router를 불러온 뒤
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");

const api = require("./api");
const jwtMiddleware = require("./lib/jwtMiddleware");
const { createFakeData } = require("./createFakeData");

// 구조분해 할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    createFakeData();
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
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

// PORT가 지정되어 있지 않다면 4000을 사용
const port = PORT || 4000;
app.listen(port, () => {
  console.log("Listening to port %d", port);
});
```

- Postman에서 GET http://localhost:4000/api/auth/check 요청 후 터미널 확인
- 현재 토큰이 해석된 결과가 터미널에 나타남

  {
  \_id: '6613c204b125e8552bc36b8d',
  username: 'test',
  iat: 1712573998,
  exp: 1713178798
  }

- 이렇게 해석된 결과를 이후 미들웨어에서 사용할 수 있게 하려면 ctx의 state 안에 넣어 주면 된다.
- src/lib/jwtMiddleware.js

```js
const jwt = require("jsonwebtoken");

const jwtMiddleware = (ctx, next) => {
  const token = ctx.cookies.get("access_token");
  if (!token) return next(); // 토큰이 없음
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.user = {
      _id: decoded._id,
      username: decoded.username,
    };
    // 콘솔에 토큰 정보를 출력하는 코드는
    // 이후 토큰이 만료되기 전에 재발급해 주는 기능을 구현해주고 나서 지우자.
    console.log(decoded);
    return next();
  } catch (error) {
    // 토큰 검증 실패
    return next();
  }
};

module.exports = jwtMiddleware;
```

- src/api/auth/auth.ctrl.js - check

```js
/*
GET /api/auth/check
*/
exports.check = async (ctx) => {
  // 로그인 상태 확인
  const { user } = ctx.state;
  if (!user) {
    // 로그인 중 아님
    ctx.status = 401; // Unauthorized
    return;
  }
  ctx.body = user;
};
```

### 23.4.4 토큰 재발급하기

{
\_id: '6613c204b125e8552bc36b8d',
username: 'test',
iat: 1712573998,
exp: 1713178798
}

- iat 값: 이 토큰이 언제 만들어졌는지 알려주는 값
- exp 값: 언제 만료되는지 알려주는 값

- exp에 표현된 날짜가 3.5일 미만이라면 토큰을 새로운 토큰으로 재발급해 주는 기능을 구현해 보자.
- src/lib/jwtMiddleware.js

```js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get("access_token");
  if (!token) return next(); // 토큰이 없음
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.user = {
      _id: decoded._id,
      username: decoded.username,
    };

    // 토큰의 남은 유효 기간이 3.5일 미만이면 재발급
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      ctx.cookies.set("access_token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: true,
      });
    }

    return next();
  } catch (error) {
    // 토큰 검증 실패
    return next();
  }
};

module.exports = jwtMiddleware;
```

### 23.4.5 로그아웃 기능 구현하기

- 쿠키를 지워 주는 것으로 로그아웃 구현
- src/api/auth/auth.ctrl.js - logout

```js
/*
POST /api/auth/logout
*/
exports.logout = async (ctx) => {
  // 로그아웃
  ctx.cookies.set("access_token");
  ctx.status = 204; // No Content
};
```

- Postman에서 POST http://localhost:4000/api/auth/logout 으로 테스트 하고 확인하기
- 이전에 만들었던 토큰의 유효기간이 3.5일이었기 때문에 한 번 더 재발급될 수도 있다.
- 그런 경우 로그아웃 API를 한 번 더 요청해서 확인해보자.

## 23.5 posts API에 회원 인증 시스템 도입하기

- 새 포스트는 이제 로그인해야만 작성할 수 있고, 삭제와 수정은 작성자만 할 수 있도록 구현해 보자.
- 각각의 함수를 직접 수정해서 이 기능을 구현할 수도 있으나 **미들웨어**를 만들어서 관리해보자.
- 또한, 각 포스트를 어떤 사용자가 작성했는지 알아야 하기 때문에 기존의 Post 스키마를 수정하자.

### 23.5.1 스키마 수정하기

- 스키마에 사용자 정보를 넣어주자.
- MongoDB에서는 필요한 데이터를 통째로 집어넣는다.
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
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
```

### 23.5.2 posts 컬렉션 비우기

- 이전에 생성한 데이터들은 더 이상 유효하지 않으므로 삭제
- Compass에서 posts 컬렉션 삭제
- src/index.js 에서 createFakeData() 함수 주석처리

### 23.5.3 로그인했을 때만 API를 사용할 수 있게 하기

- checkLoggedIn 미들웨어를 만들어서 로그인해야만 글쓰기, 수정, 삭제를 할 수 있도록 구현
- src/lib/checkLoggedIn.js

```js
const checkLoggedIn = (ctx, next) => {
  if (!ctx.state.user) {
    ctx.status = 401; // Unauthorized
    return;
  }
  return next();
};

module.exports = checkLoggedIn;
```

- checkLoggedIn 미들웨어 posts 라우터에서 사용하기
- src/api/posts/index.js

```js
const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");
const checkLoggedIn = require("../../lib/checkLoggedIn");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", checkLoggedIn, postsCtrl.write);
posts.get("/:id", postsCtrl.checkObjectId, postsCtrl.read);
// put 메서드 사용하지 않을거라서 삭제
posts.delete("/:id", checkLoggedIn, postsCtrl.checkObjectId, postsCtrl.remove);
posts.patch("/:id", checkLoggedIn, postsCtrl.checkObjectId, postsCtrl.update);

module.exports = posts;
```

### 23.5.4 포스트 작성 시 사용자 정보 넣기

- 로그인된 사용자만 포스트를 작성할 수 있게 했으니,
- 지금부터는 포스트를 작성할 때 사용자 정보를 넣어서 데이터베이스에 저장하도록 구현
- src/api/posts/posts.ctrl.js - write

```js
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
    user: ctx.state.user,
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
```

### 23.5.5 포스트 수정 및 삭제 시 권한 확인하기

- 작성자만 포스트를 수정하거나 삭제할 수 있도록 구현
- 이 작업을 미들웨어에서 처리하고 싶다면 id로 포스트를 조회하는 작업도 미들웨어로 해주어야 한다.
- 따라서 기존에 만들었던 checkObjectId를 getPostById로 바꾼다.
- 그리고 해당 미들웨어에서 id로 포스트를 찾은 후 ctx.state에 담아주자.

- src/api/posts/posts.ctrl.js - getPostById(기존 checkObjectId)

```js
exports.getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  try {
    const post = await Post.findById(id);
    // 포스트가 존재하지 않을 때
    if (!post) {
      ctx.status = 404; // Not Found
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (error) {
    ctx.throw(500, error);
  }
};
```

- src/api/posts/index.js 수정

```js
const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");
const checkLoggedIn = require("../../lib/checkLoggedIn");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", checkLoggedIn, postsCtrl.write);
posts.get("/:id", postsCtrl.getPostById, postsCtrl.read);
// put 메서드 사용하지 않을거라서 삭제
posts.delete("/:id", checkLoggedIn, postsCtrl.getPostById, postsCtrl.remove);
posts.patch("/:id", checkLoggedIn, postsCtrl.getPostById, postsCtrl.update);

module.exports = posts;
```

- src/api/posts/posts.ctrl.js - read 간소화

```js
/* 특정 포스트 조회
GET /api/posts/:id
*/
exports.read = async (ctx) => {
  ctx.body = ctx.state.post;
};
```

- checkOwnPost 미들웨어 작성
- 이 미들웨어는 id로 찾은 포스트가 로그인 중인 사용자가 작성한 포스트인지 확인해 준다.
- 만약 사용자의 포스트가 아니라면 403 에러를 발생 시킨다.

- src/api/posts/posts.ctrl.js - checkOwnPost

```js
exports.checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  // MongoDB에서 조회한 데이터의 id 값을 문자열과 비교할 때는
  // 반드시 .toString()을 해주어야 한다.
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};
```

- 이 미들웨어를 수정 및 삭제 API에 적용, checkLoggedIn 다음 미들웨어로 등록해 주어야 한다.
- 여기서 코드 리팩토링 진행 되었음 (교재 668p 참고)
- src/api/posts/index.js

```js
const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");
const checkLoggedIn = require("../../lib/checkLoggedIn");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", checkLoggedIn, postsCtrl.write);

const post = new Router(); // /api/posts/:id

post.get("/", postsCtrl.read);
post.delete("/", checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.remove);
post.patch("/", checkLoggedIn, postsCtrl.checkOwnPost, postsCtrl.update);

posts.use("/:id", postsCtrl.getPostById, post.routes());

module.exports = posts;
```

- 새로운 계정을 만든다음 다른 계정으로 작성된 포스트 테스트 해보기
- 403 Forbidden 에러 확인하기

## 23.6 username/tags로 포스트 필터링하기

- 특정 사용자가 작성한 포스트만 조회하거나 특정 태그가 있는 포스트만 조회하는 기능을 만들어보자
- src/api/posts/posts.ctrl.js - list

```js
/* 포스트 목록 조회
GET /api/posts?username=&tag=&page=
*/
exports.list = async (ctx) => {
  // query는 문자열이기 때문에 숫자로 변환해 주어야 한다.
  // 값이 주어지지 않았다면 1을 기본으로 사용한다.
  const page = parseInt(ctx.query.page || "1", 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  // tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
  const query = {
    ...(username ? { "user.username": username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    // find()함수를 호출한 후에는 exec()를 붙여 주어야 서버에 쿼리를 요청한다.
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(10)
      .skip((page - 1) * 10)
      .lean()
      .exec();

    const postCount = await Post.countDocuments(query).exec();

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
