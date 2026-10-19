# Shot prompts export (JSON)

The Shots step can export every shot as one JSON file, so you can feed your own image and video tools or a script of your own.

```json
{
  "app": "Script Room",
  "version": 1,
  "title": "The Last Tram",
  "ratio": "16:9",
  "target": "generic",
  "look": "warm sodium night, handheld and close",
  "shots": [
    {
      "id": "k3j9xa",
      "number": "2A",
      "scene": {"number": 2, "heading": "INT. TRAM - NIGHT", "beat": "..."},
      "durationSec": 5,
      "fps": 24,
      "camera": {"size": "Medium close-up", "framing": "Over-the-shoulder", "angle": "Eye level", "height": "Shoulder level",
                 "movement": "Push in", "rig": "Slider", "lens": "47° (50mm)", "focus": "Shallow", "composition": "Rule of thirds", "light": "auto"},
      "transitionToNext": "Cut",
      "directingMode": "Narrative",
      "description": "Samir reaches for the bell cord.",
      "dialogue": "Forty years I have rung it at Harbour Street.",
      "audio": "the tram's hum, rain on the glass",
      "characters": [{"name": "Samir", "look": "..."}],
      "prompts": {"image": "...", "video": "...", "negative": "..."}
    }
  ]
}
```

- Prompts are written for common generators and include the aspect ratio and a negative prompt.
- For platform-specific wording (Seedance, Kling, Runway, Veo, Sora, Luma, Hailuo, Pika, Midjourney, Flux, GPT Image, Nano Banana, Stable Diffusion), use the platform picker on each shot or scene and copy from there.
- If you set a webhook in the Shots step, Script Room POSTs this JSON to your URL. Only use an address you control.
