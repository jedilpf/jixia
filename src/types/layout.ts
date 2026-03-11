export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  color?: string;
}

export interface LayoutSpec {
  canvasWidth: number;
  canvasHeight: number;
  layouts: LayoutItem[];
}
