import React, {useState, useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
    "/screens/1.png",
    "/screens/2.png",
    "/screens/3.png",
    "/screens/4.png",
    "/screens/5.png",
];

export default function App() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [current]);

    useEffect(() => {
        images.forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    const handleDotClick = (i) => {
        setCurrent(i);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary text-cwhite px-4">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="w-full hidden md:block">
                    <div className="relative w-full h-[700px] rounded-2xl shadow-lg overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={current}
                                src={images[current]}
                                alt={`screen-${current}`}
                                className="object-contain w-full h-full absolute top-0 left-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            />
                        </AnimatePresence>
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all border-2 border-cwhite ${
                                    current === i ? "bg-cwhite" : "bg-primary"
                                }`}
                                onClick={() => handleDotClick(i)}
                            />
                        ))}
                    </div>
                </div>

                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start flex-row md:items-start">
                        <img src="/logo.png" alt="Easy Track Logo" className="h-[62px]"/>
                        <h1 className="text-6xl font-bold text-cwhite mb-1 -ml-2">asy Track</h1>
                    </div>
                    <div className="text-3xl text-cgray mb-4 ml-2 mt-2 italic">
                        <p>Simplest weight tracker there is.</p>
                        <p>Fully secure and private.</p>
                    </div>
                    <a className="inline-flex items-center justify-center py-3 px-6 ml-2 mt-2 rounded-xl gap-1 text-cwhite hover:bg-secondary transition duration-300 bg-tertiary"
                       href="https://github.com/kazikd11/Easy_Track/releases/download/apk-realese/easy_track.apk"
                       download
                    >
                        <p className="text-2xl">Download for</p>
                        <img src="/Android.png" alt="Android" className="h-5 mt-0.5 ml-1"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}