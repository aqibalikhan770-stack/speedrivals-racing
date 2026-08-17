# 🏁 SpeedRivals — Multiplayer Racing Game

Ek 2D browser racing game. Har dost apne apne laptop/phone pe link kholta hai,
room code se join karta hai, aur host "Start Race" dabane par sab ek saath race karte hain.
3 laps — jo pehle finish kare, winner!

## Locally test karein (apne computer pe)

```
cd racing-game
npm install
npm start
```

Browser me kholo: http://localhost:3000

- Ek tab me "New Room" banao (room code milega)
- Doosre tab/device me wo room code se "Join" karo
- Host "Start Race" dabaye

**Controls:** W/↑ = gas, S/↓ = brake, A/D ya ←/→ = steer
Mobile pe bhi on-screen buttons aate hain.

## Online free hosting (Render) — friends ko link bhejne ke liye

1. Apne code ko GitHub pe push karo (sirf `racing-game` folder ke contents root me rakho, ya poori repo).
2. [render.com](https://render.com) pe free account banao.
3. **New → Web Service** chuno, apna GitHub repo select karo.
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Deploy hone ke baad ek link milega (jaise `https://speedrivals.onrender.com`).
6. Wo link friends ko bhejo. Host room banata hai, baaki us link se join karte hain.

### Render me room code wali auto-join
Link ke aage `#room=CODE` lagake bhejo:
`https://speedrivals.onrender.com/#room=ABCD`
Kholne par woh room code auto-fill ho jayega.

## Files
- `server.js` — Node + Express + WebSocket server (rooms, relay)
- `public/index.html` — game (canvas, physics, HUD, touch controls)
- `render.yaml` — Render free deploy config