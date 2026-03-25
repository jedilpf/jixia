import { useState } from 'react';
import { ACTIVE_COLLECTION_CARDS } from '@/data/cardsSource';
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
                    ? (prev + 1) % ACTIVE_COLLECTION_CARDS.length
                    : (prev - 1 + ACTIVE_COLLECTION_CARDS.length) % ACTIVE_COLLECTION_CARDS.length
            );
            setSlideDir(null);
        }, 200);
    };

    if (ACTIVE_COLLECTION_CARDS.length === 0) {
        return (
            <div className="w-full h-full min-h-screen flex flex-col items-center justify-center bg-[#0a0f18] text-[#d4a520] gap-4">
                <div className="text-xl font-serif tracking-widest">当前暂无已开放卡牌</div>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-black/40 border border-[#d4a520]/40 rounded-full hover:bg-black/60 transition-all"
                >
                    返回主界面
                </button>
            </div>
        );
    }

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
