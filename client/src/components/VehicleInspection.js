import React from 'react'
import Brand from './Brand'

export default function VehicleInspection() {
    return (
        <>
            {/* <!-- Breadcrumb Banner --> */}

            <section className="breadcrumb-banner position-relative">
                <div className="container position-relative z-1 text-center">
                    <h2 className="color-white mb-2">Vehicle Inspection</h2>
                    <p className="text-white">
                        <a href="/" className="text-white">Home</a> / Vehicle Inspection
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
                                                Vehicle inspection is an essential step to ensure that a vehicle is safe, reliable, and compliant with regulations.
                                                At Bharat Scrap Facilities, we conduct professional vehicle inspections to assess the overall condition of vehicles.
                                                Our inspection process helps identify mechanical issues, safety concerns, and whether the vehicle is suitable for use or scrapping.
                                            </p>

                                            <div className="content-detail-post">
                                                <h6>Why Vehicle Inspection is Important?</h6>
                                                <p className="neutral-1000">
                                                    Regular vehicle inspections help maintain road safety and prevent unexpected breakdowns. By evaluating critical
                                                    components such as the engine, brakes, and structural condition, inspections ensure that vehicles meet safety
                                                    and environmental standards. It also helps owners understand the current condition and value of their vehicle.
                                                </p>
                                            </div>

                                            <div className="d-flex flex-md-row flex-column align-items-center justify-content-center gap-3 mb-30">
                                                <div>
                                                    <img src="assets/imgs/app/app-1/inspection.webp" alt="Vehicle Inspection" />
                                                </div>
                                                <div>
                                                    <img src="assets/imgs/app/app-1/scrap-main1.jpg" alt="Vehicle Condition Check" />
                                                </div>
                                            </div>

                                            <div className="content-detail-post">

                                                <h6>Comprehensive Vehicle Condition Assessment</h6>
                                                <p>
                                                    Our inspection process focuses on evaluating the overall condition of the vehicle, including body structure,
                                                    mechanical parts, and essential safety components. This detailed assessment helps determine whether the vehicle
                                                    can continue operating safely or if further action is required.
                                                </p>

                                                <h6>Checking Safety and Environmental Compliance</h6>
                                                <p>
                                                    During inspection, we verify that the vehicle meets important safety and environmental standards. This includes
                                                    examining emissions, structural stability, and essential safety features to ensure the vehicle does not pose
                                                    risks to the driver, passengers, or the environment.
                                                </p>

                                                <h6>Professional Evaluation by Experienced Experts</h6>
                                                <p>
                                                    At Bharat Scrap Facilities, our experienced professionals conduct inspections with attention to detail and
                                                    accuracy. We provide clear insights into the condition of the vehicle, helping owners make informed decisions
                                                    about maintenance, resale, or scrapping.
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
                                    <img src="assets/imgs/step/s1.png" alt="step 1" />
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
                                    <img src="assets/imgs/step/s3.png" alt="step 3" />
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
                                    <img src="assets/imgs/step/s4.png" alt="step 4" />
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
                                    <img src="assets/imgs/step/s5.png" alt="step 5" />
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
