"use client";

import { useState, useEffect } from "react";
import { FiBookOpen } from "react-icons/fi";

export default function SermonCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        fetchSermons();
    }, []);

    const fetchSermons = async () => {
        try {
            const res = await fetch("/api/sermons");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCount(data.length);
                }
            }
        } catch (error) {
            console.error("Error fetching sermons for counter:", error);
            setCount(0);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 relative overflow-hidden border border-selapp-brown/10">
            {/* Adorno visual de fondo */}
            <div className="absolute -right-6 -bottom-6 opacity-50">
                <FiBookOpen className="w-40 h-40 text-selapp-beige" />
            </div>

            <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="bg-selapp-beige/50 p-4 rounded-2xl backdrop-blur-sm border border-selapp-brown/5">
                    <FiBookOpen className="w-8 h-8 text-selapp-accent" />
                </div>
                <div>
                    <div className="flex items-end gap-3 mb-1">
                        <span className="text-4xl md:text-5xl font-bold text-selapp-brown">
                            {count !== null ? count : "..."}
                        </span>
                        <span className="text-lg text-selapp-brown-light mb-1 font-medium">
                            Sermones Guardados
                        </span>
                    </div>
                    <p className="text-selapp-brown-light/80 text-sm md:text-base max-w-sm">
                        Tu biblioteca de notas y enseñanzas de predicas.
                    </p>
                </div>
            </div>
        </div>
    );
}
