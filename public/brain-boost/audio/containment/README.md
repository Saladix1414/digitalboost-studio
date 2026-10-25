# Containment Breach

Composición original para DigitalBoost Studio, sin samples externos. Producción determinista mediante `tools/neon-arena/compose_containment.py`. El manifiesto registra tempo, tonalidad, duración, canales y mediciones de los stems.

Cuatro capas de 15 segundos / ocho compases a 128 BPM: atmosphere, bass, percussion, tension. Ogg y MP3 son alternativas; el juego descarga una de ellas al iniciar. `preview.mp3` es una mezcla de escucha de 60 segundos, no un recurso precargado.

Para reproducir la producción se necesitan Python, numpy y ffmpeg:

```bash
python tools/neon-arena/compose_containment.py --output public/brain-boost/audio/containment --masters /tmp/containment-masters
```

No se necesita esta herramienta para instalar, compilar o jugar. Los archivos web ya están incluidos. Los WAV fuente se generan en el directorio elegido para masters; no se incorporan al bundle. El script contiene la composición y el procesamiento originales.
