# 🏁 SpeedRivals — Multiplayer Racing Game

Ek 2D browser racing game. Har dost apne apne laptop/phone pe link kholta hai,
room code se join karta hai, aur host "Start Race" dabane par sab ek saath race karte hain.
3 laps — jo pehle finish kare, winner!

## ✅ LIVE — abhi khelo

Game deploy ho chuka hai GitHub Pages pe:
**https://aqibalikhan770-stack.github.io/speedrivals-racing/**

- Ek dost "New Room" banata hai (5-ka code milega)
- Baaki sab us link/code se join karte hain
- Host "Start Race" dabata hai

**Direct room ke saath link bhejne ke liye:**
`https://aqibalikhan770-stack.github.io/speedrivals-racing/#room=CODE`

## Ye kaise kaam karta hai (server-less)

Game ke liye koi server/account/card nahi chahiye:
- **GitHub Pages** — game files host karta hai (free, permanent)
- **PeerJS** — free public PeerServer (0.peerjs.com) signaling ke liye
- **WebRTC DataChannel** — cars ki positions real-time me players ke beech jaati hain
- Host ka browser hi relay ban jata hai (host online rahe, tabhi game chalegi)

## Locally test karein

Sirf `public/index.html` browser me kholo — koi install nahi chahiye.

**Controls:** W/↑ = gas, S/↓ = brake, A/D ya ←/→ = steer
Mobile pe bhi on-screen buttons aate hain.

## Files
- `public/index.html` — poori game (canvas, physics, graphics, networking)
- `server.js` + `render.yaml` + `package.json` — optional Node/WebSocket version (Render pe deploy ke liye, ager zyada players chahiye to)
- `README.md` — ye file