import os
from PIL import Image

# Configuration
SOURCE_TIF = 'public/lroc_color_16bit_srgb.tif'
OUTPUT_DIR = 'public/tiles'
TILE_SIZE = 512

def slice_tif():
    print(f"Opening massive TIF: {SOURCE_TIF}...")
    Image.MAX_IMAGE_PIXELS = None
    
    try:
        img = Image.open(SOURCE_TIF)
        width, height = img.size
        print(f"Dimensions: {width} x {height}")
        
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)
            
        cols = (width + TILE_SIZE - 1) // TILE_SIZE
        rows = (height + TILE_SIZE - 1) // TILE_SIZE
        total_tiles = cols * rows
        
        print(f"Slicing into {total_tiles} tiles ({cols}x{rows})...")
        
        count = 0
        for r in range(rows):
            for c in range(cols):
                left = c * TILE_SIZE
                top = r * TILE_SIZE
                right = min(left + TILE_SIZE, width)
                bottom = min(top + TILE_SIZE, height)
                
                # Crop and save as optimized WebP
                tile = img.crop((left, top, right, bottom))
                
                # Ensure it's RGB for web compatibility
                if tile.mode != 'RGB':
                    tile = tile.convert('RGB')
                
                tile_name = f"tile_{r}_{c}.webp"
                tile.save(os.path.join(OUTPUT_DIR, tile_name), 'WEBP', quality=85)
                
                count += 1
                if count % 100 == 0:
                    print(f"Processed {count}/{total_tiles} tiles...")
                
        print("Tiling complete!")
        
    except Exception as e:
        print(f"Error during tiling: {e}")

if __name__ == "__main__":
    slice_tif()
