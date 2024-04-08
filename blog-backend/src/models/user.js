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
