export function getAssetUrl(assetPath: string): string {
  return assetPath.replace(/^\/+/, '');
}

export function getCardImageUrl(cardId: string, _cardName?: string): string {
  return `assets/cards/${cardId}.jpg`;
}
