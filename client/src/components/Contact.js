import React from 'react'

export default function Contact() {
    return (
        <>
            {/* <!-- Breadcrumb Banner --> */}
            <section className="breadcrumb-banner position-relative">
                <div className="container position-relative z-1 text-center">
                    <h2 className="color-white mb-2">Contact Us</h2>
                    <p className="text-white">
                        <a href="/" className="text-white">Home</a> / Contact Us
                    </p>
                </div>
            </section>



            <section className="box-section box-contact-form background-body pb-40">
                <div className="container">
                    <div className="row mb-40">
                        <div className="col-md-8 offset-md-2 wow fadeInUp" style={{visibility:'visible'}} >
                            <h3 className="title-svg neutral-1000 mb-5 text-center">Contact Us</h3>
                            <p className="text-lg-medium text-bold neutral-500 text-center">
                                Get in touch with our team for vehicle scrapping services, pickup requests, or any inquiries
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12 mb-30">
                            <div id="contact-cards-wrapper">

                                {/* <!-- Phone Card --> */}
                                <div className="contact-card" id="contact-card-phone">
                                    <div className="contact-icon">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <h4 className="contact-title">Call Us</h4>
                                    <a className="contact-text" href="tel:+9355222165">
                                        +91 9355222165
                                    </a>
                                </div>

                                {/* <!-- Email Card --> */}
                                <div className="contact-card" id="contact-card-email">
                                    <div className="contact-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <h4 className="contact-title">Email Us</h4>
                                    <a className="contact-text" href="mailto:bharatscarpfacility@gmail.com">
                                        bharatscarpfacility@gmail.com
                                    </a>
                                </div>

                                {/* <!-- Address Card --> */}
                                <div className="contact-card" id="contact-card-address">
                                    <div className="contact-icon">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <h4 className="contact-title">Our Address</h4>
                                    <p className="contact-text">
                                        Gata No.142, Near Testify Rice Mill, Rajarampur,
                                        Sikandarabad Industrial Area, Bulandshahar – 203205
                                    </p>
                                </div>



                            </div>

                        </div>
                    </div>
                    <div className="row contact-fm ">
                        <div className="col-lg-6 mb-30 ">
                            {/* <!-- <h4 className="neutral-1000 mb-25">Get in Touch</h4> --> */}
                            <div className="form-contact">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label className="text-sm-medium neutral-1000">First Name</label>
                                            <input className="form-control username" type="text" placeholder="First Name" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label className="text-sm-medium neutral-1000">Last Name</label>
                                            <input className="form-control username" type="text" placeholder="Last Name" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label className="text-sm-medium neutral-1000">Email Adress</label>
                                            <input className="form-control email" type="email" placeholder="email@domain.com" />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label className="text-sm-medium neutral-1000">Phone Number</label>
                                            <input className="form-control phone" type="text" placeholder="Phone number" />
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label className="text-sm-medium neutral-1000">Your Message</label>
                                            <textarea className="form-control" rows="6" placeholder="Leave us a message..."></textarea>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <button className="btn btn-book">
                                            Send message
                                            <svg width="17" height="16" viewBox="0 0 17 16" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.5 15L15.5 8L8.5 1M15.5 8L1.5 8" stroke="" strokeWidth="1.5"
                                                    strokeLinecap="round"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-30 ">
                            <section className="box-section background-body">
                                <div className="container">
                                    <div className="">
                                        <h4 className="neutral-1000">Our location</h4>
                                        {/* <!-- <p className="neutral-500 mb-30">Gata No.142, Near Testify Rice Mill, Rajarampur,
                                            Sikandarabad Industrial Area, Bulandshahar – 203205</p> --> */}
                                        <iframe className="h-520 rounded-3"
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112212.27981824994!2d77.57599080594876!3d28.490574719174113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c976969c55465%3A0xdb1c8da4d55fcc5f!2sBharat%20Scrap%20Facilities!5e0!3m2!1sen!2sin!4v1773144194189!5m2!1sen!2sin"
                                            width="100%" height={450} style={{border:'0'}} allowFullScreen="" loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"></iframe>

                                    </div>

                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
