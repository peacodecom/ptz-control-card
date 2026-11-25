# Konfigurationsreferenz

[English](configuration.md) · [Deutsche Übersicht](README.de.md)

Die Entitätsnamen in Beispielen sind Platzhalter, keine gerätespezifischen
Voreinstellungen. Die Karte verwendet die Berechtigungen des angemeldeten
Home-Assistant-Benutzers. Alle Optionen werden im YAML der Karte gesetzt.

## Steuerung und Darstellung

| Option | Standard | Funktion |
| --- | --- | --- |
| `type` | erforderlich | Muss `custom:ptz-control-card` sein. |
| `title` | `PTZ Control` | Überschrift; eine leere Zeichenfolge blendet den Text aus. |
| `ptz_left` | erforderlich | `button.*`, `input_button.*` oder `script.*` für links. |
| `ptz_up` | erforderlich | Entität für hoch; gleiche unterstützte Domains wie `ptz_left`. |
| `ptz_right` | erforderlich | Entität für rechts; gleiche unterstützte Domains wie `ptz_left`. |
| `ptz_down` | erforderlich | Entität für runter; gleiche unterstützte Domains wie `ptz_left`. |
| `ptz_stop` | bedingt erforderlich | Stop-Entität aus denselben Domains. Nötig bei `hold_mode: true` oder sichtbarer Mitteltaste ohne `preset_entity`. |
| `hold_mode` | `true` | Bei Drücken starten, beim Loslassen stoppen. `false`: ein Aufruf je Klick, ohne automatischen Stop. |
| `show_center` | `true` | Mitteltaste anzeigen. Ohne Preset dient sie als Stop-Taste. |
| `preset_entity` | keine | `select.*` oder `input_select.*`, deren Optionen die Presets liefern. |
| `show_preset` | `true` | Preset-Auswahltasten anzeigen. Eine konfigurierte Preset-Mitteltaste funktioniert unabhängig davon. |
| `center_preset` | ausgewähltes Preset | Exakter Name der Option, die die Mitteltaste aufruft. |
| `preset_go_entity` | keine | Optionaler Button, Eingabe-Button oder Script, den nur die Mitteltaste nach erfolgreicher Preset-Auswahl auslöst. |
| `zoom_entity` | keine | `number.*` oder `input_number.*` mit Zoomwert, Grenzen und Schrittweite. |
| `show_zoom` | `true` | Zoomsteuerung anzeigen, falls `zoom_entity` konfiguriert ist. |
| `zoom_button_step` | `10` | Positive absolute Schrittweite der Zoomtasten; mindestens ein nativer Entitätsschritt. |
| `zoom_button_step_percent` | keine | Positive Prozentzahl des Bereichs `max - min`; hat Vorrang vor `zoom_button_step`. |
| `icon_up` | `mdi:pan-up` | Icon der Hoch-Taste. |
| `icon_right` | `mdi:pan-right` | Icon der Rechts-Taste. |
| `icon_down` | `mdi:pan-down` | Icon der Runter-Taste. |
| `icon_left` | `mdi:pan-left` | Icon der Links-Taste. |
| `icon_stop` | `mdi:stop` | Standard-Icon für die Stop-Mitteltaste. |
| `icon_center` | automatisch | Überschreibt das Mittel-Icon: sonst `mdi:crosshairs-gps` bei Presets, andernfalls `icon_stop`. |
| `text_center` | Preset-Name oder leer | Eigener Text in der Mitteltaste; `""` unterdrückt die Beschriftung. |

Fehlende oder nicht verfügbare Entitäten sind deaktiviert, ebenso unbekannte
Number-/Script-Zustände. Eine Select-/Input-Select-Entität mit Zustand `unknown`
bleibt bedienbar, wenn sie eine nicht leere `options`-Liste liefert: Preset-Entitäten
können Befehle annehmen, ohne ein aktuelles Kamera-Preset zurückzumelden.
Ohne Optionen bleibt eine unbekannte Preset-Entität deaktiviert. Ein festes
`center_preset` muss weiterhin exakt einer verfügbaren Option entsprechen;
andernfalls bleibt nur die Mitteltaste deaktiviert. Bei Buttons kann `unknown`
bedeuten, dass sie noch nie gedrückt wurden; solche Buttons bleiben bedienbar.

Buttons werden mit `button.press` bzw. `input_button.press` ausgelöst, Scripts
mit `script.turn_on`. Für Presets gelten `select.select_option` bzw.
`input_select.select_option`, für Zoom `number.set_value` bzw.
`input_number.set_value`. `script.turn_on` wartet nicht auf das Ende eines Scripts.
Bewegungs- und Stop-Scripts müssen unabhängig voneinander ausführbar sein.

Zoomwerte werden auf die Entitätsgrenzen begrenzt und auf die native Schrittweite
gerundet. Der Schieberegler sendet erst beim Bestätigen der Änderung, nicht bei
jeder Zwischenposition. Die Zoomtasten unterstützen normale Klicks und
Tastaturaktivierung.

Im Haltemodus eine Richtungstaste fokussieren und **Leertaste** oder **Enter**
gedrückt halten; Loslassen löst einen Stopversuch aus. Abbruch der Berührung,
Fokusverlust und ausgeblendete Tabs versuchen ebenfalls zu stoppen. Nach 120 ms
folgt ein zweiter Stop, sofern keine neue Richtung gedrückt ist. Klicks auf die
Mitteltaste innerhalb von 350 ms nach dem Loslassen einer Richtung werden gegen
unbeabsichtigte Touch-Folgeklicks ignoriert. Das garantiert keine Zustellung von
Stopbefehlen; die Sicherheitsgrenzen in der Übersicht gelten weiterhin.

## Farben

Die Werte sind CSS-Farben bzw. CSS-Hintergründe. `var(...)`, `rgba(...)` und bei
Hintergründen auch Farbverläufe sind möglich. Die Karte setzt CSS-Variablen und
fügt die Werte nicht als HTML ein. Standard ist das ursprüngliche grau-blaue Design.

| Option | Standard | Funktion |
| --- | --- | --- |
| `color_ring_outer_bg` | `transparent` | Hintergrund des äußeren kreisförmigen Bedienfelds. |
| `color_ring_outer_border` | `transparent` | Rahmen des äußeren Kreises. |
| `color_ring_inner_bg` | `rgba(255, 255, 255, 0.6)` | Hintergrund des inneren Kreises hinter der Mitteltaste. |
| `color_ring_inner_border` | `rgba(120, 130, 145, 0.35)` | Rahmen des inneren Kreises. |
| `color_ring_divider` | `rgba(120, 130, 145, 0.26)` | Diagonale Trennlinien im Ring. |
| `color_button_bg` | Hellgrauer Verlauf `#f7f8fa` → `#e9edf2` | Grundhintergrund der Richtungstasten ohne Einzelüberschreibung. |
| `color_button_hover_bg` | Grauer Verlauf `#eef2f6` → `#e2e7ed` | Richtungstasten-Hintergrund beim Darüberfahren. |
| `color_button_active_bg` | `#dce2e9` | Hintergrund einer gedrückten Richtungstaste. |
| `color_button_border` | `rgba(120, 130, 145, 0.35)` | Grundrahmen der Richtungstasten. |
| `color_button_icon` | `#6c737d` | Icons aller Richtungstasten. |
| `color_button_up_bg` | Blauer Verlauf `#f2f7ff` → `#e3edff` | Ruhezustands-Hintergrund der Hoch-Taste. |
| `color_button_right_bg` | Erbt `color_button_bg` | Ruhezustands-Hintergrund der Rechts-Taste. |
| `color_button_down_bg` | Erbt `color_button_bg` | Ruhezustands-Hintergrund der Runter-Taste. |
| `color_button_left_bg` | Erbt `color_button_bg` | Ruhezustands-Hintergrund der Links-Taste. |
| `color_button_up_border` | Erbt `color_button_border` | Rahmen der Hoch-Taste. |
| `color_button_right_border` | Erbt `color_button_border` | Rahmen der Rechts-Taste. |
| `color_button_down_border` | Erbt `color_button_border` | Rahmen der Runter-Taste. |
| `color_button_left_border` | Erbt `color_button_border` | Rahmen der Links-Taste. |
| `color_center_bg` | `#8a8d92` | Mitteltasten-Hintergrund im Stopmodus. |
| `color_center_border` | `rgba(63, 127, 170, 0.7)` | Rahmen der Mitteltaste in beiden Modi. |
| `color_center_preset_bg` | `#3f7faa` | Mitteltasten-Hintergrund im Preset-Modus. |
| `color_center_icon` | `#fff` | Icon der Mitteltaste. |
| `color_center_label` | `#fff` | Beschriftung unter dem Icon der Mitteltaste. |
| `color_preset_button_bg` | `rgba(120, 130, 145, 0.12)` | Hintergrund nicht ausgewählter Preset-Tasten. |
| `color_preset_button_border` | `rgba(120, 130, 145, 0.28)` | Rahmen nicht ausgewählter Preset-Tasten. |
| `color_preset_button_text` | `var(--primary-text-color)` | Text nicht ausgewählter Preset-Tasten. |
| `color_preset_button_active_bg` | `rgba(79, 143, 183, 0.2)` | Hintergrund des ausgewählten Presets. |
| `color_preset_button_active_border` | `rgba(79, 143, 183, 0.55)` | Rahmen des ausgewählten Presets. |
| `color_preset_button_active_text` | `var(--primary-text-color)` | Text des ausgewählten Presets. |
| `color_zoom_panel_bg` | `transparent` | Hintergrund des Zoombereichs. |
| `color_zoom_panel_border` | `transparent` | Rahmen des Zoombereichs. |
| `color_zoom_button_bg` | Hellgrauer Verlauf `#f7f8fa` → `#e9edf2` | Ruhezustands-Hintergrund der Zoomtasten. |
| `color_zoom_button_hover_bg` | Grauer Verlauf `#eef2f6` → `#e2e7ed` | Zoomtasten-Hintergrund beim Darüberfahren. |
| `color_zoom_button_active_bg` | `#dce2e9` | Hintergrund einer gedrückten Zoomtaste. |
| `color_zoom_button_border` | `rgba(120, 130, 145, 0.35)` | Rahmen der Zoomtasten. |
| `color_zoom_button_icon` | `#3f7faa` | Icons der Zoomtasten. |
| `color_zoom_slider_accent` | `#3f7faa` | Akzentfarbe des Zoomreglers. |

Die Standardverläufe laufen von oben nach unten (`linear-gradient(180deg, …)`).
Individuelle Richtungshintergründe gelten im Ruhezustand; beim Darüberfahren und
Drücken haben die gemeinsamen Hover-/Aktiv-Hintergründe Vorrang.

Beispiel für themeabhängige Farben:

```yaml
color_ring_inner_bg: var(--card-background-color)
color_button_icon: var(--primary-text-color)
color_center_preset_bg: var(--primary-color)
color_zoom_slider_accent: var(--primary-color)
```

## Diagnose

Fehlgeschlagene Home-Assistant-Aufrufe zeigen eine allgemeine Fehlermeldung in
der Karte. Zusätzlich sendet sie das DOM-Ereignis `ptz-control-error` mit den
Feldern `message`, `domain` und `service`; es überwindet die Shadow-DOM-Grenze
und steigt im DOM auf. Rohe Backend-Fehler werden nicht angezeigt. In den
Entwicklerwerkzeugen prüfen, ob die Entität existiert, verfügbar ist und sich
mit den eigenen Berechtigungen bedienen lässt.
