'use client';
import dynamic from 'next/dynamic';
const Testimonial = dynamic(() => import('@/components/Testimonial'), { ssr: false });
import React, { useEffect, useState, useRef } from 'react'

const stats = [
    { count: 5000, suffix: '+', label1: 'Vehicles', label2: 'Scrapped' },
    { count: 120, suffix: '+', label1: 'Tons of', label2: 'Metal Recycled' },
    { count: 15, suffix: '+', label1: 'Years', label2: 'Experience' },
    { count: 3000, suffix: '+', label1: 'Satisfied', label2: 'Customers' },
    { count: 24, suffix: '/7', label1: 'Customer', label2: 'Support' },
];

function Counter({ target, suffix }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const animate = () => {
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;

            const interval = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setCount(target);
                    clearInterval(interval);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);
        };

        // IntersectionObserver browser mein hi available hai
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            // SSR ya purana browser — seedha count show karo
            setCount(target);
            return;
        }

        const observer = new window.IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !started.current) {
                        started.current = true;
                        animate();
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [target]);

    return (
        <div ref={ref} className="d-flex justify-content-center justify-content-md-start">
            <h3 className="count neutral-1000">{count}</h3>
            <h3 className="neutral-1000">{suffix}</h3>
        </div>
    );
}

export default function Page() {

    return (
        <>
            {/* <!-- Breadcrumb Banner --> */}
            <section className="breadcrumb-banner position-relative">
                <div className="container position-relative z-1 text-center">
                    <h2 className="color-white mb-2">About Us</h2>
                    <p className="text-white">
                        <a href="/" className="text-white">Home</a> / About Us
                    </p>
                </div>
            </section>

            <section className="section-1 py-96 background-body">
                <div className="container">
                    <div className="row pb-50">
                        <div className="col-lg-4">
                            <h3 className="neutral-1000">Responsible <br /><span className="text-primary">Vehicle Scrapping</span> Starts Here</h3>
                        </div>
                        <div className="col-lg-7 offset-lg-1">
                            <p className="text-lg-medium neutral-500">
                                Bharat Scrap Facilities is a government-authorized vehicle scrapping company with nearly two decades of industry experience. We specialize in safe, efficient, and environmentally responsible vehicle recycling. Our goal is to make the scrapping process simple and hassle-free while ensuring full compliance with environmental and government regulations.
                            </p>
                        </div>
                    </div>
                    <div className="row g-4">
                        <div className="col-lg-7 col-md-6">
                            <p className="text-lg-medium neutral-500">
                                At Bharat Scrap Facilities, we provide professional vehicle scrapping services designed to make the process easy and transparent for our customers. With years of experience in the industry, we handle everything from vehicle inspection to responsible dismantling and recycling, ensuring a smooth experience for vehicle owners.
                            </p><br />

                            <p className="text-lg-medium neutral-500">
                                Our team of trained professionals follows strict environmental guidelines to safely dispose of vehicles and recycle valuable materials. We are committed to reducing environmental impact while helping customers legally scrap their old or unused vehicles without stress or complications.
                            </p>

                            <p className="text-lg-medium neutral-500">
                                Customer satisfaction, reliability, and responsible recycling are at the core of our services. We strive to provide quick processing, fair evaluations, and dependable support for every vehicle scrapping request.
                            </p>
                        </div>
                        <div className="col-lg-5 col-md-6">
                            <div className="box-image rounded-12 position-relative overflow-hidden">
                                <img className="rounded-12" src="assets/imgs/app/app-1/abt-main.jpg" alt="Image" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container pt-40">
                    <div className="row mt-40">
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why text-start wow fadeInUp" style={{ visibility: 'visible' }}>
                                <div className="card-image">
                                    <img src="assets/imgs/app/app-1/scrap.png" alt="scrap" />
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000 text-start">Authorized Vehicle Scrapping</h6>
                                    <p className="text-md-medium neutral-500">
                                        We provide government-authorized vehicle scrapping services with safe dismantling and proper documentation.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why text-start wow fadeInUp" style={{ visibility: 'visible' }}>
                                <div className="card-image">
                                    <div className="card-image">
                                        <img src="assets/imgs/app/app-1/value.png" alt="value" />
                                    </div>
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000 text-start">Best Scrap Value</h6>
                                    <p className="text-md-medium neutral-500">
                                        Get the best market value for your old or damaged vehicles with transparent pricing and instant payment.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why text-start wow fadeInUp" style={{ visibility: 'visible' }}>
                                <div className="card-image">
                                    <img src="assets/imgs/app/app-1/recycle.png" alt="recycle" />
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000 text-start">Eco-Friendly Recycling</h6>
                                    <p className="text-md-medium neutral-500">
                                        We follow environmentally responsible recycling methods to safely dispose of vehicles and reduce pollution.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why text-start wow fadeInUp" style={{ visibility: 'visible' }}>
                                <div className="card-image">
                                    <img src="assets/imgs/app/app-1/car.png" alt="car" />
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000 text-start">Hassle-Free Pickup</h6>
                                    <p className="text-md-medium neutral-500">
                                        Our team provides quick vehicle pickup from your location with a smooth and convenient scrapping process.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* <!-- Static 1 --> */}
            <section className="section-static-1 background-body background-2 pt-60 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="">
                            <div className="wow fadeIn">
                                <div className="d-flex align-items-center justify-content-around flex-wrap">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="mb-4 mb-lg-0 d-block px-lg-5 px-3">
                                            <Counter target={stat.count} suffix={stat.suffix} />
                                            <div className="text-md-start text-center">
                                                <p className="text-lg-bold neutral-1000">{stat.label1}</p>
                                                <p className="text-lg-bold neutral-1000">{stat.label2}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial  */}
            <Testimonial />

        </>
    )
}
