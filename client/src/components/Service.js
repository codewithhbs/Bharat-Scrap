'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Loop } from 'swiper/modules';
import 'swiper/css';

const services = [
  {
    img: '/assets/imgs/services/online-vehicle-scraping.jpg',
    title: 'Online Vehicle Scrapping',
  },
  {
    img: '/assets/imgs/services/immediately-pickup.webp',
    title: 'Immediately Pickup',
  },
  {
    img: '/assets/imgs/services/instant-payment.webp',
    title: 'Instant Payment & Settlement',
  },
];

export default function Service() {
  return (
    <section className="section-box box-flights background-body pt-0">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-md-9 wow fadeInUp">
            <h3 className="title-svg neutral-1000 mb-5">Our Professional Services</h3>
            <p className="text-lg-medium text-bold neutral-500">
              Reliable vehicle scrapping and recycling solutions for individuals and businesses
            </p>
          </div>
          <div className="col-md-3 position-relative mb-30 wow fadeInUp">
            <div className="box-button-slider box-button-slider-team justify-content-end">
              <div className="swiper-button-prev swiper-button-prev-style-1 swiper-button-prev-service">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.99992 3.33325L3.33325 7.99992M3.33325 7.99992L7.99992 12.6666M3.33325 7.99992H12.6666" stroke="" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <div className="swiper-button-next swiper-button-next-style-1 swiper-button-next-service">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.99992 12.6666L12.6666 7.99992L7.99992 3.33325M12.6666 7.99992L3.33325 7.99992" stroke="" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="block-flights wow fadeInUp">
          <div className="box-swiper mt-30">
            <Swiper
              modules={[Navigation]}
              loop={true}
              navigation={{
                prevEl: '.swiper-button-prev-service',
                nextEl: '.swiper-button-next-service',
              }}
              grabCursor={true}
              slidesPerView={3}
              spaceBetween={30}
              className="swiper-group-3 swiper-group-journey"
              breakpoints={{
                0:   { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
              }}
            >
              {services.map((service, index) => (
                <SwiperSlide key={index}>
                  <div className="card-journey-small background-card hover-up">
                    <div className="card-image">
                      <Image
                        src={service.img}
                        alt={service.title}
                        width={400}
                        height={260}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    </div>
                    <div className="card-info">
                      <div className="card-title">
                        <a className="heading-6 neutral-1000" href="#">
                          {service.title}
                        </a>
                      </div>
                      <div className="card-program">
                        <div className="endtime">
                          <div className="card-button">
                            <Link className="btn btn-gray" href="/contact-us">
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}