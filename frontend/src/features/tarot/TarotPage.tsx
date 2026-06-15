import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageContainer } from '@/components/layout/PageContainer';
import { PremiumButton } from '@/components/PremiumButton';
import { tarotCards } from '@/data/tarotCards';
import { Sparkles, RefreshCw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Spread = 'one' | 'three' | 'celtic';

type DrawnCard = {
  id: number;
  reversed: boolean;
  position: number;
};

const spreadConfig = {
  one: { label: 'Single Card', positions: 1, desc: 'Quick insight for the day' },
  three: { label: 'Three-Card Spread', positions: 3, desc: 'Past · Present · Future' },
  celtic: { label: 'Celtic Cross', positions: 10, desc: 'Deep comprehensive reading' },
};

const celticPositions = [
  'Present', 'Challenge', 'Past', 'Future', 'Above',
  'Below', 'Advice', 'External Influences', 'Hopes & Fears', 'Outcome',
];

function TarotCard({ card, onClick, flipped, index }: { card: DrawnCard; onClick?: () => void; flipped: boolean; index: number }) {
  const data = tarotCards[card.id]!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: 180 }}
      animate={flipped ? { opacity: 1, y: 0, rotateY: 0 } : { opacity: 1, y: 0, rotateY: 180 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onClick={onClick}
      className={cn(
        'relative w-24 h-36 sm:w-28 sm:h-40 cursor-pointer perspective-1000',
        !flipped && 'cursor-pointer',
      )}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full rounded-xl shadow-lg"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
      >
        {!flipped ? (
          <div className="absolute inset-0 rounded-xl glass-card flex items-center justify-center backface-hidden">
            <div className="text-center">
              <Star className="w-6 h-6 text-primary-light mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-primary-light">TAROT</span>
            </div>
          </div>
        ) : (
          <div className={cn(
            'absolute inset-0 rounded-xl p-3 flex flex-col items-center justify-center text-center',
            card.reversed ? 'bg-red-900/20 border border-red-500/30' : 'glass-card',
          )}>
            <span className="text-[10px] font-bold leading-tight text-foreground mb-1">{data.name}</span>
            <span className="text-[8px] text-muted-foreground">{card.reversed ? '⟳ Reversed' : ''}</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function TarotPage() {
  const [spread, setSpread] = useState<Spread>('three');
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const shuffle = () => {
    const count = spreadConfig[spread].positions;
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5).slice(0, count);
    setDrawn(shuffled.map((c, i) => ({ id: c.id, reversed: Math.random() > 0.7, position: i })));
    setFlipped(false);
    setSelectedCard(null);
    setTimeout(() => setFlipped(true), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <PageContainer maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="tag-accent tag mb-4 inline-block">Tarot</span>
            <h1 className="hero-text mb-4">Mystical Tarot Guidance</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Pull cards for profound insight into love, career, and spiritual growth.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            {(Object.entries(spreadConfig) as [Spread, typeof spreadConfig[Spread]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { setSpread(key); setDrawn([]); setSelectedCard(null); }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm transition-all duration-200 border',
                  spread === key
                    ? 'bg-primary/10 border-primary/30 text-primary-light'
                    : 'bg-transparent border-border text-muted-foreground hover:border-primary/20',
                )}
              >
                {cfg.label}
                <span className="block text-[10px] opacity-60">{cfg.desc}</span>
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-10"
          >
            <PremiumButton
              size="lg"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={shuffle}
            >
              {drawn.length > 0 ? 'Shuffle Again' : 'Draw Cards'}
            </PremiumButton>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-12 min-h-[200px]">
            {drawn.map((card, i) => (
              <TarotCard
                key={`${card.id}-${i}`}
                card={card}
                flipped={flipped}
                index={i}
                onClick={() => setSelectedCard(i)}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {(() => {
            const card = selectedCard !== null ? drawn[selectedCard] : undefined;
            const data = card ? tarotCards[card.id] : undefined;
            if (!card || !data) return null;
            return (
              <motion.div
                key={selectedCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-xl p-6 sm:p-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-16 rounded-lg glass flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{data.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Position: {spread === 'celtic' ? celticPositions[selectedCard!] : `Card ${selectedCard! + 1}`}
                      {card.reversed && ' · Reversed'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {card.reversed ? data.reversedMeaning : data.meaning}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {data.keywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary-light rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })()}
          </AnimatePresence>

          {drawn.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full glass flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Choose a spread and draw your cards</p>
            </motion.div>
          )}
        </PageContainer>
      </section>
      <Footer />
    </div>
  );
}
