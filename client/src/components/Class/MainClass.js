import React, { useState, useEffect } from 'react'
import '../../style/class/main_class.scss'
import { devUrl } from '../../config'
import { MdBookmark, MdShare } from 'react-icons/md'
import Axios from 'axios'
import { withRouter } from 'react-router-dom'
import Swal from 'sweetalert2'
import { key } from './Key'

// 元素
import ClassCard from './ClassCard'
import GMap from './GMap'
import Carousel1 from './Carousel1'
import Carousel2 from '../../components/Class/Carousel2'
import FixedBottom from '../Class/FixedBottom'
import { Modal } from 'react-bootstrap'
import ScrollTop from '../Main/ScrollTop'
import {
  FacebookShareButton,
  LineShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  LineIcon,
  TwitterIcon,
  WhatsappIcon,
} from 'react-share'
import Bread from '../Class/MyBreadCrumb'

function ClassMain(props) {
  // class資料儲存區
  const [classData, setClassData] = useState([])
  const [theme1, setTheme1] = useState([])
  const [date, setDate] = useState([])
  const [classId, setClassId] = useState([])
  const [isActive, setIsActive] = useState(false)
  const [className, setClassName] = useState([])

  //地址存取
  const [add, setAdd] = useState('')
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)

  // Modal控制區
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  //日期轉換器
  function dateConvert(jsonDate) {
    let json = String(jsonDate).split(' ')
    let date = new Date(json[0])
    let dd = date.getDate()
    let mm = date.getMonth() + 1
    var yyyy = date.getFullYear()
    if (dd < 10) {
      dd = '0' + dd
    }
    if (mm < 10) {
      mm = '0' + mm
    }
    date = yyyy + '-' + mm + '-' + dd
    return date
  }

  // const loginId = window.sessionStorage.getItem('useriddd')
  // console.log(loginId)
  const addFavorites = () => {
    Axios.post('http://localhost:3001/class/favorites', {
      member_id: window.sessionStorage.getItem('useriddd'),
      class_id: classId,
      member_like: 1,
    }).then(() => {
      console.log('成功')
    })
  }

  const deleteFavorites = () => {
    Axios.delete(
      `http://localhost:3001/class/delete?classId=${classId}&memberId=${window.sessionStorage.getItem(
        'useriddd'
      )}`
    ).then(() => {
      console.log('失敗')
    })
  }

  // 進入頁面時，抓取特定id的資料
  useEffect(() => {
    Axios.get(`http://localhost:3001/class/${props.match.params.id}`)
      .then((response) => {
        setClassData(response.data)
        setTheme1(response.data[0].class_theme_name)
        setDate(response.data[0].class_start_date)
        setAdd(response.data[0].class_address)
        setClassId(response.data[0].class_id)
        setClassName(response.data[0].class_name)
      })
      .catch(function (error) {
        console.log(error)
      })
  }, [])

  //地址轉經緯度
  geoCode()
  function geoCode() {
    var insertLocation = add.toString()
    Axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: `"${insertLocation}"`,
        key: 'AIzaSyCMogInSI3uIE7NMzd6zNmGbW6-_gnGvI8',
      },
      withCredentials: false,
    })
      .then(function (response) {
        // 地址的緯度
        setLat(response.data.results[0].geometry.location.lat)
        //地址的經度
        setLng(response.data.results[0].geometry.location.lng)
      })
      .catch(function (error) {
        // handle error
        console.log(error)
      })
  }

  return (
    <>
      {classData.map((val) => {
        return (
          <div className="class_wave_background test">
            <div className="mainclass_wrapper">
              <div className="page-head">
                <Bread className={className} />
                <div className="title">
                  <h6 className="subtitle1">
                    {dateConvert(val.class_start_date)}&nbsp;~&nbsp;
                    {dateConvert(val.class_end_date)}
                  </h6>
                  <h5>{val.class_name}</h5>
                </div>
                <div className="page-head-part2">
                  <div className="organizer_info">
                    <figure className="organizer">
                      <img
                        src={devUrl + '/pic/class/' + val.class_teacher_photo}
                        alt=""
                      />
                    </figure>
                    <span>
                      {val.class_teacher_name}
                      <br />
                      <span style={{ fontSize: '12px' }}>老師的課程</span>
                    </span>
                  </div>
                  <div className="btn_part">
                    <button
                      className="btn bttn save rounded-pill"
                      style={
                        isActive === false
                          ? { display: 'inline' }
                          : { display: 'none' }
                      }
                      onClick={() => {
                        setIsActive(true)
                        addFavorites()
                      }}
                    >
                      <MdBookmark
                        size={30}
                        style={{ color: 'white', paddingRight: '6px' }}
                      />
                      <span className="align-middle"> 收藏</span>
                    </button>
                    <button
                      className="btn bttn save rounded-pill"
                      style={
                        isActive === true
                          ? { display: 'inline' }
                          : { display: 'none' }
                      }
                      onClick={() => {
                        setIsActive(false)
                        deleteFavorites()
                      }}
                    >
                      <span className="align-middle">取消收藏</span>
                    </button>
                    <button
                      className="btn bttn share rounded-pill"
                      onClick={handleShow}
                    >
                      <MdShare
                        size={30}
                        style={{ color: 'white', paddingRight: '6px' }}
                      />
                      <span className="align-middle">分享</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="page-head-part3">
                <div className="content_big_part">
                  <div>
                    <figure className="class_pic">
                      <img
                        src={devUrl + '/pic/class/' + val.class_main_pic}
                        alt="課程圖片"
                      />
                    </figure>
                  </div>
                  <h5 className="class_title">課程特色</h5>
                  <div className="line"></div>
                  <ul className="features">
                    <li>{val.class_features1}</li>
                    <li>{val.class_features2}</li>
                    <li>{val.class_features3}</li>
                  </ul>
                  <h5 className="class_title">課程內容</h5>
                  <div className="line"></div>
                  <p dangerouslySetInnerHTML={{ __html: val.class_content }} />
                  <h5 className="class_title">授課老師</h5>
                  <div className="line"></div>
                  <div className="teacher">
                    <figure className="teacher_pic">
                      <img
                        src={devUrl + '/pic/class/' + val.class_teacher_photo}
                        alt="老師圖片"
                      />
                    </figure>
                    <div className="teacher_info_block">
                      <h5 className="class_teacher">
                        {val.class_teacher_name}
                      </h5>
                      <p className="teacher_intro">{val.class_teacher_intro}</p>
                    </div>
                  </div>
                </div>
                <div className="left_part">
                  <ClassCard />
                  <div className="gmap">
                    {/* <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.716635848027!2d121.55716131432396!3d25.043688744058375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abc0ac49edb7%3A0xb13d35d6bafc3576!2z5p2-5bGx5paH5Ym15ZyS5Y2A44Sn6Jmf5YCJ5bqr!5e0!3m2!1szh-TW!2stw!4v1611649500214!5m2!1szh-TW!2stw"
                      width="600"
                      height="450"
                      frameborder="0"
                      allowfullscreen=""
                      aria-hidden="false"
                      tabindex="0"
                      className="google_map"
                    ></iframe> */}
                    {console.log(`lat=${lat} lng=${lng}`)}
                    {lat > 0 && lng > 0 && (
                      <GMap
                        location={{
                          address: add.toString(),
                          lat: lat,
                          lng: lng,
                        }}
                        zoomLevel={15}
                      />
                    )}
                  </div>
                </div>

                {/* modal */}
                <Modal show={show} onHide={handleClose}>
                  <Modal.Header closeButton className="border-0">
                    <Modal.Title>分享</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="d-flex justify-content-around">
                    <LineShareButton
                      url={String(window.location)}
                      title="快來參加這個超棒揪影活動"
                    >
                      <LineIcon round={true} />
                    </LineShareButton>
                    <TwitterShareButton
                      url={String(window.location)}
                      title="快來參加這個超棒揪影活動"
                    >
                      <TwitterIcon round={true} />
                    </TwitterShareButton>
                    <WhatsappShareButton
                      url={String(window.location)}
                      title="快來參加這個超棒揪影活動"
                    >
                      <WhatsappIcon round={true} />
                    </WhatsappShareButton>
                    <FacebookShareButton
                      url={String(window.location)}
                      title="快來參加這個超棒揪影活動"
                    >
                      <FacebookIcon round={true} />
                    </FacebookShareButton>
                  </Modal.Body>
                  <Modal.Footer className="border-0">
                    {/* <Button variant="secondary" onClick={handleClose}>
                      Close
                    </Button> */}
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
            <div className="wave_background2">
              <div className="gallery_part">
                <h4>學員攝影作品</h4>
                <div className="line2"></div>
                <div className="member_photo_showcase">
                  <Carousel1 />
                </div>
              </div>
            </div>
            <ScrollTop />
            <div className="mainclass_wrapper">
              <h5 className="class_suggest">相似課程</h5>
              <div className="line"></div>
              <div className="bottom-carousel">
                <Carousel2 themeData={theme1} classCId={classId} />
              </div>
            </div>
            <FixedBottom />
          </div>
        )
      })}
    </>
  )
}

export default withRouter(ClassMain)
