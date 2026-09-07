#!/data/data/com.termux/files/usr/bin/bash
pkg install nodejs -y
npm i -g openclaw 2>/dev/null || npx openclaw@latest --version
echo "Instalando skills de marketing..."
npx clawdhub@latest install marketing-skills || echo "clawdhub no encontrado, sigue manual"
npx clawdhub@latest install octolens || true
echo "Para conectar Telegram:"
echo "openclaw plugins enable telegram"
echo "openclaw channels add --channel telegram --token TU_TOKEN"
echo "openclaw gateway stop && openclaw gateway install"
