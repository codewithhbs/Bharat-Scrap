"use client";
import React, { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://www.api.bharatscrapfacilities.com/api";

export default function Contact() {
    const [loading, setLoading] = useState(false);
    const [popupStatus, setPopupStatus] = useState(null); // 'success' | 'error' | null
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", phone: "", message: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone,
                message: formData.message
            };
            const response = await fetch(`${API_URL}/contact/create-contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setPopupStatus('success');
                setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
            } else {
                setPopupStatus('error');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setPopupStatus('error');
        }
        setLoading(false);
    };

    return (
        <>
            {/* Popup Modal */}
            {popupStatus && (
                <div style={styles.overlay}>
                    <div style={styles.popup}>
                        <div style={styles.iconWrapper(popupStatus)}>
                            {popupStatus === 'success' ? (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="12" fill="#22c55e" />
                                    <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="12" fill="#ef4444" />
                                    <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            )}
                        </div>
                        <h4 style={styles.popupTitle(popupStatus)}>
                            {popupStatus === 'success' ? 'Message Sent!' : 'Something Went Wrong'}
                        </h4>
                        <p style={styles.popupMsg}>
                            {popupStatus === 'success'
                                ? 'Thank you for reaching out. We will get back to you shortly.'
                                : 'Unable to send your message. Please try again or contact us directly.'}
                        </p>
                        <button style={styles.closeBtn(popupStatus)} onClick={() => setPopupStatus(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Breadcrumb Banner */}
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
                        <div className="col-md-8 offset-md-2 wow fadeInUp" style={{ visibility: 'visible' }}>
                            <h3 className="title-svg neutral-1000 mb-5 text-center">Contact Us</h3>
                            <p className="text-lg-medium text-bold neutral-500 text-center">
                                Get in touch with our team for vehicle scrapping services, pickup requests, or any inquiries
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-12 mb-30">
                            <div id="contact-cards-wrapper">
                                <div className="contact-card" id="contact-card-phone">
                                    <div className="contact-icon"><i className="fas fa-phone"></i></div>
                                    <h4 className="contact-title">Call Us</h4>
                                    <a className="contact-text" href="tel:+9355222165">+91 9355222165</a>
                                </div>
                                <div className="contact-card" id="contact-card-email">
                                    <div className="contact-icon"><i className="fas fa-envelope"></i></div>
                                    <h4 className="contact-title">Email Us</h4>
                                    <a className="contact-text" href="mailto:bharatscarpfacility@gmail.com">bharatscarpfacility@gmail.com</a>
                                </div>
                                <div className="contact-card" id="contact-card-address">
                                    <div className="contact-icon"><i className="fas fa-map-marker-alt"></i></div>
                                    <h4 className="contact-title">Our Address</h4>
                                    <p className="contact-text">
                                        Gata No.142, Near Testify Rice Mill, Rajarampur,
                                        Sikandarabad Industrial Area, Bulandshahar – 203205
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row contact-fm">
                        <div className="col-lg-6 mb-30">
                            <div className="form-contact">
                                <form onSubmit={handleFormSubmit}>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="form-group">
                                                <label className="text-sm-medium neutral-1000">First Name</label>
                                                <input
                                                    className="form-control username"
                                                    type="text"
                                                    name="firstName"
                                                    placeholder="First Name"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group">
                                                <label className="text-sm-medium neutral-1000">Last Name</label>
                                                <input
                                                    className="form-control username"
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Last Name"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group">
                                                <label className="text-sm-medium neutral-1000">Email Address</label>
                                                <input
                                                    className="form-control email"
                                                    type="email"
                                                    name="email"
                                                    placeholder="email@domain.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="form-group">
                                                <label className="text-sm-medium neutral-1000">Phone Number</label>
                                                <input
                                                    className="form-control phone"
                                                    type="text"
                                                    name="phone"
                                                    placeholder="Phone number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <div className="form-group">
                                                <label className="text-sm-medium neutral-1000">Your Message</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="6"
                                                    name="message"
                                                    placeholder="Leave us a message..."
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="col-lg-12">
                                            <button className="btn btn-book" type="submit" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        Send message
                                                        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8.5 15L15.5 8L8.5 1M15.5 8L1.5 8" stroke="" strokeWidth="1.5" strokeLinecap="round"></path>
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-6 mb-30">
                            <section className="box-section background-body">
                                <div className="container">
                                    <div className="">
                                        <h4 className="neutral-1000">Our location</h4>
                                        <iframe
                                            className="h-520 rounded-3"
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112212.27981824994!2d77.57599080594876!3d28.490574719174113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c976969c55465%3A0xdb1c8da4d55fcc5f!2sBharat%20Scrap%20Facilities!5e0!3m2!1sen!2sin!4v1773144194189!5m2!1sen!2sin"
                                            width="100%"
                                            height={450}
                                            style={{ border: '0' }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

// Inline styles for popup
const styles = {
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999
    },
    popup: {
        background: '#fff', borderRadius: '16px', padding: '40px 32px',
        maxWidth: '420px', width: '90%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },
    iconWrapper: () => ({ marginBottom: '16px' }),
    popupTitle: (status) => ({
        fontSize: '22px', fontWeight: '700', marginBottom: '10px',
        color: status === 'success' ? '#22c55e' : '#ef4444'
    }),
    popupMsg: {
        fontSize: '15px', color: '#555', marginBottom: '24px', lineHeight: '1.6'
    },
    closeBtn: (status) => ({
        padding: '10px 32px', borderRadius: '8px', border: 'none',
        cursor: 'pointer', fontWeight: '600', fontSize: '15px', color: '#fff',
        backgroundColor: status === 'success' ? '#22c55e' : '#ef4444'
    })
};