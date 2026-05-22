'use client'
import React, { useState } from 'react'

// Popup Modal Component
function StatusPopup({ status, onClose }) {
    if (!status) return null;
    const isSuccess = status === 'success';

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                animation: 'fadeIn 0.2s ease'
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
            `}</style>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '40px 32px',
                    maxWidth: '420px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    animation: 'slideUp 0.25s ease'
                }}
            >
                <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: isSuccess ? '#e6f9f0' : '#ffeaea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '32px',
                    color: isSuccess ? '#16a34a' : '#dc2626'
                }}>
                    {isSuccess ? '✓' : '✕'}
                </div>

                <h3 style={{
                    margin: '0 0 10px',
                    fontSize: '22px', fontWeight: '700',
                    color: isSuccess ? '#16a34a' : '#dc2626'
                }}>
                    {isSuccess ? 'Quote Request Sent!' : 'Submission Failed'}
                </h3>

                <p style={{ margin: '0 0 28px', color: '#6b7280', fontSize: '15px', lineHeight: '1.5' }}>
                    {isSuccess
                        ? 'Thank you! Our team will get back to you with a quote shortly.'
                        : 'Something went wrong. Please check your details and try again.'}
                </p>

                <button
                    onClick={onClose}
                    style={{
                        padding: '12px 32px',
                        borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '15px', fontWeight: '600',
                        background: isSuccess ? '#16a34a' : '#dc2626',
                        color: '#fff',
                        transition: 'opacity 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                    {isSuccess ? 'Done' : 'Try Again'}
                </button>
            </div>
        </div>
    );
}

const EMPTY_FORM = {
    name: "", email: "", phone: "", message: "",
    brand: "", model: "", year: "", fuelType: "", city: ""
};

export default function HomeSearch() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://www.api.bharatscrapfacilities.com/api";
    const [loading, setLoading] = useState(false);
    const [popupStatus, setPopupStatus] = useState(null); // 'success' | 'error' | null
    const [formData, setFormData] = useState(EMPTY_FORM);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/contact/create-quote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setPopupStatus('success');
                setFormData(EMPTY_FORM); // reset form
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
            <StatusPopup status={popupStatus} onClose={() => setPopupStatus(null)} />

            <section className="box-section box-search-advance-home10">
                <div id="filter_form2">
                    <div className="container">
                        <div className="main_bg white-text">
                            <h4 className="form-heading">GET AN INSTANT QUOTE</h4>
                            <form onSubmit={handleFormSubmit}>
                                <div className="row">
                                    <div className="form-group col-md-3 col-sm-6">
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" placeholder="Name*" required="" />
                                    </div>
                                    <div className="form-group col-md-3 col-sm-6">
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" maxLength={10} placeholder="Phone Number*"
                                            required="" />
                                    </div>
                                    <div className="form-group col-md-3 col-sm-6">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="Email Id*" required="" />
                                    </div>
                                    <div className="form-group col-md-3 col-sm-6">
                                        <div className="">
                                            <select name="brand" value={formData.brand} onChange={handleChange} className="form-control">
                                                <option value="">Select Car Brand</option>
                                                <option value="Maruti">Maruti</option>
                                                <option value="Mahindra">Mahindra</option>
                                                <option value="TATA">TATA</option>
                                                <option value="Hyundai">Hyundai</option>
                                                <option value="Chevrolet">Chevrolet</option>
                                                <option value="FIAT">FIAT</option>
                                                <option value="Ford">Ford</option>
                                                <option value="Honda">Honda</option>
                                                <option value="Mitsubishi">Mitsubishi</option>
                                                <option value="Nissan">Nissan</option>
                                                <option value="Renault">Renault</option>
                                                <option value="Skoda">Skoda</option>
                                                <option value="Toyota">Toyota</option>
                                                <option value="Volkswagen">Volkswagen</option>
                                                <option value="Force">Force</option>
                                                <option value="Hindustan Motors">Hindustan Motors</option>
                                                <option value="Mercedes">Mercedes</option>
                                                <option value="BMW">BMW</option>
                                                <option value="Audi">Audi</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group col-md-3 col-sm-6">
                                        <div className="">
                                            <select name="model" id="model" value={formData.model} onChange={handleChange} className="form-control" defaultValue="">
                                                <option disabled value="">Model</option>
                                                <option value="Omni">Omni</option>
                                                <option value="Alto">Alto</option>
                                                <option value="Alto k10">Alto k10</option>
                                                <option value="WagonR">WagonR</option>
                                                <option value="Estilo">Estilo</option>
                                                <option value="A-Star">A-Star</option>
                                                <option value="Eeco">Eeco</option>
                                                <option value="Maruti 800">Maruti 800</option>
                                                <option value="Swift">Swift</option>
                                                <option value="Ritz">Ritz</option>
                                                <option value="Sx4">Sx4</option>
                                                <option value="Dzire">Dzire</option>
                                                <option value="Kizashi">Kizashi</option>
                                                <option value="Gypsy">Gypsy</option>
                                                <option value="Grand Vitara">Grand Vitara</option>
                                                <option value="Baleeno">Baleeno</option>
                                                <option value="Esteem">Esteem</option>
                                                <option value="Ciaz">Ciaz</option>
                                                <option value="Baleeno New">Baleeno New</option>
                                                <option value="S-Cross">S-Cross</option>
                                                <option value="Brezza">Brezza</option>
                                                <option value="Ertiga">Ertiga</option>
                                                <option value="Celerio">Celerio</option>
                                                <option value="Ignis">Ignis</option>
                                                <option value="Zen">Zen</option>
                                                <option value="Verito">Verito</option>
                                                <option value="Xylo">Xylo</option>
                                                <option value="Bolero">Bolero</option>
                                                <option value="XUV 500">XUV 500</option>
                                                <option value="Thar">Thar</option>
                                                <option value="Commander">Commander</option>
                                                <option value="Marshall">Marshall</option>
                                                <option value="Scorpio">Scorpio</option>
                                                <option value="Quanto">Quanto</option>
                                                <option value="TUV 300">TUV 300</option>
                                                <option value="KUV 100">KUV 100</option>
                                                <option value="Marazzo">Marazzo</option>
                                                <option value="Alturas">Alturas</option>
                                                <option value="Indica V2">Indica V2</option>
                                                <option value="Indica TDI">Indica TDI</option>
                                                <option value="Nano">Nano</option>
                                                <option value="Manza">Manza</option>
                                                <option value="Indigo">Indigo</option>
                                                <option value="Sumo Grand">Sumo Grand</option>
                                                <option value="Sumo Victa">Sumo Victa</option>
                                                <option value="Sumo Gold">Sumo Gold</option>
                                                <option value="Vista">Vista</option>
                                                <option value="Safari">Safari</option>
                                                <option value="Aria">Aria</option>
                                                <option value="Estate">Estate</option>
                                                <option value="Bolt">Bolt</option>
                                                <option value="Zest">Zest</option>
                                                <option value="Tiago">Tiago</option>
                                                <option value="Tigor">Tigor</option>
                                                <option value="Heza">Heza</option>
                                                <option value="Sumo Gold">Sumo Gold</option>
                                                <option value="Nexon">Nexon</option>
                                                <option value="Storme">Storme</option>
                                                <option value="Santro">Santro</option>
                                                <option value="i10">i10</option>
                                                <option value="i20">i20</option>
                                                <option value="Eon">Eon</option>
                                                <option value="Accent">Accent</option>
                                                <option value="Verna">Verna</option>
                                                <option value="Sonata Embera">Sonata Embera</option>
                                                <option value="Sonata">Sonata</option>
                                                <option value="Santa Fe">Santa Fe</option>
                                                <option value="Terracan">Terracan</option>
                                                <option value="i10 Grand">i10 Grand</option>
                                                <option value="Elantra">Elantra</option>
                                                <option value="Tucson">Tucson</option>
                                                <option value="i20 Active">i20 Active</option>
                                                <option value="Xcent">Xcent</option>
                                                <option value="Getz">Getz</option>
                                                <option value="Beat">Beat</option>
                                                <option value="Spark">Spark</option>
                                                <option value="Aveo">Aveo</option>
                                                <option value="Optra">Optra</option>
                                                <option value="Cruze">Cruze</option>
                                                <option value="Captiva">Captiva</option>
                                                <option value="Enjoy">Enjoy</option>
                                                <option value="Forester">Forester</option>
                                                <option value="Sail">Sail</option>
                                                <option value="U-va">U-va</option>
                                                <option value="Tavera">Tavera</option>
                                                <option value="Palio">Palio</option>
                                                <option value="Linea">Linea</option>
                                                <option value="Grand Punto">Grand Punto</option>
                                                <option value="Sienna">Sienna</option>
                                                <option value="Ikon">Ikon</option>
                                                <option value="Fusion">Fusion</option>
                                                <option value="Classic">Classic</option>
                                                <option value="Fiesta">Fiesta</option>
                                                <option value="Figo">Figo</option>
                                                <option value="Endaevour 2.5">Endaevour 2.5</option>
                                                <option value="Endaevour 3.0">Endaevour 3.0</option>
                                                <option value="Ecosport">Ecosport</option>
                                                <option value="Freestyle">Freestyle</option>
                                                <option value="Aspire">Aspire</option>
                                                <option value="Cr-V">Cr-V</option>
                                                <option value="City">City</option>
                                                <option value="Brio">Brio</option>
                                                <option value="Jazz">Jazz</option>
                                                <option value="Accord">Accord</option>
                                                <option value="Amaze">Amaze</option>
                                                <option value="Civic">Civic</option>
                                                <option value="Mobilio">Mobilio</option>
                                                <option value="Pajero">Pajero</option>
                                                <option value="Pajero Sport">Pajero Sport</option>
                                                <option value="Montero">Montero</option>
                                                <option value="Lancer">Lancer</option>
                                                <option value="Cedia">Cedia</option>
                                                <option value="Outlander">Outlander</option>
                                                <option value="Micra">Micra</option>
                                                <option value="Sunny">Sunny</option>
                                                <option value="Xtrail">Xtrail</option>
                                                <option value="Terraeno">Terraeno</option>
                                                <option value="Teana">Teana</option>
                                                <option value="Evalia">Evalia</option>
                                                <option value="Kwid">Kwid</option>
                                                <option value="Pulse">Pulse</option>
                                                <option value="Duster">Duster</option>
                                                <option value="Lodgy">Lodgy</option>
                                                <option value="Fluence">Fluence</option>
                                                <option value="Koleos">Koleos</option>
                                                <option value="Scala">Scala</option>
                                                <option value="Captur">Captur</option>
                                                <option value="Fabia">Fabia</option>
                                                <option value="Laura">Laura</option>
                                                <option value="Yeti">Yeti</option>
                                                <option value="Octavia">Octavia</option>
                                                <option value="Superb">Superb</option>
                                                <option value="Liva">Liva</option>
                                                <option value="Etios">Etios</option>
                                                <option value="Corolla">Corolla</option>
                                                <option value="Qualis">Qualis</option>
                                                <option value="Land Cruiser Prado">Land Cruiser Prado</option>
                                                <option value="Land Cruiser">Land Cruiser</option>
                                                <option value="Corolla Altis">Corolla Altis</option>
                                                <option value="Innova">Innova</option>
                                                <option value="Camry">Camry</option>
                                                <option value="Fortuner">Fortuner</option>
                                                <option value="Polo">Polo</option>
                                                <option value="Vento">Vento</option>
                                                <option value="Jetta">Jetta</option>
                                                <option value="Ameo">Ameo</option>
                                                <option value="Passat">Passat</option>
                                                <option value="Phateon">Phateon</option>
                                                <option value="Beetle">Beetle</option>
                                                <option value="Touareg">Touareg</option>
                                                <option value="Tiguan">Tiguan</option>
                                                <option value="Force One">Force One</option>
                                                <option value="Toofan">Toofan</option>
                                                <option value="Gurkha">Gurkha</option>
                                                <option value="Ambassador">Ambassador</option>
                                                <option value="Contessa">Contessa</option>
                                                <option value="C Class">C Class</option>
                                                <option value="E Class">E Class</option>
                                                <option value="S Class">S Class</option>
                                                <option value="ML Class">ML Class</option>
                                                <option value="GL Class">GL Class</option>
                                                <option value="G Class">G Class</option>
                                                <option value="3 Series">3 Series</option>
                                                <option value="5 Series">5 Series</option>
                                                <option value="7 Series">7 Series</option>
                                                <option value="A4">A4</option>
                                                <option value="1991">A6</option>
                                                <option value="older">A8</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group col-md-3 col-sm-6">
                                        <select name="year" id="year" value={formData.year} onChange={handleChange} className="form-control">
                                            <option value="" disabled>Year</option>
                                            {Array.from({ length: 2024 - 1991 + 1 }, (_, i) => 2024 - i).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                            <option value="older">Older</option>
                                        </select>
                                    </div>

                                    <div className="form-group col-md-3 col-sm-6">
                                        <div className="">
                                            <select className="form-control" name="fuelType" value={formData.fuelType} onChange={handleChange}>
                                                <option>Fuel Type </option>
                                                <option value="Diesel">Diesel</option>
                                                <option value="Petrol">Petrol</option>
                                                <option value="CNG">CNG</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group col-md-3 col-sm-6">
                                        <div className="">
                                            <select className="form-control" name="city" value={formData.city} onChange={handleChange}>
                                                <option>Select City </option>
                                                <option value="Delhi NCR" style={{ fontWeight: 600 }}>----Cities of Delhi NCR----</option>
                                                <option value="Delhi">Delhi</option>
                                                <option value="Faridabad">Faridabad</option>
                                                <option value="Gurugram">Gurugram</option>
                                                <option value="Ghaziabad">Ghaziabad</option>
                                                <option value="Greater Noida">Greater Noida</option>
                                                <option value="Noida">Noida</option>
                                                <option value="Karnal">Karnal</option>
                                                <option value="Jind">Jind</option>
                                                <option value="Panipat">Panipat</option>
                                                <option value="Sonipat">Sonipat</option>
                                                <option value="Rohtak">Rohtak</option>
                                                <option value="Bhiwani">Bhiwani</option>
                                                <option value="Charkhi Dadri">Charkhi Dadri</option>
                                                <option value="Jhajjar">Jhajjar</option>
                                                <option value="Mahendragarh">Mahendragarh</option>
                                                <option value="Rewari">Rewari</option>
                                                <option value="Nuh">Nuh</option>
                                                <option value="Palwal">Palwal</option>
                                                <option value="Shamli">Shamli</option>
                                                <option value="Muzaffarnagar">Muzaffarnagar</option>
                                                <option value="Baghpat">Baghpat</option>
                                                <option value="Meerut">Meerut</option>
                                                <option value="Hapur">Hapur</option>
                                                <option value="Bulandshahr">Bulandshahr</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group col-md-3 col-sm-6" disabled={loading}>
                                        <button type="submit" className="btn btn-dark">{loading ? 'Submitting...' : 'GET A QUOTE NOW!'}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
