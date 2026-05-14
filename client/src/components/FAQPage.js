'use client';
import React, { useEffect, useState, useRef } from 'react'
import FAQ from './FAQ'
import Testimonial from './Testimonial';

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

export default function FAQPage() {
    return (
        <>
            {/* <!-- Breadcrumb Banner --> */}
            <section className="breadcrumb-banner position-relative">
                <div className="container position-relative z-1 text-center">
                    <h2 className="color-white mb-2">FAQ`s</h2>
                    <p className="text-white">
                        <a href="/" className="text-white">Home</a> / FAQ`s
                    </p>
                </div>
            </section>

            <FAQ />

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

            <Testimonial />

        </>
    )
}
