'use client';
import React from 'react'
import Brand from './Brand';

export default function ScrapYourVehicle() {
    return (
        <>
            {/* <!-- Breadcrumb Banner --> */}
            <section className="breadcrumb-banner position-relative">
                <div className="container position-relative z-1 text-center">
                    <h2 className="color-white mb-2">Scrap Your Vehicle</h2>
                    <p className="text-white">
                        <a href="/" className="text-white">Home</a> / Scrap Your Vehicle
                    </p>
                </div>
            </section>

            <section className="box-section background-body">
                <div className="container">
                    <div className="section-box background-body pt-96">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12 mb-35">
                                    <div className="box-content-detail-blog">
                                        <div className="box-content-info-detail mt-0 pt-0">

                                            <p className="text-xl-medium mb-20 neutral-1000">
                                                Scrapping your old vehicle is an important step toward maintaining a cleaner and safer environment.
                                                At Bharat Scrap Facilities, we provide a reliable and government-compliant vehicle scrapping service.
                                                Our process ensures that your old, damaged, or non-functional vehicle is dismantled responsibly while
                                                maximizing the recycling of usable materials.
                                            </p>

                                            <div className="content-detail-post">
                                                <h6>Why Scrap Your Old Vehicle?</h6>
                                                <p className="neutral-1000">
                                                    Old vehicles not only consume more fuel but also release harmful emissions that affect the
                                                    environment. Scrapping outdated vehicles helps reduce pollution, improves road safety, and
                                                    promotes sustainable recycling. By choosing a certified vehicle scrapping facility, you ensure
                                                    that your vehicle is disposed of according to environmental regulations.
                                                </p>
                                            </div>

                                            <div className="d-flex flex-md-row flex-column align-items-center justify-content-center gap-3 mb-30">
                                                <div>
                                                    <img src="assets/imgs/app/app-1/scrap-main1.jpg" alt="Vehicle Scrapping Process" />
                                                </div>
                                                <div>
                                                    <img src="assets/imgs/app/app-1/scrap-main2.jpg" alt="Vehicle Recycling" />
                                                </div>
                                            </div>

                                            <div className="content-detail-post">

                                                <h6>Eco-Friendly Vehicle Recycling</h6>
                                                <p>
                                                    Vehicle scrapping plays an important role in protecting the environment.
                                                    At Bharat Scrap Facilities, we ensure that recyclable materials such as steel, aluminum, and plastic are recovered responsibly.
                                                    This helps reduce industrial waste and supports sustainable recycling practices.
                                                </p>

                                                <h6>Safe Handling of Vehicle Components</h6>
                                                <p>
                                                    Old vehicles contain fluids and components that require careful handling.
                                                    Our facility follows strict safety standards to manage materials like batteries, oils, and coolants properly.
                                                    This prevents environmental contamination and promotes responsible disposal.
                                                </p>

                                                <h6>Responsible Automotive Waste Management</h6>
                                                <p>
                                                    Proper vehicle scrapping ensures that automotive waste does not harm the environment.
                                                    We follow modern dismantling and recycling practices to minimize landfill waste.
                                                    This approach helps conserve natural resources and supports cleaner industrial processes.
                                                </p>

                                                <h6>Reliable Vehicle Scrapping Facility</h6>
                                                <p>
                                                    Bharat Scrap Facilities is committed to providing trusted and transparent scrapping services.
                                                    Our experienced team ensures that every vehicle is handled with professionalism and care.
                                                    Customers can rely on us for responsible and environmentally conscious vehicle disposal.
                                                </p>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* <!-- why-us-1 --> */}
            <section className="section-box box-why-book-22 background-100 @@classList pt-100">
                <div className="container">
                    <div className="text-center wow fadeInUp">
                        <p className="text-xl-medium neutral-500">HOW IT WORKS</p>
                        <h3 className="neutral-1000 wow fadeInUp">
                            Simple Steps to Scrap Your Vehicle
                        </h3>
                    </div>
                    <div className="row mt-40">
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why wow fadeIn" data-wow-delay="0.1s">
                                <div className="card-image">
                                    <img src="assets/imgs/step/s1.png" alt="step 1"/>
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000">1. Appointment</h6>
                                    <p className="text-md-medium neutral-500">
                                        Book an appointment by submitting the details of your vehicle.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why wow fadeIn" data-wow-delay="0.3s">
                                <div className="card-image">
                                    <img src="assets/imgs/step/s3.png" alt="step 3"/>
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000">2. Price & Payment</h6>
                                    <p className="text-md-medium neutral-500">
                                        We offer the best scrap value and provide instant payment.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why wow fadeIn" data-wow-delay="0.4s">
                                <div className="card-image">
                                    <img src="assets/imgs/step/s4.png" alt="step 4"/>
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000">3. Documentation</h6>
                                    <p className="text-md-medium neutral-500">
                                        Submit your RC copy and a valid government ID for verification.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-sm-6">
                            <div className="card-why wow fadeIn" data-wow-delay="0.5s">
                                <div className="card-image">
                                    <img src="assets/imgs/step/s5.png" alt="step 5"/>
                                </div>
                                <div className="card-info">
                                    <h6 className="text-xl-bold neutral-1000">4. Deal Completion</h6>
                                    <p className="text-md-medium neutral-500">
                                        Receive the receipt and complete the vehicle scrapping process smoothly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Brand />
        </>
    )
}
