'use client';

import { motion } from 'framer-motion';

/*
 * 40 hand-verified beauty/makeup portraits from Unsplash
 * Every image visually checked — face closeups with visible makeup only.
 * Styles: smoky eye · party glam · editorial · red lip · natural · Korean · application
 */
const columns: string[][] = [
  // Col 1 — Smoky & dramatic
  [
    'photo-1636908681421-bff3b85f7303', // smoky eye + red lip, curly hair
    'photo-1594646996739-9ea802039fe3', // dark smoky eye, choker
    'photo-1621444243620-8d254adbfd40', // dramatic moody portrait
    'photo-1585596298391-1fed225198da', // red eye & lip, dark hood
    'photo-1574868844096-ae21560c82e1', // purple glitter shimmer
  ],
  // Col 2 — Party & glitter
  [
    'photo-1556941975-8963a1f2a5a8',   // glitter lashes, pink glow
    'photo-1498746607408-1e56960e3bdd', // glitter face, blue bg
    'photo-1573308545580-6f3725c998f1', // fantasy metallic leaves
    'photo-1674867374002-fe1b5cb38589', // pearl embellishments, pink eye
    'photo-1680833912326-79c8696dfd13', // purple flowers editorial
  ],
  // Col 3 — Editorial bold
  [
    'photo-1594647210801-5124307f3d51', // blue + red bold eye closeup
    'photo-1677808566807-1097fc06b472', // colorful editorial face
    'photo-1634052970539-224813476367', // dramatic artistic eye
    'photo-1607799080553-30df65935dc9', // red veil, glitter lip
    'photo-1692318535011-09ea0e3a7aac', // green eyeliner closeup
  ],
  // Col 4 — Red lip classic
  [
    'photo-1651047481316-1f7565cde651', // elegant red lip portrait
    'photo-1639758420121-75461ead227f', // winged eyeliner + red lip
    'photo-1678582964939-10278ff7ea25', // half face red lip detail
    'photo-1617553902331-b3e3c1aa07da', // bold smoky + berry lip
    'photo-1659422980942-e17d377656d9', // ultra closeup glam
  ],
  // Col 5 — Natural / 素颜
  [
    'photo-1562861021-c1ced7930457',   // dewy natural, pink bg
    'photo-1590057968061-1955f2d0ad80', // prism light, soft beauty
    'photo-1656418156962-0ca695ac38eb', // extreme closeup, nude lip
    'photo-1663691219171-93494f63b5c9', // clean glow, braided hair
    'photo-1556942040-df93bd3bdd19',   // natural dewy, red bg
  ],
  // Col 6 — Korean / Asian beauty
  [
    'photo-1624091844772-554661d10173', // Asian natural beauty
    'photo-1609360706137-c59ba75b4d26', // red eyeliner profile
    'photo-1671797023514-9032ec13aa1a', // dark lip closeup
    'photo-1675709146139-c57b68bc44f6', // light & shadow beauty
    'photo-1603133682095-8e6075675ec4', // editorial beauty face
  ],
  // Col 7 — Makeup application
  [
    'photo-1560869683-f5d8bf564346',   // purple eyeshadow application
    'photo-1709477542153-5bedab2b5657', // lash application closeup
    'photo-1631120581590-a699a481fc98', // mascara + winged liner
    'photo-1631120581498-4e2ad6c0ce3a', // mascara, smiling face
    'photo-1623676554065-cf0cc904b55e', // lip gloss application
  ],
  // Col 8 — Purple & pink glam
  [
    'photo-1614794201931-f3e76c26e725', // purple eyeshadow + lip
    'photo-1556942000-13f122b8bb4d',   // glitter lash detail
    'photo-1594461287652-10b41090cf91', // wet look, dewy beauty
    'photo-1677429587236-d8d8699b80d4', // green eyeshadow studio
    'photo-1573977465324-055ebffcb159', // smoky eye selfie
  ],
];

function toUrl(id: string) {
  return `https://images.unsplash.com/${id}?w=300&q=75&fit=crop&auto=format`;
}

/* Alternate direction & vary speed for organic feel */
const cfgs = [
  { dur: 35, dir: -1, off:    0 },
  { dur: 40, dir:  1, off: -120 },
  { dur: 32, dir: -1, off:  -60 },
  { dur: 38, dir:  1, off: -180 },
  { dur: 34, dir: -1, off:  -40 },
  { dur: 42, dir:  1, off: -140 },
  { dur: 30, dir: -1, off:  -80 },
  { dur: 36, dir:  1, off: -100 },
];

export default function ImageWaterfall() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="flex gap-2.5 h-full justify-center px-2" style={{ opacity: 0.4 }}>
        {columns.map((col, ci) => {
          const c = cfgs[ci];
          const doubled = [...col, ...col]; // seamless loop
          const singleH = col.length * 260;  // rough column px height

          return (
            <div key={ci} className="flex-1 min-w-0 overflow-hidden relative">
              <motion.div
                className="flex flex-col gap-2.5"
                initial={{ y: c.off }}
                animate={{
                  y: c.dir === -1
                    ? [c.off, c.off - singleH]
                    : [c.off - singleH, c.off],
                }}
                transition={{ duration: c.dur, repeat: Infinity, ease: 'linear' }}
              >
                {doubled.map((id, ii) => (
                  <div key={`${ci}-${ii}`} className="rounded-xl overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={toUrl(id)}
                      alt=""
                      loading="lazy"
                      className="w-full object-cover aspect-[3/4]"
                      draggable={false}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Edge fades — all four sides */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#faf9f6] via-[#faf9f6]/70 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/70 to-transparent z-10" />
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#faf9f6] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#faf9f6] to-transparent z-10" />
    </div>
  );
}
