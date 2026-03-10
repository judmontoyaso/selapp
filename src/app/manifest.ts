import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Selapp",
        short_name: "Selapp",
        description: "Devocionales diarios y notas de predicación con un diseño elegante, cálido y moderno.",
        start_url: "/",
        display: "standalone",
        background_color: "#FDFBF7", // selapp-beige
        theme_color: "#4A3933", // selapp-brown
        icons: [
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
