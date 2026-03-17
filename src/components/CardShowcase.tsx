import { useState } from 'react';
import { CARDS } from '@/data/showcaseCards';
import { CardGrid } from '@/components/showcase/CardGrid';
import { CardDetail } from '@/components/showcase/CardDetail';

export function CardShowcase({ onBack }: { onBack: () => void }) {
    const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);

    const handleSelectCard = (index: number) => {
        setCurrentIndex(index);
        setViewMode('detail');
    };

    const handleNavigate = (dir: 'prev' | 'next' | 'index', index?: number) => {
        if (dir === 'index' && index !== undefined) {
            setCurrentIndex(index);
            return;
        }

        setSlideDir(dir === 'next' ? 'left' : 'right');
        setTimeout(() => {
            setCurrentIndex(prev =>
                dir === 'next'
                    ? (prev + 1) % CARDS.length
                    : (prev - 1 + CARDS.length) % CARDS.length
            );
            setSlideDir(null);
        }, 200);
    };

    if (viewMode === 'grid') {
        return <CardGrid onBack={onBack} onSelectCard={handleSelectCard} />;
    }

    return (
        <CardDetail
            currentIndex={currentIndex}
            onBack={() => setViewMode('grid')}
            onNavigate={handleNavigate}
            slideDir={slideDir}
        />
    );
}
