import '../../index.scss'
import React, { useState, useEffect } from 'react'
import Axios from 'axios'
import MemberCard from '../../components/Member/MemberCard'
import MemberNavlist from '../../components/Member/MemberNavlist'
import { MdVisibility, MdClear } from 'react-icons/md'
import { Card, Button } from 'react-bootstrap'
import { devUrl } from '../../config'
import { DateConvert } from '../../components/Main/DateTimeConverter'
import { withRouter } from 'react-router-dom'
import Swal from 'sweetalert2'

function MemberMyCollectionC(props) {
  const [memlikeclass, setMemberlikeClass] = useState([])

  useEffect(() => {
    Axios.get(
      `http://localhost:3001/member/get/collection/class/${props.match.params.id}`
    )
      .then((res) => {
        setMemberlikeClass(res.data)
        // console.log(memlikeclass)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const deletelike = (classId) => {
    Axios.delete(
      `http://localhost:3001/api/delete/classlike?classId=${classId}&member=${props.match.params.id}`
    )
    Swal.fire('取消收藏!', '', 'error').then((result) => {
      if (result.isConfirmed) {
      }
      setTimeout(window.location.reload(), 500)
    })
    // Swal.fire({
    //   title: '<strong>確定要刪除嗎</strong>',
    //   icon: 'info',
    //   html:
    //     'You can use <b>bold text</b>, ' +
    //     '<a href="//sweetalert2.github.io">links</a> ' +
    //     'and other HTML tags',
    //   showCloseButton: true,
    //   showCancelButton: true,
    //   focusConfirm: false,
    //   confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
    //   confirmButtonAriaLabel: 'Thumbs up, great!',
    //   cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
    //   cancelButtonAriaLabel: 'Thumbs down',
    // })
  }

  return (
    <>
      <body>
        <div className="background_wave ">
          <div className="wrapper  ">
            <main className="container">
              <aside className="d-flex justify-content-end">
                <br />
                <div>
                  <MemberCard />
                  <br />
                  <MemberNavlist />
                </div>

                <article>
                  <div className="container">
                    <Card className="mem_box" style={{ padding: '0px' }}>
                      <Card.Header className="mem_title d-flex justify-content-between">
                        <h5>我的收藏</h5>
                      </Card.Header>
                      <Card.Body
                        style={{ padding: '0  38px  43px 42px' }}
                        className="navbarbox1 "
                      >
                        <ul className="row navbarmem   d-flex align-items-center">
                          <li className=" subtitle1  main_li">
                            <a
                              href={
                                devUrl +
                                `/member/${props.match.params.id}/MyCollection`
                              }
                            >
                              活動
                            </a>
                          </li>
                          <li className=" subtitle1 main_li">
                            <a
                              href={
                                devUrl +
                                `/member/${props.match.params.id}/MyCollection/Class`
                              }
                            >
                              課程
                            </a>
                          </li>
                        </ul>
                        <br />
                        {memlikeclass.length > 0 ? (
                          <div>
                            {memlikeclass.map((val) => {
                              return (
                                <div className="pdCard">
                                  <div className="ccard position-relative">
                                    <div className="d-flex dcard">
                                      <div>
                                        <img
                                          src={
                                            devUrl +
                                            `/pic/class/${val.class_main_pic}`
                                          }
                                          className="card-img-top photo"
                                          alt="..."
                                        />
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <div className="card-body">
                                          <h5 className="card-title">
                                            {val.class_name}
                                          </h5>

                                          <div className="d-flex bbb">
                                            <img
                                              className="icon"
                                              src="/pic/svg/photo-camera.svg"
                                              alt=""
                                            />
                                            <p className="caption">
                                              {val.class_place}
                                            </p>
                                          </div>
                                          <div className="d-flex bbb">
                                            <img
                                              className="icon2"
                                              src="/pic/svg/date_range-24px.svg"
                                              alt=""
                                            />
                                            <p className="caption  d-flex">
                                              <DateConvert
                                                jsonDate={val.class_start_date}
                                              />
                                              &nbsp;~&nbsp;
                                              <DateConvert
                                                jsonDate={val.class_end_date}
                                              />
                                            </p>
                                          </div>
                                          <div className="d-flex bbb">
                                            <img
                                              className="icon3"
                                              src="/pic/svg/location_on-24px.svg"
                                              alt=""
                                            />
                                            <p className="caption ">
                                              {val.class_address}
                                            </p>
                                          </div>
                                          <div
                                            className="position-absolute"
                                            style={{
                                              bottom: '8px',
                                              right: '10px',
                                            }}
                                          >
                                            <div className="d-flex justify-content-end">
                                              <Button
                                                onClick={() => {
                                                  deletelike(val.class_id)
                                                }}
                                                className="btn-style botton-font btn_icon mem_card_btn d-flex align-items-center "
                                                style={{
                                                  backgroundColor: '#df3d00',
                                                  marginBottom: '8px',
                                                }}
                                              >
                                                <MdClear />
                                                取消收藏
                                              </Button>
                                            </div>
                                            <div className="d-flex justify-content-end">
                                              <Button
                                                onclick=""
                                                className="btn-style botton-font btn_icon mem_card_btn"
                                                href={
                                                  devUrl +
                                                  `/class/${val.class_id}`
                                                }
                                              >
                                                <MdVisibility />
                                                課程檢視
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div style={{ marginTop: '32px' }}>
                            <p>目前無收藏課程</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </article>
              </aside>
            </main>
          </div>
          <br />
        </div>
      </body>
    </>
  )
}

export default withRouter(MemberMyCollectionC)
