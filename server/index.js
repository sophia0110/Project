const express = require("express");
const app = express(); // create express app
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "final_project",
});

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    withCredentials: false,
    credentials: true,
  })
); //跨來源資料共用
// app.use(express.json()); //用來解析json檔，因為前端回傳的是json object = app.use(bodyParser.son())
app.use(express.json({ limit: "50MB" }));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 100000,
  })
);

//////////////活動部分//////////////
//活動相簿
app.get("/api/event/album/:id?", (req, res) => {
  const sqlSelect = `SELECT photo.*, member.member_name AS member_name FROM photo JOIN member ON photo.member_id = member.member_id WHERE photo.event_id=${req.params.id} AND photo.valid=1 AND photo.photo_show=1`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//加入活動照片
app.put("/api/event/eventaddphoto", (req, res) => {
  const sqlUpdate = `UPDATE photo SET photo_show = 1 WHERE photo_id IN (${req.query.photoId})`;
  db.query(sqlUpdate, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});
//移除活動相片
app.put("/api/event/eventdeletephoto", (req, res) => {
  const sqlUpdate = `UPDATE photo SET photo_show = 0 WHERE photo_id IN (${req.query.photoId})`;
  db.query(sqlUpdate, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
});

//會員相簿照片
app.get("/api/event/memberalbum", (req, res) => {
  const eventId = req.query.eventId;
  const memberId = req.query.memberId;
  const sqlSelect = `SELECT photo.*, member.member_name AS member_name FROM photo JOIN member ON photo.member_id = member.member_id WHERE photo.event_id=${eventId} AND photo.member_id = ${memberId} AND photo.valid=1`;
  console.log(sqlSelect);
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//活動詳細頁資訊(單筆資料)
app.get("/api/event/:id?", (req, res) => {
  const sqlSelect = `SELECT event.*, event_type.event_type_name AS event_type_name, event_theme.event_theme_name AS event_theme_name, member.member_name AS event_host_name, member.member_img AS event_host_img FROM event JOIN event_type ON event.event_type = event_type.event_type_id JOIN event_theme ON event.event_theme = event_theme.event_theme_id JOIN member ON event.event_host_id = member.member_id WHERE event_id = ${req.params.id}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//活動標籤(用在橫版卡片)
app.get("/api/eventtags/:id?", (req, res) => {
  const sqlSelect = `SELECT event_tags_relate.*, event_tags.tags_name AS tags_name FROM event_tags_relate JOIN event_tags ON event_tags_relate.event_tags_tags_id = event_tags.tags_id WHERE event_tags_relate.event_tags_event_id = ${req.params.id}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//活動詳細頁輪播
app.get("/api/eventsearch/relative", (req, res) => {
  // console.log(req.query.id, req.query.theme);
  const sqlSelect = `SELECT event.*,event_type.event_type_name AS event_type_name,event_theme.event_theme_name AS event_theme_name FROM event JOIN event_type ON event.event_type = event_type.event_type_id JOIN event_theme ON event.event_theme = event_theme.event_theme_id WHERE event_theme = (${req.query.theme}) and event_id <> (${req.query.id}) ORDER BY RAND() LIMIT 6`;
  // console.log(sqlSelect);
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//活動搜尋頁頁資訊(單筆資料)
app.get("/api/eventsearch", (req, res) => {
  // res.send(req.query.id);
  const today = converter(new Date());
  function converter(D) {
    let dateTime = new Date(D);
    let yyyy = dateTime.getFullYear();
    let mm = dateTime.getMonth() + 1;
    let dd = dateTime.getDate();
    let tt = "23:59:59";

    dateTime = String(yyyy + "/" + mm + "/" + dd + " " + tt);
    return dateTime;
  }

  const where = [];
  if (req.query.searchbar)
    where.push(`event.event_name like '%${req.query.searchbar}%'`);
  if (req.query.locate) where.push(`event.event_city = ${req.query.locate}`);
  if (req.query.time)
    where.push(
      `event.event_start_time BETWEEN '${today}' AND '${converter(
        req.query.time
      )}'`
    );
  if (req.query.theme) where.push(`event.event_theme = ${req.query.theme}`);
  if (req.query.type) where.push(`event.event_type = ${req.query.type}`);
  if (req.query.tag) where.push(`event.event_id IN (${req.query.tag})`);

  const whereSql = where.length > 0 ? " WHERE " + where.join(" AND ") : "";

  const sqlSelect = `SELECT event.*,event_type.event_type_name AS event_type_name, event_theme.event_theme_name AS event_theme_name FROM event JOIN event_type ON event.event_type = event_type.event_type_id JOIN event_theme ON event.event_theme = event_theme.event_theme_id ${whereSql} AND event.event_start_time BETWEEN '${today}' AND '2025/12/31 23:59:59'`;
  // console.log(sqlSelect);
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//取得有標籤的id
app.get("/api/eventtag", (req, res) => {
  const sqlSelect = `SELECT event_tags_relate.event_tags_event_id FROM event_tags_relate JOIN event_tags ON event_tags_relate.event_tags_tags_id = event_tags.tags_id WHERE event_tags.tags_name="${req.query.tag}"`;

  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//活動詳細頁(參加者資訊)
app.get("/api/attendants", (req, res) => {
  // console.log(req.query.id);
  const sqlSelect = `SELECT member_id,member_name,member_img FROM member WHERE member_id IN (${req.query.id})`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//活動頁留言板寫入資料
app.post("/api/comment", (req, res) => {
  const commentEventId = req.body.commentEventId;
  const commentMemberId = req.body.commentMemberId;
  const commentContent = req.body.commentContent;
  const commentTime = req.body.commentTime;

  const sqlInsert =
    "INSERT INTO event_comment (comment_event_id, comment_member_id,comment_content,comment_time) VALUES (?,?,?,NOW())";
  // console.log(sqlInsert);
  db.query(
    sqlInsert,
    [commentEventId, commentMemberId, commentContent, commentTime],
    (err, result) => {
      console.log(err);
    }
  );
});

//活動頁留言板獲取資料
app.get("/api/get/comment/:id?", (req, res) => {
  const sqlSelect = `SELECT event_comment.*,member.member_name AS member_name, member.member_img AS member_img FROM event_comment JOIN member ON event_comment.comment_member_id = member.member_id  WHERE comment_event_id =${req.params.id} ORDER BY comment_time`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//獲得訂單(參與者頁面用)
app.get("/api/eventorder", (req, res) => {
  const sqlSelect = `SELECT * FROM s_event WHERE vaild = ${req.query.valid}`;
  // console.log(sqlSelect);
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//收藏
app.post("/api/save", (req, res) => {
  const likeEventId = req.body.likeEventId;

  const likeMemberId = req.body.likeMemberId;

  const memberLike = 1;

  const sqlInsert =
    "INSERT INTO like_event (member_id,event_id,member_like) VALUES (?,?,?)";
  db.query(
    sqlInsert,
    [likeMemberId, likeEventId, memberLike],
    (err, result) => {
      console.log(err);
    }
  );
});
//刪除收藏
app.delete("/api/delete", (req, res) => {
  const eventId = req.query.eventId;
  const memId = req.query.memId;
  const sqlDelete = `Delete FROM like_event WHERE event_id=${eventId} AND member_id=${memId}`;
  db.query(sqlDelete, (err, result) => {
    if (err) console.log(err);
  });
});

//查是否有收藏
app.get("/api/save", (req, res) => {
  const eventId = req.query.eventId;
  const memId = req.query.memId;
  const sqlSelect = `SELECT * FROM like_event WHERE event_id=${eventId} AND member_id=${memId}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//////////////首頁部分//////////////
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cookieParser());

// 圖片base64需要改最大容量

// app.use(
//   cors({
//     origin: ["http://localhost:3000"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
// 圖片base64需要改最大容量

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24 * 60,
    },
  })
);

// 註冊資料進資料庫
app.post("/register", (req, res) => {
  // console.log(req.body.username);

  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const birthDate = req.body.birthDate;
  const sex = req.body.sex;
  const exp = req.body.exp;

  db.query(
    "INSERT INTO member (member_name, member_account, member_password, member_email, member_birthday, member_gender, member_ex, valid) VALUES (?,?,?,?,?,?,?,?)",
    [name, username, password, email, birthDate, sex, exp, "1"],
    (err, result) => {
      console.log(err);
    }
  );

  res.send("i got u");
});

// 登入/登出 session取得+ loggedin切換
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});
app.get("/logout", (req, res) => {
  if (req.session.user) {
    res.clearCookie("userId");
    res.send({ loggedIn: false });
  }
});

// 登入驗證
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM member WHERE member_account = ? AND member_password = ?",
    [username, password],
    (err, result) => {
      // console.log({ err: err });

      if (result.length > 0) {
        req.session.user = result;
        // console.log(req.session.user);
        res.send(result);
      } else {
        res.send({ message: "錯誤的帳號或密碼" });
      }
    }
  );
});

// 發起活動頁進資料庫
app.post("/eventform", (req, res) => {
  // console.log(JSON.stringify(req.body.event_host_contact));

  const event_host_contact = JSON.stringify(req.body.event_host_contact);
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const actlocaction = req.body.actlocaction;
  const actcity = req.body.actcity;
  const actexactlocaction = req.body.actexactlocaction;
  const actclump = req.body.actclump;
  const actexactclump = req.body.actexactclump;
  const actsignupdead = req.body.actsignupdead;
  const actprice = req.body.actprice;
  // const actpricemethod = req.body.actpricemethod;
  const actpeople = req.body.actpeople;
  const actpeopleline = req.body.actpeopleline;
  const acttitle = req.body.acttitle;
  const acttheme = req.body.acttheme;
  const actdetail = req.body.actdetail;
  const acttags = req.body.acttags;

  const actupload = req.body.actupload;

  const memberid = req.body.memberid;

  // console.log(memberid);
  res.send("no way");

  db.query(
    "INSERT INTO event_tags (tags_name) VALUES (?)",
    [acttags],
    (err, result) => {
      console.log(err);
    }
  );
  // 發起活動頁進資料庫
  db.query(
    "INSERT INTO event (event_host_contact, event_start_time, event_end_time, event_location, event_city, event_address, event_meeting_point, event_meeting_address, event_deadline_date, event_fees, event_valid_attendents, event_limit_number, event_name, event_theme, event_details,event_photo, event_host_id ,event_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      event_host_contact,
      startDate,
      endDate,
      actlocaction,
      actcity,
      actexactlocaction,
      actclump,
      actexactclump,
      actsignupdead,
      actprice,
      actpeople,
      actpeopleline,
      acttitle,
      acttheme,
      actdetail,
      actupload,
      memberid,
      "2",
    ],
    (err, result) => {
      console.log(err);
    }
  );
});

// 城市map
app.get("/cityya", (req, res) => {
  db.query("SELECT * FROM event_city WHERE 1", (err, result) => {
    // console.log(result);
    res.send(result);
  });
});

// 標籤map
app.get("/tagss", (req, res) => {
  db.query("SELECT * FROM event_theme WHERE 1", (err, result) => {
    // console.log(result);
    res.send(result);
  });
});

// 現在測試用event資料表 之後要用關聯式
app.get("/eventstartdata/get/:id", (req, res) => {
  const sqlselect = `SELECT * FROM event WHERE event_id = ${req.params.id}`;
  db.query(sqlselect, (err, result) => {
    res.send(result);
    // console.log(result);
  });
});

//////////////課程部分//////////////
const orderby = [
  "",
  "ORDER BY class_start_date DESC",
  "ORDER BY class_price ASC",
  "ORDER BY class_price DESC",
];

// 接收主題篩選及排序的資料
app.get("/class/category", (req, res) => {
  const sqlSelect = `SELECT main_class.*,class_theme.class_theme_name FROM main_class INNER JOIN class_teacher ON main_class.class_teacher_id = class_teacher.class_teacher_id INNER JOIN class_theme ON main_class.class_theme_id = class_theme.class_theme_id WHERE class_theme_name IN (${
    req.query.theme
  }) ${orderby[+req.query.orderby]} 
  `;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

// 接收商品頁下方的推薦主題商品
app.get("/class/theme", (req, res) => {
  const sqlSelect = `SELECT main_class.*,class_theme.class_theme_name FROM main_class INNER JOIN class_teacher ON main_class.class_teacher_id = class_teacher.class_teacher_id INNER JOIN class_theme ON main_class.class_theme_id = class_theme.class_theme_id WHERE class_theme_name IN (${req.query.theme}) LIMIT 6
  `;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

// 商品頁面資料
app.get("/class/:id", (req, res) => {
  const sqlSelect = `SELECT main_class.*,class_teacher.*,class_theme.class_theme_name FROM main_class INNER JOIN class_teacher ON main_class.class_teacher_id = class_teacher.class_teacher_id INNER JOIN class_theme ON main_class.class_theme_id = class_theme.class_theme_id WHERE class_id = ${req.params.id}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

// 刪除我的收藏
app.delete("/class/delete", (req, res) => {
  const cId = req.query.classId;
  const mId = req.query.memberId;
  const sqlDelete = `DELETE FROM like_class WHERE member_id=${mId} AND class_id=${cId}`;
  // console.log(sqlDelete);
  db.query(sqlDelete, (err, result) => {
    console.log(result);
    res.json({
      state: "success",
    });
  });
});

// 加入我的收藏
app.post("/class/favorites", (req, res) => {
  const member_id = req.body.member_id;
  const class_id = req.body.class_id;
  const member_like = req.body.member_like;
  const sqlInsert =
    "INSERT INTO like_class (member_id,class_id,member_like) VALUES (?,?,?)";
  // console.log(sqlInsert)
  db.query(sqlInsert, [member_id, class_id, member_like], (err, result) => {
    console.log(result);
    res.json({
      state: "success",
    });
  });
});

// 接收所有課程的資料
app.get("/class", (req, res) => {
  const sqlSelect = `SELECT main_class.*,class_theme.class_theme_name FROM main_class INNER JOIN class_teacher ON main_class.class_teacher_id = class_teacher.class_teacher_id INNER JOIN class_theme ON main_class.class_theme_id = class_theme.class_theme_id
  `;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

//////////////會員部分//////////////
app.post("/member/coupon", (req, res) => {
  const coupon_id = req.body.coupon_id;
  const member_id = req.body.member_id;
  const valid = 1;
  const sqlInsert =
    "INSERT INTO coupon_related (coupon_id ,member_id,valid) VALUES (?,?,?) ";
  console.log(sqlInsert);
  db.query(sqlInsert, [coupon_id, member_id, valid], (err, result) => {
    if (err) console.log(err);
    console.log(result);
    res.json({ state: "success" });
  });
});

app.post("/member/photo", (req, res) => {
  const member_id = req.body.member_id;
  const event_id = req.body.event_id;
  const photo_show = 1;
  const photo_name = req.body.photo_name;
  const valid = 1;
  const c_date = new Date();
  const sqlInsert =
    "INSERT INTO photo (member_id ,event_id,photo_show,photo_name,valid,c_date) VALUES (?,?,?,?,?,?) ";
  console.log(sqlInsert);
  db.query(
    sqlInsert,
    [member_id, event_id, photo_show, photo_name, valid, c_date],
    (err, result) => {
      if (err) console.log(err);
      // console.log(result);
    }
  );
});

app.get("/member/get/coupon/new/:id", (req, res) => {
  // const sqlSelect=`SELECT * FROM coupon_main WHERE NOT FIND_IN_SET(${req.params.id}, given_member_id) > 0`;
  const sqlSelect = `SELECT * 
  FROM coupon_main 
  WHERE coupon_id NOT IN (
    SELECT coupon_id FROM coupon_related
      WHERE coupon_related.member_id = ${req.params.id}
      AND valid = 1
  ) `;
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/member/get/coupon/:id", (req, res) => {
  // const sqlSelect=`SELECT * FROM coupon_main WHERE NOT FIND_IN_SET(${req.params.id}, given_member_id) > 0`;
  const sqlSelect = `SELECT * 
  FROM coupon_main 
  WHERE coupon_id IN (
    SELECT coupon_id FROM coupon_related
      WHERE coupon_related.member_id = ${req.params.id}
      AND valid = 1
  ) `;
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/member/get/collection/class/:id", (req, res) => {
  const sqlSelect = ` SELECT * FROM like_class INNER JOIN main_class ON like_class.class_id=main_class.class_id  WHERE member_id  = ${req.params.id}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});
app.get("/member/get/collection/event/:id", (req, res) => {
  const sqlSelect = ` SELECT * FROM like_event INNER JOIN event ON like_event.event_id=event.event_id  WHERE member_id  = ${req.params.id}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/event_host/:id", (req, res) => {
  const sqlSelect = ` SELECT * FROM event WHERE event_host_id  = ${req.params.id} AND event_start_time >=NOW() `;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/event_host/finish/:id", (req, res) => {
  const sqlSelect = ` SELECT * FROM event WHERE event_host_id  = ${req.params.id} AND event_start_time <=NOW() `;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/history/event/:id", (req, res) => {
  const sqlSelect = ` SELECT s_event.event_id, s_event.id FROM s_event WHERE id = ${req.params.id}  AND vaild= 1 `;

  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/history/event/att", (req, res) => {
  console.log(req.query.id);
  const sqlSelect = ` SELECT * FROM event WHERE event_id IN (${req.query.id}) AND event_start_time < NOW()  `;
  console.log(sqlSelect);
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/history/event/att/mem", (req, res) => {
  console.log(req.query.id);
  const sqlSelect = ` SELECT member_id,member_name,member_img FROM member WHERE member_id IN (${req.query.id}) `;
  console.log(sqlSelect);
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/history/class/:id", (req, res) => {
  const sqlSelect = ` SELECT s_class.class_id, s_class.id FROM s_class WHERE id = ${req.params.id}  AND vaild= 1`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/history/class/att", (req, res) => {
  // console.log(req.query.id)
  const sqlSelect = ` SELECT * FROM main_class WHERE class_id IN (${req.query.id}) AND class_end_date < CURDATE()  `;
  // console.log(sqlSelect)
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});
app.get("/member/get/order/event/:id", (req, res) => {
  const sqlSelect = ` SELECT  * FROM  s_event WHERE id  = ${req.params.id} AND order_paid=1  AND vaild= 1`;

  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/order/event/att", (req, res) => {
  // console.log(req.query.id)
  const sqlSelect = ` SELECT event_id,event_name,event_location,event_start_time,event_end_time,event_address,event_photo FROM event WHERE event_id IN (${req.query.id})   `;
  // console.log(sqlSelect)
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/order/class/:id", (req, res) => {
  const sqlSelect = ` SELECT  * FROM  s_class WHERE id  = ${req.params.id} AND order_paid=1 AND vaild= 1`;

  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/order/class/att", (req, res) => {
  // console.log(req.query.id)
  const sqlSelect = ` SELECT class_id,class_name,class_place,class_start_date,class_end_date,class_address,class_main_pic FROM main_class WHERE class_id IN (${req.query.id})   `;
  // console.log(sqlSelect)
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/order/event/pay/:id", (req, res) => {
  const sqlSelect = ` SELECT  * FROM  s_event WHERE id  = ${req.params.id} AND order_paid=0  AND vaild= 1`;

  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/order/event/pay/att", (req, res) => {
  // console.log(req.query.id)
  const sqlSelect = ` SELECT event_id,event_name,event_location,event_start_time,event_end_time,event_address,event_photo FROM event WHERE event_id IN (${req.query.id})   `;
  // console.log(sqlSelect)
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/order/class/pay/:id", (req, res) => {
  const sqlSelect = ` SELECT * FROM  s_class WHERE id  = ${req.params.id} AND order_paid = 0  AND vaild= 1`;

  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/order/class/pay/att", (req, res) => {
  // console.log(req.query.id)
  const sqlSelect = ` SELECT class_id,class_name,class_place,class_start_date,class_end_date,class_address,class_main_pic FROM main_class WHERE class_id IN (${req.query.id})   `;
  // console.log(sqlSelect)
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/score/:id", (req, res) => {
  const sqlSelect = ` SELECT * FROM score INNER JOIN member ON score.member_id = member.member_id WHERE score.toscore_id  = ${req.params.id}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/score/mem/:id", (req, res) => {
  const sqlSelect = `SELECT * FROM score INNER JOIN member ON score.toscore_id = member.member_id WHERE score.member_id = ${req.params.id}`;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.get("/member/get/event/photo", (req, res) => {
  const member_id = req.body.member_id;
  console.log(member_id);
  const sqlSelect = ` SELECT * FROM photo INNER JOIN event ON photo.event_id = event.event_id WHERE photo.event_id IN (${req.query.id}) AND  photo.member_id = (${req.query.member}) AND valid=1`;
  console.log(sqlSelect);
  db.query(sqlSelect, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

//取得會員基本資料
app.get("/member/get/:id", (req, res) => {
  const sqlSelect = ` SELECT * FROM member WHERE member_id  = ${req.params.id}  `;
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.put("/member/update/photo", (req, res) => {
  const valid = 0;
  const photo_id = req.body.photo_id;
  const sqlUpdate = "UPDATE photo SET valid=? WHERE photo_id IN (?) ";

  console.log(sqlUpdate);
  db.query(sqlUpdate, [valid, photo_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/member/update/classorder", (req, res) => {
  const vaild = 0;
  const order_id = req.body.order_id;
  const sqlUpdate = "UPDATE s_class SET vaild=? WHERE order_id=? ";
  console.log(sqlUpdate);
  db.query(sqlUpdate, [vaild, order_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/member/update/eventorder", (req, res) => {
  const vaild = 0;
  const order_id = req.body.order_id;
  const sqlUpdate = "UPDATE s_event SET vaild=? WHERE order_id=? ";
  console.log(sqlUpdate);
  db.query(sqlUpdate, [vaild, order_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/member/update/img", (req, res) => {
  const member_id = req.body.member_id;
  const member_img = req.body.member_img;
  const sqlUpdate = "UPDATE member SET member_img=?  WHERE member_id=?";
  db.query(sqlUpdate, [member_img, member_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/member/update", (req, res) => {
  const member_id = req.body.member_id;
  const member_name = req.body.member_name;
  const member_phone = req.body.member_phone;
  // const member_birthday= req.body.member_birthday;
  const member_ex = req.body.member_ex;
  const member_about = req.body.member_about;
  const sqlUpdate =
    "UPDATE member SET member_name=?,member_phone=?,member_ex=?, member_about=?  WHERE member_id=?";
  db.query(
    sqlUpdate,
    [member_name, member_phone, member_ex, member_about, member_id],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.put("/member/update/passwordpass", (req, res) => {
  const member_id = req.body.member_id;
  const member_password = req.body.passwordConfirmation;
  const sqlUpdate = "UPDATE member SET member_password=?  WHERE member_id=?";
  db.query(sqlUpdate, [member_password, member_id], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/member/score", (req, res) => {
  const member_id = req.body.member_id;
  const event_id = req.body.event_id;
  const toscore_id = req.body.toscore_id;
  const rating = req.body.rating;
  const rating_evaluate = req.body.rating_evaluate;
  const c_date = new Date();
  const sqlInsert =
    "INSERT INTO score (member_id ,event_id,toscore_id,rating,rating_evaluate,c_date) VALUES (?,?,?,?,?,?) ";
  console.log(sqlInsert);
  db.query(
    sqlInsert,
    [member_id, event_id, toscore_id, rating, rating_evaluate, c_date],
    (err, result) => {
      if (err) console.log(err);
      console.log(result);
    }
  );
});

app.delete("/api/delete/classlike", (req, res) => {
  const sqlDelete = `DELETE FROM like_class WHERE class_id =${req.query.classId}  AND member_id=${req.query.member}`;
  console.log(sqlDelete);
  res.send(JSON.stringify({ result: "ok" }));
  db.query(sqlDelete, (err, result) => {
    if (err) console.log(err);
    // res.json({
    //   state:"success"
    // })
  });
});

app.delete("/api/delete/eventlike", (req, res) => {
  const sqlDelete = `DELETE FROM like_event WHERE event_id =${req.query.eventId}  AND member_id=${req.query.member}`;
  console.log(sqlDelete);
  res.send(JSON.stringify({ result: "ok" }));
  db.query(sqlDelete, (err, result) => {
    if (err) console.log(err);
    // res.json({
    //   state:"success"
    // })
  });
});

app.delete("/api/delete/:member_id", (req, res) => {
  const member_id = req.params.member_id;
  const sqlDelete = "Delete FROM  member WHERE member_id=?";
  db.query(sqlDelete, member_id, (err, result) => {
    if (err) console.log(err);
  });
});

app.listen(3001, () => {
  console.log("running on port 3001");
});
