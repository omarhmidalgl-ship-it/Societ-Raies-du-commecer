import { motion } from "framer-motion";

export function SiteBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none mesh-gradient">
            {/* Subtle Noise Overlay */}
            <div className="absolute inset-0 noise-overlay" />

            {/* Animated Blobs for Dynamic Feel */}
            <motion.div
                className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/10 blur-[120px] animate-blob"
            />
            <motion.div
                className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-indigo-400/10 blur-[120px] animate-blob-reverse"
            />
            <motion.div
                className="absolute -bottom-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-blue-300/10 blur-[120px] animate-blob"
            />

            {/* Very faint refined grid for structure - only shows on larger screens */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>
    );
}
