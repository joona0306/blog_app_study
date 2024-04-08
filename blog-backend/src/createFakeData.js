const Post = require("./models/post");

exports.createFakeData = async () => {
  // Post 모델을 사용하여 데이터베이스에서 포스트의 수를 확인
  const postCount = await Post.countDocuments();

  // 포스트 데이터가 40개 미만일 경우만 더미 데이터 생성
  if (postCount < 40) {
    const posts = [...Array(40 - postCount).keys()].map(i => ({
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
