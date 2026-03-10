'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import StyleCard from './StyleCard';

export default function StyleGrid() {
  const styles = useAppStore((s) => s.generatedStyles);

  return (
    <section className="w-full">
      <h2 className="text-2xl font-semibold text-center tracking-[-0.02em] mb-8">Choose your look</h2>
      <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {styles.map((s, i) => <StyleCard key={s.id} style={s} index={i} />)}
      </motion.div>
    </section>
  );
}
