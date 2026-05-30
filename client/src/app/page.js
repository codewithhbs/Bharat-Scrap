import Brand from '@/components/Brand'
import FAQ from '@/components/FAQ'
import HomeSearch from '@/components/HomeSearch'
import Service from '@/components/Service'
import React from 'react'

export default function Home() {
  return (
    <main className="main">
      {/* <!-- hero 1 --> */}
      <section className="box-section block-banner-home1 position-relative">

        <div className="container position-relative z-1">
          <div className="row">
            <div className="col-md-7">
              <p className="text-white text-md-bold wow fadeInUp">Authorized Vehicle Scrapping Facility</p>

              <h2 className="color-white mb-35 wow fadeInUp">
                Safe & Eco-Friendly Vehicle Scrapping Services
              </h2>

              <ul className="list-ticks-green">
                <li className="wow fadeInUp" data-wow-delay="0.1s">Government authorized vehicle dismantling facility.</li>
                <li className="wow fadeInUp" data-wow-delay="0.2s">Best scrap value for your old and damaged vehicles.</li>
                <li className="wow fadeInUp" data-wow-delay="0.4s">Environmentally responsible recycling process.</li>
              </ul>
            </div>
            <div className="col-md-5">
              <img src="assets/imgs/banners/car.png" alt="Scrap Car" />
            </div>
          </div>
        </div>
        <div className="bg-shape z-0"></div>
      </section>

      {/* <!-- search 1 --> */}
      {/* <section className="box-section box-search-advance-home10">
        <div id="filter_form2">
          <div className="container">
            <div className="main_bg white-text">
              <h4 className="form-heading">GET AN INSTANT QUOTE</h4>
              <form action="" method="post">
                <div className="row">
                  <div className="form-group col-md-3 col-sm-6">
                    <input type="text" name="name" className="form-control" placeholder="Name*" required="" />
                  </div>
                  <div className="form-group col-md-3 col-sm-6">
                    <input type="tel" name="number" className="form-control" maxLength={10} placeholder="Phone Number*"
                      required="" />
                  </div>
                  <div className="form-group col-md-3 col-sm-6">
                    <input type="email" name="email" className="form-control" placeholder="Email Id*" required="" />
                  </div>
                  <div className="form-group col-md-3 col-sm-6">
                    <div className="">
                      <select name="brand" className="form-control">
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
                      <select name="model" id="year" className="form-control" defaultValue="">
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
                    <div className="">
                      <select name="year" id="year" className="form-control" defaultValue={""}>
                        <option disabled value="">Year</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="2019">2019</option>
                        <option value="2018">2018</option>
                        <option value="2017">2017</option>
                        <option value="2016">2016</option>
                        <option value="2015">2015</option>
                        <option value="2014">2014</option>
                        <option value="2013">2013</option>
                        <option value="2012">2012</option>
                        <option value="2011">2011</option>
                        <option value="2010">2010</option>
                        <option value="2009">2009</option>
                        <option value="2008">2008</option>
                        <option value="2007">2007</option>
                        <option value="2006">2006</option>
                        <option value="2005">2005</option>
                        <option value="2004">2004</option>
                        <option value="2003">2003</option>
                        <option value="2002">2002</option>
                        <option value="2001">2001</option>
                        <option value="2000">2000</option>
                        <option value="1999">1999</option>
                        <option value="1998">1998</option>
                        <option value="1997">1997</option>
                        <option value="1996">1996</option>
                        <option value="1995">1995</option>
                        <option value="1994">1994</option>
                        <option value="1993">1993</option>
                        <option value="1992">1992</option>
                        <option value="1991">1991</option>
                        <option value="older">Older</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group col-md-3 col-sm-6">
                    <div className="">
                      <select className="form-control" name="type">
                        <option>Fuel Type </option>
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="CNG">CNG</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group col-md-3 col-sm-6">
                    <div className="">
                      <select className="form-control" name="city">
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
                  <div className="form-group col-md-3 col-sm-6">
                    <button type="submit" className="btn btn-dark">GET A QUOTE NOW! </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section> */}
      <HomeSearch />



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
      </section>

      {/* <!-- Services --> */}
      <Service />

      {/* <!-- cta 1--> */}
      <section className="box-cta-1 background-100 py-96">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 pe-lg-5 wow fadeInUp">
              <div className="card-video">
                <div className="card-image">
                  {/* <!-- <a className="btn btn-play popup-youtube" href="https://www.youtube.com/watch?v=AOg61RB75Ho"></a> --> */}
                  <img src="assets/imgs/app/app-1/why-choose-img.webp" alt="Image" />
                </div>
              </div>
            </div>
            <div className="col-lg-6 mt-lg-0 mt-4">
              <span className="btn btn-signin bg-white text-dark mb-4 wow fadeInUp">Why Choose Us</span>

              <h4 className="mb-4 neutral-1000 wow fadeInUp">
                Trusted and Government Authorized Vehicle Scrapping Services
              </h4>

              <p className="text-lg-medium neutral-500 mb-4 wow fadeInUp">
                Bharat Scrap Facilities provides reliable, transparent, and environmentally responsible
                vehicle scrapping services. With years of experience and a professional team,
                we ensure a safe and hassle-free scrapping process for every customer.
              </p>

              <div className="row">

                <div className="col-md-6">
                  <ul className="list-ticks-green">
                    <li className="neutral-1000 wow fadeInUp" data-wow-delay="0.1s">
                      Government Authorized Facility
                    </li>
                    <li className="neutral-1000 wow fadeInUp" data-wow-delay="0.2s">
                      Fair and Competitive Scrap Prices
                    </li>
                    <li className="neutral-1000 wow fadeInUp" data-wow-delay="0.3s">
                      Environmentally Responsible Recycling
                    </li>
                  </ul>
                </div>

                <div className="col-md-6">
                  <ul className="list-ticks-green wow fadeInUp">
                    <li className="neutral-1000 wow fadeInUp" data-wow-delay="0.1s">
                      Professional and Experienced Team
                    </li>
                    <li className="neutral-1000 wow fadeInUp" data-wow-delay="0.2s">
                      Quick Documentation & RC Cancellation
                    </li>
                    <li className="neutral-1000 wow fadeInUp" data-wow-delay="0.3s">
                      Free Vehicle Pickup Service
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- why-us-1 --> */}
      <section className="section-box box-why-book-22 background-body @@classList pt-100">
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

      {/* <!-- cta 2--> */}
      <section className="box-cta-2 background-body overflow-hidden">
        <div className="bg-shape top-50 start-50 translate-middle"></div>

        <div className="container position-relative z-1">

          {/* <!-- Heading --> */}
          <div className="row">
            <div className="col-lg-5 pe-lg-5">

              <h3 className="text-white wow fadeInDown">
                We Have Heavy Duty Machines
              </h3>

              <p className="text-lg-medium text-white wow fadeInUp mt-3">
                Our facility is equipped with modern heavy-duty machinery designed
                for efficient and safe vehicle dismantling.
              </p>

            </div>

            <div className="col-lg-7">

              <p className="text-lg-medium text-white wow fadeInUp">
                At Bharat Scrap Facilities, we use specialized equipment and
                professional techniques to handle every step of the scrapping
                process with precision. From vehicle inspection to dismantling
                and recycling, our machines help ensure that every vehicle is
                processed responsibly and in compliance with government
                regulations.
              </p>

              <p className="text-lg-medium text-white wow fadeInUp mt-3">
                Our goal is to provide fast, reliable, and eco-friendly vehicle
                scrapping services while delivering the best value and a
                hassle-free experience for our customers.
              </p>

            </div>
          </div>

          {/* <!-- Stats --> */}
          <div className="row align-items-center">
            <div className="border-top py-3 mt-3"></div>

            <div className="col-lg-7 mb-20 wow fadeIn">

              <div className="row">

                {/* <!-- Years --> */}
                <div className="col-md-3 col-6 mb-md-0 mb-4 d-flex flex-column align-items-center align-items-md-start">
                  <div className="d-flex">
                    <h3 className="count text-white"><span className="odometer" data-count="20"></span></h3>
                    <h3 className="text-white">+</h3>
                  </div>

                  <p className="text-lg-bold text-white">Years</p>
                  <p className="text-lg-bold text-white">Experience</p>
                </div>


                {/* <!-- Cars Scrapped --> */}
                <div className="col-md-3 col-6 mb-md-0 mb-4 d-flex flex-column align-items-center align-items-md-start">
                  <div className="d-flex">
                    <h3 className="count text-white"><span className="odometer" data-count="5000"></span></h3>
                    <h3 className="text-white">+</h3>
                  </div>

                  <p className="text-lg-bold text-white">Cars</p>
                  <p className="text-lg-bold text-white">Scrapped</p>
                </div>


                {/* <!-- Happy Clients --> */}
                <div className="col-md-3 col-6 mb-md-0 mb-4 d-flex flex-column align-items-center align-items-md-start">
                  <div className="d-flex">
                    <h3 className="count text-white"><span className="odometer" data-count="3000"></span></h3>
                    <h3 className="text-white">+</h3>
                  </div>

                  <p className="text-lg-bold text-white">Happy</p>
                  <p className="text-lg-bold text-white">Clients</p>
                </div>


                {/* <!-- Team --> */}
                <div className="col-md-3 col-6 mb-md-0 mb-4 d-flex flex-column align-items-center align-items-md-start">
                  <div className="d-flex">
                    <h3 className="count text-white"><span className="odometer" data-count="25"></span></h3>
                    <h3 className="text-white">+</h3>
                  </div>

                  <p className="text-lg-bold text-white">Expert</p>
                  <p className="text-lg-bold text-white">Team Members</p>
                </div>

              </div>

            </div>


            {/* <!-- Clients Box --> */}
            <div className="col-lg-4 offset-lg-1 wow fadeIn">

              <div className="box-authors-partner background-body wow fadeInUp p-4">

                <div className="authors-partner-left">

                  <img src="assets/imgs/page/homepage5/author.png" alt="" />
                  <img src="assets/imgs/page/homepage5/author2.png" alt="" />
                  <img src="assets/imgs/page/homepage5/author3.png" alt="" />

                  <span className="item-author">
                    +
                  </span>

                </div>

                <div className="authors-partner-right">
                  <p className="text-sm neutral-1000">
                    More than <strong>1000+ customers</strong> trusted
                    <strong>Bharat Scrap Facilities</strong> for safe vehicle scrapping.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* <!-- brands --> */}
      <Brand />

      {/* <!-- faqs --> */}
      <FAQ />

    </main>
  )
}
