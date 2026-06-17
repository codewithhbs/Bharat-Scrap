import React from 'react'

export default function Footer() {
  return (
    <>
          {/* <!-- Footer --> */}
    <footer className="footer">
        <div className="container">
            <div className="footer-top">
                <div className="row align-items-center">
                    <div className="col-lg-5 col-md-6 text-center text-md-start">
                        <h5 className="color-white wow fadeInDown">
                            Sell your old vehicle today and get the best scrap value instantly!
                        </h5>
                    </div>
                    <div className="col-lg-7 col-md-6 text-center text-md-end mt-md-0 mt-4">
                        <div className="d-flex align-items-center justify-content-center justify-content-md-end">
                            <form className="form-newsletter wow fadeInUp" action="#">
                                <input className="form-control" type="text" placeholder="Enter your email" />
                                <input className="btn btn-brand-2" type="submit" value="Subscribe" />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-4 col-sm-12 pe-lg-5 pe-0">
                    <div className="mt-20 mb-20">
                        <a className="d-flex footer-logo" href="/">
                            <img className="" alt="logo" src="assets/imgs/logo/logo-light.png" />
                        </a>
                        <div className="box-info-contact mt-0">
                            <p className="text-md neutral-400">
                                Bharat Scrap Facilities offers reliable and eco-friendly vehicle scrapping services with
                                professional pickup and proper documentation support.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 col-xs-6">
                    <h6 className="text-linear-3">Company</h6>
                    <ul className="menu-footer">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about-us">About Us</a></li>
                        <li><a href="/faqs">FAQ`s</a></li>
                        <li><a href="/contact-us">Contact Us</a></li>
                        <li><a href="/privacy-policy">Privacy Policy </a></li>
                    </ul>
                </div>
                <div className="col-md-3 col-xs-6 ">
                    <div className="box-info-contact mt-0">
                        <h6 className="text-linear-3">Our Services</h6>
                        <ul className="menu-footer">
                            <li><a href="scrap-your-vehicle">Scrap Your Vehicle</a></li>
                            <li><a href="vehicle-inspection">Vehicle Inspection</a></li>
                            {/* <li><a href="contact-us">Online Vehicle Scrapping</a></li>
                            <li><a href="contact-us">Immediately Pickup</a></li>
                            <li><a href="contact-us">Instant Payment & Settlement</a></li> */}
                        </ul>



                    </div>
                </div>

                <div className="col-md-3 col-sm-12 ">
                    <h6 className="text-linear-3">Contact Us</h6>
                    <div className="mt-20 mb-20">
                        <div className="box-info-contact mt-0 contact-no">
                            <a href="tel:+9355222165">
                                <p className="text-md neutral-400">
                                    <i className="fas fa-phone-alt"></i>+91 9355222165
                                </p>
                            </a>
                            <a href="mailto:bharatscarpfacility@gmail.com" target="_blank" rel="noopener noreferrer">
                                <p className="text-md neutral-400 icon-email">bharatscarpfacility@gmail.com</p>
                            </a>
                            <p className="text-md neutral-400 icon-address">Gata No.142, Near Testify Rice Mill, Rajarampur,
                                Sikandarabad Industrial Area, Bulandshahar – 203205</p>
                        </div>

                    </div>
                    <div className="social-icons d-flex gap-3">
                        <a href="https://web.archive.org/web/20251009165400/https://www.facebook.com/profile.php?id=100090914178310"
                            target="_blank"><i className="fab fa-facebook-f"></i></a>
                        <a href="https://web.archive.org/web/20251009165400/https://www.instagram.com/bharatscrapfacilities/"
                            target="_blank"><i className="fab fa-instagram"></i></a>
                        <a href="https://web.archive.org/web/20251009165400/https://twitter.com/bharat_scrap"
                            target="_blank"><i className="fab fa-twitter"></i></a>
                        <a href="mailto:bharatscrapfacilities@gmail.com"><i className="fas fa-envelope"></i></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom mt-50">
                <div className="row align-items-center justify-content-center">

                    <div className="col-md-6 text-md-start text-center mb-20">
                        <p className="text-sm color-white">
                            © 2026 Bharat Scrap Facilities. All Rights Reserved.
                        </p>
                    </div>

                    <div className="col-md-6 text-md-end text-center mb-20">
                        <p className="text-sm color-white">
                            Developed by <a href="https://hoverbusinessservices.com/" className="text-white">Hover Business
                                Services LLP</a>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    </footer>

    {/* <!-- floating button start --> */}
    <a href="tel:+9355222165" className="floating-call contact-no">
       <i className="fas fa-phone-alt" ></i>
    </a>

    {/* <!-- WhatsApp Button --> */}
    <a href="https://wa.me/9355222165" className="floating-whatsapp" target="_blank">
        <i className="fab fa-whatsapp"></i>
    </a>
    {/* <!-- floating button end --> */}
    </>
  )
}
