# FlyTripVisa × WeCom Smart Robot

Official WeCom Smart Robot API Mode → Long Connection integration.

## Architecture
- Browser Chat UI → Node API
- WeCom Adapter maintains persistent WebSocket to wss://openws.work.weixin.qq.com
- Shared AI Engine for web + WeCom
- Secrets never exposed to frontend

## Setup
cp .env.example .env
npm install
npm run dev

## WeCom
1. Create Smart Robot → API Mode → Long Connection
2. Copy Bot ID + Secret
3. Open /admin.html
4. Save + Connect

## Notes
- Real connection requires valid WeCom credentials.
- AI provider requires AI_GATEWAY_URL or Workers AI config.
