# For Sania, With Love ❤️

A highly interactive, charming, and romantic website made especially for **Sania**. It features a playful, click-evading "No" button, a sweet timeline of memories, and a gorgeous celebration screen with custom confetti and music.

## 🌟 Features Included

1. **The Proposal (Main Page)**:
   - A playful question: *"Sania, Do you love me?"*
   - A tricky **No** button that moves smoothly out of reach every time you try to hover or click it. It shrinks slightly as you chase it, accompanied by cheeky floating bubbles (like *"Too slow! 💨"* or *"Try again! 😜"*).
   - A fallback *"Give up? 🥺"* link that appears if you struggle for more than 4 attempts, leading to the Convince page. Alternatively, it automatically redirects you after 9 attempts.
2. **The Convince Page (Surprise)**:
   - A heartfelt section reminding her of why you love her.
   - An interactive **Reasons Carousel** detailing specific traits like her smile, her kindness, and how she makes you feel.
   - A beautiful vertical **Relationship Timeline** highlighting key bonding steps and your shared song: *Saudebazi*.
   - A final large YES button that pulses to guide her to victory.
3. **The YES Page (Celebration)**:
   - A rain of custom colorful heart-shaped and circular confetti.
   - A fully functional, interactive **CSS Love Letter Envelope** that opens on click to reveal a customized love letter.
   - A dynamic **Love Counter** calculating the exact number of days, hours, minutes, and seconds you've spent loving her.
4. **Music Integration**:
   - Plays your shared song: **Saudebazi** (via YouTube API embed with automatic fallback to synthesized Web Audio piano chimes if offline).
   - Includes a custom glassmorphic audio player in the top corner with a rotating vinyl record animation that spins while music is playing.

---

## 🚀 How to Run Locally

You don't need any complex installation or web servers to run this site! It runs perfectly in any modern browser.

### Option 1: Direct Double Click (easiest)
1. Open the folder: `c:\Users\nitro\OneDrive\Pictures\Nitro\convance 1\`
2. Double-click the [index.html](file:///c:/Users/nitro/OneDrive/Pictures/Nitro/convance%201/index.html) file.
3. It will open in your default browser (Chrome, Edge, Firefox, or Safari).

### Option 2: Live Server (recommended for developer preview)
If you have Python installed, you can run a local web server to preview it exactly as it would behave on the web:
1. Open terminal and navigate to the project directory.
2. Run:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and go to `http://localhost:8000`.

---

## 🛠️ Customization Details

You can easily adjust the settings inside [script.js](file:///c:/Users/nitro/OneDrive/Pictures/Nitro/convance%201/script.js) (lines 10-25):
- **Love Start Date**: Adjust the exact date when you started loving her inside `loveStartDate`. This updates the days/hours/minutes timer on the victory page.
- **YouTube Music Track**: You can change the song by replacing the `youtubeVideoId` with another YouTube video ID.
- **Cheeky Comments**: Add your own inside jokes to the evading button bubbles array.
- **Love Letter Content**: You can customize the exact text of the love letter in [index.html](file:///c:/Users/nitro/OneDrive/Pictures/Nitro/convance%201/index.html) (lines 173-181).

*Made with love for Sania.* ❤️
