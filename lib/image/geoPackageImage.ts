import { Image } from '../../@types/canvaskit';

/**
 * Image class to wrap HTML Images and CanvasKit Images and ImageBitmaps
 */
export class GeoPackageImage {
  private readonly image: any;
  private readonly width: number;
  private readonly height: number;
  private readonly format: string;

  /**
   * Constructor
   * @param image - Image | HTMLImageElement | ImageBitmap
   * @param width
   * @param height
   * @param format
   */
  constructor(image: any, width: number, height: number, format = 'image/png') {
    this.image = image;
    this.width = width;
    this.height = height;
    this.format = format;
  }

  /**
   * Returns the underlying image object
   */
  public getImage(): any {
    return this.image;
  }

  /**
   * Returns the width
   */
  public getWidth(): number {
    return this.width;
  }

  /**
   * Returns the height
   */
  public getHeight(): number {
    return this.height;
  }

  /**
   * Returns the format
   */
  public getFormat(): string {
    return this.format;
  }

  isTransparent() {
    return false;
  }
}