import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const baseline = [
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'X-Frame-Options',value:'DENY'},
      // A restrictive base policy without blocking framework inline scripts.
      {key:'Content-Security-Policy',value:"frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'"},
      {key:'Cross-Origin-Opener-Policy',value:'same-origin'},
      {key:'X-Permitted-Cross-Domain-Policies',value:'none'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
      {key:'Strict-Transport-Security',value:'max-age=31536000'},
      ...(process.env.VERCEL_ENV==='preview'?[{key:'X-Robots-Tag',value:'noindex, nofollow'}]:[]),
    ];
    return [
      {source:'/:path*',headers:baseline},
      {source:'/api/:path*',headers:[{key:'Cache-Control',value:'no-store, max-age=0'}]},
    ];
  },
};

export default nextConfig;
