import type { Card } from '@/types';

interface BookAreaProps {
    books: Card[];
    isEnemy?: boolean;
    scale: number;
    x: number;
    y: number;
    w: number;
    h: number;
    isDraggingOver?: boolean;
}

export function BookArea({
    books,
    isEnemy = false,
    scale,
    x,
    y,
    w,
    h,
    isDraggingOver = false,
}: BookAreaProps) {
    return (
        <div
            style={{
                position: 'absolute',
                left: `${x * scale}px`,
                top: `${y * scale}px`,
                width: `${w * scale}px`,
                height: `${h * scale}px`,
                border: `2px dashed ${isDraggingOver ? '#d4a520' : 'rgba(212, 165, 32, 0.3)'}`,
                borderRadius: '8px',
                background: isDraggingOver ? 'rgba(212, 165, 32, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                pointerEvents: isEnemy ? 'none' : 'auto',
            }}
        >
            <div style={{
                color: isDraggingOver ? '#d4a520' : 'rgba(212, 165, 32, 0.6)',
                fontSize: `${14 * scale}px`,
                fontWeight: 'bold',
                marginBottom: `${4 * scale}px`,
            }}>
                {isEnemy ? '敌方简牍' : '简牍区 (着书)'}
            </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: `${2 * scale}px`,
                justifyContent: 'center',
                padding: `${4 * scale}px`,
            }}>
                {books.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: `${12 * scale}px`,
                            height: `${40 * scale}px`,
                            background: '#8b4513',
                            borderRadius: `${1 * scale}px`,
                            border: '1px solid #5d2e0a',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    />
                ))}
                {books.length === 0 && (
                    <div style={{
                        fontSize: `${12 * scale}px`,
                        color: 'rgba(212, 165, 32, 0.3)',
                        fontStyle: 'italic',
                    }}>
                        空
                    </div>
                )}
            </div>

            {books.length > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: `${4 * scale}px`,
                    right: `${8 * scale}px`,
                    fontSize: `${12 * scale}px`,
                    color: 'rgba(212, 165, 32, 0.8)',
                }}>
                    {books.length}
                </div>
            )}
        </div>
    );
}
