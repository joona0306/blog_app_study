const Post = require("../../models/post");
const mongoose = require("mongoose");
const Joi = require("joi");

const { ObjectId } = mongoose.Types;

exports.checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }
  return next();
};

/* 포스트 작성
POST /api/posts
{title, body}
*/
exports.write = async ctx => {
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

/* 포스트 목록 조회
GET /api/posts
*/
exports.list = async ctx => {
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

    ctx.body = posts.map(post => ({
      ...post,
      body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    }));
  } catch (error) {
    ctx.throw(500, error);
  }
};

/* 특정 포스트 조회
GET /api/posts/:id
*/
exports.read = async ctx => {
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

/* 특정 포스트 제거
DELETE /api/posts/:id
*/
exports.remove = async ctx => {
  const { id } = ctx.params;
  // 해당 id를 가진 post가 몇 번째인지 확인한다.
  try {
    await Post.findByIdAndDelete(id).exec();
    ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없음)
  } catch (error) {
    ctx.throw(500, error);
  }
};

/* 포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{
  title: "수정",
  body: "수정 내용",
  tags: ["수정", "태그"]
} 
*/
exports.update = async ctx => {
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
