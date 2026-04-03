# Ultimate Climate Card

A custom Lovelace card for Home Assistant that provides an elegant glass-style climate control with three flexible display modes.

## Features

- **Three display modes** — choose the layout that fits your setup:
  - **Thermostat & Humidity** — full climate control with current temperature, humidity reading, and target temperature adjustment
  - **Thermostat** — compact climate control with current and target temperature side by side
  - **Temperature sensor** — minimal display showing only the current temperature from any sensor
- **Automatic status detection** — displays Heating, Cooling, Idle, or Off based on the current HVAC action
- **Temperature control** — adjust target temperature with plus/minus buttons (configurable min, max, and step)
- **Glass morphism style** — frosted glass design consistent with the Ultimate Light Card
- **GUI Editor** — visual configuration with smart field visibility based on the selected mode

## Installation

### HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Frontend** → click the **⋮** menu → **Custom repositories**
3. Add `https://github.com/Sven2410/ultimate-climate-card` with category **Dashboard**
4. Click **Install**
5. Refresh your browser (hard refresh: Ctrl+Shift+R)

### Manual

1. Download `ultimate-climate-card.js` from the [latest release](https://github.com/Sven2410/ultimate-climate-card/releases/latest)
2. Copy it to `/config/www/ultimate-climate-card.js`
3. Add the resource in **Settings → Dashboards → ⋮ → Resources**:
   - URL: `/local/ultimate-climate-card.js`
   - Type: JavaScript Module

## Configuration

### Visual Editor

1. Add a card to your dashboard
2. Search for **Ultimate Climate Card**
3. Select your mode and fill in the required entities

### YAML

**Thermostat & Humidity:**
```yaml
type: custom:ultimate-climate-card
mode: full
name: Living room
climate_entity: climate.living_room
humidity_entity: sensor.living_room_humidity
```

**Thermostat:**
```yaml
type: custom:ultimate-climate-card
mode: climate
name: Bedroom
climate_entity: climate.bedroom
```

**Temperature sensor:**
```yaml
type: custom:ultimate-climate-card
mode: temperature
name: Garage
temperature_entity: sensor.garage_temperature
```

| Option               | Type   | Required         | Default | Description                                  |
|----------------------|--------|------------------|---------|----------------------------------------------|
| `mode`               | string | **Yes**          | `full`  | `full`, `climate`, or `temperature`          |
| `name`               | string | No               |         | Display name (falls back to friendly name)   |
| `climate_entity`     | string | mode full/climate|         | A `climate.*` entity ID                      |
| `humidity_entity`    | string | mode full        |         | A `sensor.*` entity for humidity             |
| `temperature_entity` | string | mode temperature |         | A `sensor.*` entity for temperature          |
| `min_temp`           | number | No               | `5`     | Minimum settable temperature                 |
| `max_temp`           | number | No               | `30`    | Maximum settable temperature                 |
| `temp_step`          | number | No               | `0.5`   | Temperature step for +/- buttons             |

## Screenshots

_Coming soon_

## License

MIT
