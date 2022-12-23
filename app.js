const express = require("express");
const app = express();
const router = express.Router();

const { Op } = require("sequelize");
const { User, Comment } = require("./models");
const jwt = require("jsonwebtoken")

const authMiddleware = require("./middlewares/auth-middleware");
app.use(express.json());

// 회원가입 API
router.post("/users", async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  // 닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성 
  const nickCheck = /(?=.*\d)(?=.*[a-zA-Z])/
  if (nickname.length < 3 || !nickCheck.test(nickname)) {
    res.status(400).send({
      errorMessage: "닉네임은 최소 3자 이상, 알파벳 대소문자, 숫자로 구성해야 합니다.",
    });
    return;
  }

  // 비밀번호는 최소 4자 이상, 닉네임과 같은 값이 포함된 경우 실패
  if (password.length < 4 || password.includes(nickname)) {
    res.status(400).send({
      errorMessage: "패스워드는 최소 4자 이상, 닉네임과 같은 값이 포함되지 않아야 합니다.",
    });
    return;
  }

  // 비밀번호 확인은 비밀번호와 정확하게 일치하기
  if (password !== confirmPassword) {
    res.status(400).send({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    });
    return;
  }

  // nickname이 동일한게 이미 있는지 확인하기 위해 가져온다.   
  const existsUsers = await User.findAll({
    where:
      {nickname}},
    );
  if (existsUsers.length) {
    res.status(400).send({
      errorMessage: "중복된 닉네임입니다.",
    });
    return;
  }

  await User.create({ email, nickname, password });
  res.status(201).send({message: "회원가입 성공"});
});


// 로그인 API
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;

  const user = await User.findOne({ where: { nickname, password } });

  if (!user) {
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드가 잘못됐습니다.",
    });
    return;
  }

  const token = jwt.sign({ userId: user.userId }, "customized-secret-key");
  res.send({
    token,
  });
});

// 댓글 목록 조회 API
router.get("/comments/:postId", async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.findAll({ where: { postId } });
  res.status(201).json({comments});
});


// 댓글 작성 API
router.post('/comments/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  if (content.length == 0){
      return res.status(400).json({
          errorMessage: '댓글 내용을 입력해주세요'
      })
  }

  const createdComments = await Comment.create({nickname, password, content, postId});
  res.json({comments: createdComments})
})

// 댓글 수정 API

// 댓글 삭제  API


router.get('/users/me', authMiddleware, async (req, res) =>{
    res.json({user: res.locals.user});
})


app.use("/api", express.urlencoded({ extended: false }), router);

app.listen(8080, () => {
console.log("서버가 요청을 받을 준비가 됐어요");
});