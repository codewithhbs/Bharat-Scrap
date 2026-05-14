'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

const testimonials = [
  {
    title: 'Quick and Hassle-Free Service',
    review: 'I wanted to scrap my old car and the process was extremely smooth. The team handled everything from inspection to pickup very professionally. Highly recommended service!',
    author: 'Rohit Sharma',
    location: 'Delhi',
    img: '/assets/imgs/testimonials/testimonials-1/author-1.png',
  },
  {
    title: 'Best Scrap Value',
    review: 'I compared several companies before choosing Bharat Scrap Facilities. They offered the best price for my vehicle and completed the process quickly.',
    author: 'Amit Verma',
    location: 'Noida',
    img: '/assets/imgs/testimonials/testimonials-1/author-2.png',
  },
  {
    title: 'Professional and Reliable',
    review: 'The pickup service was on time and the entire documentation process was handled smoothly. I was impressed by how organized their scrapping process is.',
    author: 'Pooja Singh',
    location: 'Ghaziabad',
    img: '/assets/imgs/testimonials/testimonials-1/author-3.png',
  },
  {
    title: 'Environment Friendly Process',
    review: "I appreciate how responsibly they dismantle and recycle vehicles. It's good to know my old car was scrapped in an environmentally safe way.",
    author: 'Rahul Mehta',
    location: 'Gurugram',
    img: '/assets/imgs/testimonials/testimonials-1/author-1.png',
  },
  {
    title: 'Transparent Documentation',
    review: 'Everything was clearly explained and all paperwork was handled by their team. I did not have to worry about anything. Great experience overall.',
    author: 'Sunita Yadav',
    location: 'Faridabad',
    img: '/assets/imgs/testimonials/testimonials-1/author-2.png',
  },
  {
    title: 'Excellent Customer Support',
    review: 'Their support team was very responsive and answered all my questions patiently. The pickup was scheduled the very next day. Truly impressive service.',
    author: 'Vikram Joshi',
    location: 'Greater Noida',
    img: '/assets/imgs/testimonials/testimonials-1/author-3.png',
  },
];

const StarRating = () => (
  <div className="card-rate">
    {[...Array(5)].map((_, i) => (
      <Image
        key={i}
        className="background-brand-2 p-1"
        src="/assets/imgs/template/icons/star-black.svg"
        alt="star"
        width={20}
        height={20}
      />
    ))}
  </div>
);

export default function Testimonial() {
  return (
    <>
      {/* ✅ Swiper ki saari zaruri CSS — koi external file ki zarurat nahi */}
      <style>{`
        .swiper {
          margin-left: auto;
          margin-right: auto;
          position: relative;
          overflow: hidden;
          list-style: none;
          padding: 0;
          z-index: 1;
        }
        .swiper-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 1;
          display: flex;
          flex-direction: row;
          transition-property: transform;
          box-sizing: content-box;
        }
        .swiper-slide {
          flex-shrink: 0;
          width: 100%;
          height: 100%;
          position: relative;
          transition-property: transform;
        }
        .swiper-slide-invisible-blank {
          visibility: hidden;
        }
      `}</style>

      <section className="section-box py-96 background-body">
        <div className="container">
          <div className="row align-items-end">
            <div className="col-md-9 col-sm-9 wow fadeInUp">
              <div className="box-author-testimonials">
                <Image src="/assets/imgs/page/homepage5/author.png"  alt="author" width={40} height={40} />
                <Image src="/assets/imgs/page/homepage5/author2.png" alt="author" width={40} height={40} />
                <Image src="/assets/imgs/page/homepage5/author3.png" alt="author" width={40} height={40} />
                Testimonials
              </div>
              <h3 className="mt-8 mb-15 neutral-1000">What they say about us?</h3>
            </div>
          </div>
        </div>

        <div className="block-testimonials wow fadeIn">
          <div className="container-testimonials">
            <div className="container-slider ps-0">
              <div className="box-swiper mt-30">
                <Swiper
                  modules={[Autoplay]}
                  loop={true}
                  grabCursor={true}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  spaceBetween={24}
                  breakpoints={{
                    0:   { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    992: { slidesPerView: 3 },
                  }}
                  className="swiper-group-animate swiper-group-journey"
                >
                  {testimonials.map((t, index) => (
                    <SwiperSlide key={index}>
                      <div className="card-testimonial background-card">
                        <div className="card-info">
                          <p className="text-xl-bold card-title neutral-1000">{t.title}</p>
                          <p className="text-md-regular neutral-500">{t.review}</p>
                        </div>
                        <div className="card-top pt-40 border-0 mb-0">
                          <div className="card-author">
                            <div className="card-image">
                              <Image src={t.img} alt={t.author} width={48} height={48} />
                            </div>
                            <div className="card-info">
                              <p className="text-lg-bold neutral-1000">{t.author}</p>
                              <p className="text-md-regular neutral-1000">{t.location}</p>
                            </div>
                          </div>
                          <StarRating />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}