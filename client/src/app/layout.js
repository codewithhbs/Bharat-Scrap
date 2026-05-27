import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bharat Scrap Facilities | Authorized Vehicle Scrapping & Recycling Center",
  description: "Bharat Scrap Facilities provides authorized vehicle scrapping, eco-friendly recycling, and instant quotes for old cars across Delhi NCR and nearby regions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/assets/favicon/site.webmanifest" />
        <link href="/assets/css/main.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body suppressHydrationWarning={true}>
        <Header />
        {children}
        <Footer />

        {/* Vendor Scripts - must load in order, so use beforeInteractive for jQuery */}
        <Script src="/assets/js/vendor/jquery-3.7.1.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/jquery-migrate-3.3.0.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/bootstrap.bundle.min.js" strategy="beforeInteractive" />

        {/* Plugins */}
        <Script src="/assets/js/plugins/magnific-popup.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/perfect-scrollbar.min.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/swiper-bundle.min.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/slick.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/jquery.carouselTicker.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/masonry.min.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/scrollup.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/wow.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/waypoints.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/jquery.appear.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/jquery.odometer.min.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/bootstrap-datepicker.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/dark.js" strategy="lazyOnload" />
        <Script src="/assets/js/vendor/jquery.countdown.min.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/noUISlider.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/slider.js" strategy="lazyOnload" />
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyD022IF_7EVi9DEqKBizpz6vXM_nuFeE1g&libraries=places"></script>

        {/* Main script loads last, after all plugins */}
        <Script src="/assets/js/main.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}