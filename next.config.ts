import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js", "sharp"],
  experimental: {},
};

export default nextConfig;


// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   serverExternalPackages: ["tesseract.js", "sharp"],
  
//   // Tambahkan ini untuk membypass error TypeScript saat build di VPS
//   typescript: {
//     ignoreBuildErrors: true,
//   },
  
//   // Tambahkan ini juga jika ada error ESLint yang menghambat build
//   eslint: {
//     ignoreDuringBuilds: true,
//   },

//   experimental: {
//     // Kosongkan atau isi jika ada fitur experimental yang dibutuhkan
//   },
// };

// export default nextConfig;