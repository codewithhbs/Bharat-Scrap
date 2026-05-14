'use client';
import { useState } from 'react';

const ArrowIcon = () => (
  <svg className="invert" xmlns="http://www.w3.org/2000/svg" width="13" height="8" viewBox="0 0 13 8" fill="none">
    <path className="stroke-dark" d="M11.5 1L6.25 6.5L1 1" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const faqsLeft = [
  {
    id: 'faq1',
    question: 'What documents are required to scrap my vehicle?',
    answer: 'To scrap your vehicle, you need a copy of the vehicle\'s Registration Certificate (RC) and a valid government ID such as Aadhaar Card, PAN Card, or Driving License. Our team will guide you through the documentation process to ensure everything is completed smoothly.',
  },
  {
    id: 'faq2',
    question: 'Do you provide pickup services for scrap vehicles?',
    answer: 'Yes, we provide pickup services from your location. Our team will visit your location, inspect the vehicle, and safely transport it to our scrapping facility.',
  },
  {
    id: 'faq3',
    question: 'How is the scrap value of my vehicle determined?',
    answer: 'The scrap value depends on the vehicle\'s weight, condition, metal components, and current scrap market prices. We ensure transparent pricing and offer competitive rates for your vehicle.',
  },
  {
    id: 'faq4',
    question: 'What happens to my vehicle after scrapping?',
    answer: 'After the vehicle reaches our facility, it is dismantled using environmentally responsible methods. Recyclable materials such as metal, plastic, and rubber are separated and processed according to government regulations.',
  },
  {
    id: 'faq5',
    question: 'Will my vehicle registration be cancelled after scrapping?',
    answer: 'Yes, once the vehicle is scrapped, we assist with the RC cancellation process through the official RTO system to ensure the vehicle is legally deregistered.',
  },
];

const faqsRight = [
  {
    id: 'faq6',
    question: 'Is your vehicle scrapping facility government authorized?',
    answer: 'Yes, Bharat Scrap Facilities operates according to government guidelines and environmental regulations. Our facility follows proper dismantling and recycling procedures to ensure safe and responsible vehicle scrapping.',
  },
  {
    id: 'faq7',
    question: 'How long does the vehicle scrapping process take?',
    answer: 'The complete scrapping process usually takes between 24 to 48 hours depending on the vehicle condition, documentation verification, and pickup location.',
  },
  {
    id: 'faq8',
    question: 'What types of vehicles can be scrapped?',
    answer: 'We accept a wide range of vehicles including cars, SUVs, vans, and commercial vehicles that are old, damaged, or no longer suitable for road use.',
  },
  {
    id: 'faq9',
    question: 'How can I contact your support team?',
    answer: 'You can contact our support team through our phone number, email, or the contact form on our website. Our team will assist you with any queries related to vehicle scrapping services.',
  },
  {
    id: 'faq10',
    question: 'Do I receive a certificate after scrapping my vehicle?',
    answer: 'Yes, after the scrapping process is completed, we provide an official scrapping certificate. This certificate confirms that your vehicle has been dismantled according to government regulations and can be used for RTO documentation purposes.',
  },
];

function FaqItem({ faq, openId, setOpenId }) {
  const isOpen = openId === faq.id;

  const toggle = (e) => {
    e.preventDefault();
    setOpenId(isOpen ? null : faq.id);
  };

  return (
    <div className="mb-2 card border rounded-3">
      <div className="px-0 card-header border-0 bacground-body">
        <a
          href="#"
          className="collapsed px-3 py-2 text-900 fw-bold d-flex align-items-center"
          onClick={toggle}
        >
          <p className="text-lg-bold neutral-1000 pe-4">{faq.question}</p>
          <span
            className="ms-auto arrow me-2"
            style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ArrowIcon />
          </span>
        </a>
      </div>
      {isOpen && (
        <p className="pt-0 pb-4 card-body">
          {faq.answer}
        </p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="section-faqs-2 pt-80 pb-80 background-100">
      <div className="container">
        <div className="row mb-40">
          <div className="col-md-8 offset-md-2 wow fadeInUp">
            <h3 className="title-svg neutral-1000 mb-5 text-center">Frequently Asked Questions</h3>
            <p className="text-lg-medium text-bold neutral-500 text-center">
              Find answers to common questions about our vehicle scrapping process, documentation, and services
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6">
            <div className="accordion">
              {faqsLeft.map((faq) => (
                <FaqItem key={faq.id} faq={faq} openId={openId} setOpenId={setOpenId} />
              ))}
            </div>
          </div>
          <div className="col-lg-6 mt-lg-0 mt-2">
            <div className="accordion">
              {faqsRight.map((faq) => (
                <FaqItem key={faq.id} faq={faq} openId={openId} setOpenId={setOpenId} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}