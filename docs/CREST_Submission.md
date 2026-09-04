# Entolux — Autonomous Insect Monitoring & Identification System

**CREST Award Submission — Project Documentation**

| | |
|---|---|
| **Project title** | Entolux: An autonomous, non-lethal insect monitoring station with automated species identification |
| **Project type** | Engineering / Computer Science / Ecology (interdisciplinary) |
| **Student** | Sounak Roy |
| **Deployment site (prototype)** | Kolkata, West Bengal, India (22.57° N, 88.36° E) |
| **Development period** | 17 June 2026 – 26 June 2026 (active build), documented 4 September 2026 |
| **Repository** | `insect-detection` — three subsystems: `raspberry_pi/`, `backend/`, `frontend/` |
| **Prototype box ID** | `ENT-004821` |

---

## 1. Abstract

Entolux is an end-to-end system that automatically detects, photographs, identifies and analyses insects in the field without a human present and without harming the specimen. A solar-capable field unit built around a Raspberry Pi watches a small imaging chamber with four independent motion sensors. When all four sensors agree that something has entered, the unit photographs it, stamps the image with GPS coordinates and a timestamp, and stores it locally. Whenever an internet connection becomes available, the unit uploads the image and its metadata to cloud storage.

A cloud backend then runs a scheduled identification job: it retrieves each unprocessed image, submits it to the iNaturalist computer-vision service, takes the top-ranked suggestion, enriches it with the full taxonomic hierarchy (kingdom → species), and writes a permanent species record to a PostgreSQL database. A web application lets an owner see their captures, filter and export the history, view species-frequency charts, ask a conversational assistant about any species, and read an automatically generated ecological interpretation of what the captured community says about local habitat health.

The result is a complete, working pipeline from a physical insect landing on a sensor to a named species with a confidence score appearing on a dashboard, with no human intervention at any step.

---

## 2. Aims and objectives

### 2.1 Problem

Global insect biomass has fallen sharply over recent decades, but most of that decline is invisible because insect monitoring is expensive and labour-intensive. Conventional light trapping requires an entomologist to set the trap, return the next morning, kill or anaesthetise the catch, and identify specimens under a microscope. This means:

- monitoring happens at a handful of sites, a few nights per season;
- specimens are usually killed, which is unacceptable for long-term monitoring of already-declining populations;
- identification is a bottleneck — there are far fewer trained entomologists than there are sites worth monitoring;
- data is fragmented across notebooks and institutions rather than pooled.

### 2.2 Aims

1. Build a field unit that can detect, photograph and record insects autonomously, overnight, without a human present.
2. Identify photographed insects to species level automatically, with a stated confidence score and full taxonomic classification.
3. Operate reliably where there is no continuous internet connection — the unit must never lose a capture because the network was down.
4. Present the resulting data in a form that is useful both to a non-specialist owner (what is in my garden, and is that good?) and to a researcher (a filterable, exportable dataset).
5. Do all of this without killing or injuring any insect.

### 2.3 Measurable objectives

| # | Objective | Success criterion | Status |
|---|---|---|---|
| O1 | Trigger a photograph from sensor input | Capture fires only when all four sensors read 1, with a cooldown to prevent bursts | Achieved |
| O2 | Store captures durably on-device | Every capture written to disk as image + JSON metadata before any upload is attempted | Achieved |
| O3 | Survive network outages | Captures queue locally and upload automatically when connectivity returns; no duplicates | Achieved |
| O4 | Automatic species identification | Species name, confidence score and 7-rank taxonomy stored per capture | Achieved |
| O5 | Multi-unit support | One account can register and switch between multiple boxes | Achieved |
| O6 | Ecological interpretation | Automatically generated habitat-health summary and indicators from the captured community | Achieved |
| O7 | On-device (offline) identification | Species ID computed on the Pi without internet | Not achieved — see §9 |
| O8 | Duplicate-individual filtering | Repeat photos of the same individual merged | Not achieved — see §9 |

---

## 3. Background research

### 3.1 Why light and scent attract insects

Nocturnal insects navigate using transverse orientation to distant light sources. Artificial ultraviolet light exploits this: many moth, beetle and lacewing species have photoreceptor peaks in the UV-A band, which is why entomological light traps use 365 nm and 395 nm sources rather than visible white light. Complementing light with a floral-mimic scent lure (phenylacetaldehyde, eugenol and benzyl acetate are standard components of commercial night-flower lures) broadens the catch to include species that respond to nectar cues rather than light.

### 3.2 Why computer vision for identification

Species identification from photographs is a fine-grained visual classification problem. iNaturalist's computer-vision model is trained on tens of millions of research-grade, community-verified observations and, critically, accepts a geographic prior (latitude/longitude), so it can weight suggestions by what actually occurs at the capture location. Its `combined_score` fuses the raw visual score with that geographic prior. Using this service rather than training a model from scratch was a deliberate design decision: a bespoke model trained on a small dataset would have been far less accurate than a production model trained on a global corpus, and the project's contribution lies in the autonomous pipeline, not in the classifier itself.

### 3.3 Why four sensors instead of one

A single PIR sensor produces frequent false triggers from moving vegetation, temperature gradients and rain. The prototype instead uses two infrared beam-break sensors and two RCWL-0516 microwave Doppler sensors, and requires **unanimous agreement** before firing. Infrared and microwave sensing fail in different ways — IR is confused by heat and direct light, microwave by movement outside the chamber — so requiring all four to agree suppresses the failure modes of each. The cost is reduced sensitivity (a genuine but marginal entry may be missed); the benefit is a very low false-positive rate, which matters because every false trigger costs battery, storage and an API call.

### 3.4 Why store-and-forward rather than live streaming

Field sites rarely have reliable connectivity. Any design that requires a live connection at the moment of capture will lose data. Entolux therefore treats the capture and the upload as fully decoupled stages, with the local filesystem as a durable queue and an `uploaded` flag in each capture's metadata as the idempotency marker.

---

## 4. System architecture

### 4.1 Overview

The system has three tiers plus two external services.

```
┌────────────────────────── FIELD UNIT (Raspberry Pi) ───────────────────────┐
│  Arduino ──serial JSON──► sensor_reader ──queue──► capture_manager         │
│  (IR1, IR2, RCWL1, RCWL2, lat, lng)                    │                   │
│                                                        ▼                   │
│                                            camera.py (OpenCV, USB webcam)  │
│                                                        │                   │
│                                       captures/<timestamp>/image.jpg       │
│                                       captures/<timestamp>/metadata.json   │
│                                                        │                   │
│                                       uploader.py (ping check every 60 s)  │
└────────────────────────────────────────────────────────┼───────────────────┘
                                                         │ HTTPS
                                                         ▼
                          ┌────────────── SUPABASE ──────────────┐
                          │  Storage bucket: wildlife-captures   │
                          │  Table: captures (status = false)    │
                          └──────────────────┬───────────────────┘
                                             │ polled every 15 min
                                             ▼
┌────────────────────── BACKEND (Node.js / Express / TypeScript) ────────────┐
│  node-cron job ──► download image ──► iNaturalist score_image             │
│                                   ──► iNaturalist taxa/{id}               │
│                                   ──► write Species row (Prisma)          │
│                                   ──► mark capture status = true          │
│                                                                            │
│  REST API: /signin /signup /me /everything /box_id /boxes /add_box        │
│            /insights /chat /health /jobs/run-captures                     │
│  Groq (openai/gpt-oss-120b) for /chat and /insights                   │
└────────────────────────────────┬───────────────────────────────────────────┘
                                 │            ▲
                        Prisma   ▼            │ REST + JWT
                       ┌──────────────┐   ┌───┴────────────────────────────┐
                       │  PostgreSQL  │   │ FRONTEND (Next.js 16 / React 19)│
                       │ User/Box/    │   │ /  /about  /auth  /dashboard    │
                       │ Species      │   │ /history  /global-data          │
                       └──────────────┘   └─────────────────────────────────┘
```

### 4.2 Why this split

Identification was deliberately placed in the cloud rather than on the Pi. A Raspberry Pi can run a small classifier, but not one competitive with iNaturalist's; more importantly, moving inference off-device keeps the field unit's power budget low, which is what makes solar operation viable. The field unit's only jobs are sense, photograph, store and upload — all of which are cheap.

The scheduled batch job (rather than an upload-triggered webhook) was chosen for robustness: if the identification service is down or rate-limited, unprocessed captures simply stay flagged `status = false` and are retried on the next tick. Nothing is lost and no retry logic is duplicated.

---

## 5. The field unit

### 5.1 Hardware

| Component | Role |
|---|---|
| Raspberry Pi | Host computer; runs all four Python threads under systemd |
| Arduino (via USB-TTL serial) | Reads the sensor array and emits one JSON line per reading at 9600 baud |
| 2 × IR beam-break sensors (IR1, IR2) | Detect an object physically interrupting the chamber entrance |
| 2 × RCWL-0516 microwave sensors (RCWL1, RCWL2) | Detect movement inside the chamber via Doppler shift |
| GPS module | Supplies `lat`/`lng` with each reading, stamped into capture metadata |
| USB webcam (`/dev/video0`) | Imaging, driven by OpenCV |
| UV-A LED ring (365 nm + 395 nm) | Phototactic attractant |
| Slow-release scent septum | Floral-mimic chemical attractant |
| Solar panel + battery | Power; charges by day, operates by night |

### 5.2 Software design

The Pi runs three concurrent tasks from a single entry point (`raspberry_pi/main.py`):

| Thread | Module | Responsibility |
|---|---|---|
| `SensorReader` (daemon) | `sensor_reader.py` | Reads serial lines, parses JSON, validates that all six required keys are present, pushes readings onto a thread-safe queue. Auto-reconnects with a 5 s backoff if the serial port drops. |
| `Uploader` (daemon) | `uploader.py` | Every 60 s, pings `8.8.8.8`; if online, scans for captures whose metadata has `uploaded: false` and syncs them. |
| `CaptureManager` (main) | `capture_manager.py` | Blocks on the queue, applies the trigger rule and cooldown, calls the camera, writes metadata. |

Running the capture manager in the main thread and the other two as daemons means that a `Ctrl+C` or a systemd stop terminates cleanly without orphaning threads.

### 5.3 Trigger logic

```python
def is_all_sensors_triggered(data: dict) -> bool:
    return (data.get("IR1") == 1 and data.get("IR2") == 1
            and data.get("RCWL1") == 1 and data.get("RCWL2") == 1)
```

A capture fires only when this returns `True` **and** at least `COOLDOWN_SEC` (10 s) has elapsed since the last successful capture. The cooldown uses `time.monotonic()` rather than wall-clock time so that NTP corrections or timezone changes cannot make the cooldown misbehave.

### 5.4 Image capture

`camera.py` opens the webcam only at the moment of capture and releases it immediately afterwards, so the camera draws no power between events. Before taking the frame it:

1. sleeps for `CAMERA_WARMUP_SEC` (2.0 s) to let auto-exposure and auto-focus settle — essential at night, where the first frame is otherwise black;
2. reads and discards five frames, because V4L2 buffers hold stale frames from the previous session;
3. captures and writes the sixth frame as JPEG at quality 85.

If the capture fails, the empty timestamped folder is removed so that the uploader never sees a half-formed capture.

### 5.5 On-disk capture format

Each capture is a self-contained, timestamped directory:

```
captures/2026-06-23_21-08-06/
├── image.jpg
└── metadata.json
```

```json
{
  "timestamp": "2026-06-23T22:00:11.000000+05:30",
  "box_id": "ENT-004821",
  "lat": 22.57,
  "lng": 88.36,
  "sensors": { "IR1": 1, "IR2": 1, "RCWL1": 1, "RCWL2": 1 },
  "uploaded": false
}
```

Timestamps are written in IST (UTC+05:30) as timezone-aware ISO 8601 strings, so they remain unambiguous when the data is later read in another timezone. The `sensors` block preserves the raw trigger state, which allows a later analysis to audit which sensor combination produced any given capture.

### 5.6 Upload and idempotency

The uploader treats `uploaded: false` as its work queue. For each pending capture it uploads `image.jpg` to the Supabase Storage bucket `wildlife-captures` under the key `<folder_name>.jpg`, then inserts a row into the `captures` table:

| Column | Source |
|---|---|
| `captured_at` | metadata `timestamp` |
| `latitude`, `longitude` | GPS from the sensor reading |
| `image_path` | storage key |
| `ir1`, `ir2`, `rcwl1`, `rcwl2` | raw sensor states |
| `box_id` | unit identifier from `.env` |
| `status` | `false` — meaning "not yet identified" |

Only after both operations succeed is `uploaded` flipped to `true` locally. Duplicate-key errors from either storage or the database are caught and treated as success, because they can only mean the capture was already synced — this makes the whole upload path safely re-runnable after a crash mid-cycle.

### 5.7 Reliability under field conditions

- **Power loss:** captures are on disk before any network work begins, so an unexpected shutdown loses at most the capture in flight.
- **Serial dropout:** the reader closes and reopens the port and continues.
- **Network loss:** the uploader simply logs and retries on the next 60 s cycle.
- **Process crash:** `forest_trap.service` is a systemd unit with `Restart=on-failure` and `RestartSec=10`, so the unit self-heals and starts automatically at boot.
- **Auditability:** every event is logged to both stdout (captured by journald) and `forest_trap.log`.

---

## 6. Cloud identification pipeline

### 6.1 Scheduling

`backend/index.ts` registers a `node-cron` job on `*/15 * * * *` in the `Asia/Kolkata` timezone. Every fifteen minutes it queries Supabase for all captures with `status = false` and processes them sequentially. A manual trigger endpoint, `POST /jobs/run-captures`, runs the same function on demand — used for testing and for forcing a catch-up after a backlog.

### 6.2 Per-capture processing

For each unprocessed capture:

1. **Download** the image. `downloadImage()` handles both a full HTTP(S) URL and a Supabase Storage key, so the pipeline works whether the image is public or private.
2. **Classify.** The image bytes plus `lat`/`lng` are POSTed as multipart form data to `https://api.inaturalist.org/v1/computervision/score_image`. The geographic prior materially improves accuracy by down-weighting species that do not occur at the site.
3. **Select.** The top-ranked suggestion is taken and its `combined_score` rounded to an integer confidence percentage.
4. **Enrich.** `GET /v1/taxa/{id}` returns the full record; the `ancestors` array is flattened into a rank → name map to extract kingdom, class, order, family, genus and species, along with the global observation count, Wikipedia URL and a reference photograph.
5. **Register the box.** `ensureBox()` performs a Prisma `upsert` on `box_id_default`, so a brand-new field unit is registered on its first capture without any manual setup.
6. **Persist.** A `Species` row is written with the taxonomy, confidence, reference links and owning box.
7. **Mark complete.** The Supabase capture row is set to `status = true`.

Errors are caught per capture: one failure logs and moves on, leaving that capture flagged for retry rather than aborting the batch. A capture that returns no suggestions is skipped without being marked done.

### 6.3 Data model

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String            // bcrypt hash, cost factor 10
  user_type    String            // "personal" | "researcher"
  time_created DateTime @default(now())
}

model Box {
  id             String    @id @default(cuid())
  box_name       String?           // human-friendly nickname
  box_id_default String    @unique // physical unit ID, e.g. ENT-004821
  species        Species[]
}

model Species {
  id                 String  @id @default(cuid())
  taxon_id           BigInt          // iNaturalist taxon ID
  name               String          // common name, falling back to scientific
  confidence_score   Int
  kingdom            String?
  class              String?
  order              String?
  family             String?
  genus              String?
  species            String?
  observation_string String?         // global observation count
  image_string       String?         // reference photo URL
  wikipedia_string   String?
  box_id             String
  box                Box     @relation(fields: [box_id], references: [box_id_default])
}
```

The `Species` → `Box` relation is keyed on the physical unit ID rather than the surrogate primary key, so the field unit only ever needs to know its own printed ID. `taxon_id` is a `BigInt` because iNaturalist taxon IDs exceed the 32-bit range; it is serialised to a string before being sent over JSON, since JSON has no native 64-bit integer type.

Two databases are used deliberately. Supabase holds the raw capture queue and image blobs — a write-heavy, transient workload. PostgreSQL (via Prisma, with Prisma Accelerate connection pooling and caching) holds the processed scientific records — a read-heavy, permanent workload. Keeping them separate means a flood of raw uploads cannot degrade dashboard queries.

---

## 7. Web application

### 7.1 Backend API

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/signup` | Create an account; bcrypt-hashes the password (cost 10) and returns a 7-day JWT |
| `POST` | `/signin` | Verify credentials with `bcrypt.compare`, return a JWT |
| `GET` | `/me` | Validate the bearer token and return the current user; used to restore a session on page load |
| `GET` | `/everything` | All species records across all boxes |
| `POST` | `/box_id` | Species records for one box |
| `GET` | `/boxes` | All registered boxes |
| `POST` | `/add_box` | Register a physical unit and give it a nickname |
| `POST` | `/insights` | Generate an ecological interpretation of a box's captures |
| `POST` | `/chat` | Streaming conversational assistant |
| `GET` | `/health` | Liveness probe |
| `POST` | `/jobs/run-captures` | Manually trigger the identification job |

Authentication uses stateless JWTs signed with `JWT_SECRET`, carrying `id`, `email` and `user_type`, expiring after seven days. The token is stored in the browser's `localStorage` and replayed as a bearer header; `/me` re-validates it on every page load so a revoked or expired token cleanly logs the user out.

### 7.2 The ecological insights engine

`POST /insights` is the feature that turns a species list into an ecological statement. It:

1. loads all species for the selected box (or all boxes);
2. aggregates them into a frequency table (`"Luna Moth: 3 capture(s), Firefly: 1 capture"`);
3. sends that table to Groq's `openai/gpt-oss-120b` under a system prompt that constrains the reply to a strict JSON schema — an 80–120 word summary, exactly three status badges, and four to six indicator objects, each with an icon name, category title, the species that triggered it, what it means, and a health status of `healthy`/`moderate`/`warning`;
4. requests `response_format: { type: "json_object" }` so the model cannot emit prose around the JSON;
5. falls back to a hard-coded, schema-shaped placeholder response if the model call or the JSON parse fails, so the dashboard never breaks.

The design point here is that the model is used as a *constrained transformer of structured data*, not as an open-ended oracle: it only ever sees a species frequency table, and it can only reply in a shape the interface already knows how to render.

### 7.3 Conversational assistant

`POST /chat` streams a response token-by-token using `Transfer-Encoding: chunked`, so text appears progressively in the chat window rather than after a pause. The system instruction constrains the assistant to insect-related discussion, plain-text output and roughly 100 words. The dashboard wires "Ask about this species" buttons directly into the assistant, pre-filling a question about the species that was clicked.

### 7.4 Frontend

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and Radix UI primitives, with Recharts for visualisation.

| Route | Contents |
|---|---|
| `/` | Landing page: the attract → capture → identify explanation and sample captures |
| `/about` | Long-form explanation of the science and the hardware, with an annotated SVG diagram of the unit |
| `/auth` | Sign-in and sign-up; account type selector (personal vs researcher, the latter capturing institution and research focus) |
| `/dashboard` | Per-box overview, recent captures, species-frequency chart, and the generated ecological insight panel |
| `/history` | Full capture archive with search by common or scientific name, box filter, minimum-confidence slider, time-of-night filter, pagination (9 per page) and CSV export |
| `/global-data` | Researcher-only pooled dataset with sortable columns, filters and export |

Application state is held in a single React context (`lib/auth-context.tsx`) that owns the session, the box list, the selected box and the capture list. On sign-in it fetches `/boxes` and `/everything` in one pass and merges box records from three sources — the backend box table, box IDs appearing in capture records, and locally registered boxes — so a box appears in the interface as soon as it has produced data, even if it was never explicitly registered.

The `/global-data` route is only rendered in the navigation for accounts whose `user_type` is `researcher`.

---

## 8. Testing and results

### 8.1 Component tests

`tests/` holds standalone scripts used to validate each external dependency before it was integrated:

| Script | What it verified |
|---|---|
| `indentifier.py` | End-to-end iNaturalist flow: score an image, print the top three suggestions with scores and taxon IDs, create an observation, attach the photo |
| `taxon_details.py` | That a taxon ID resolves to a complete, usable taxonomy — all seven ranks plus conservation flags, observation count, Wikipedia URL and photo |
| `network_pinger.py` | The connectivity check that gates the uploader |
| `token_generation.py` | Automated retrieval of an iNaturalist API token, since the token is short-lived |

### 8.2 Identification accuracy

The reference test image (`tests/green_darner.jpg`, a green darner dragonfly) was submitted with the prototype site coordinates (22.57 N, 88.36 E). The pipeline returned a ranked suggestion list with `combined_score` values and taxon IDs, and the top suggestion resolved to a complete taxonomic record. Confidence is stored per record rather than being thresholded away, which lets a user filter on the history page by minimum confidence and decide their own tolerance — an important property for scientific use, where a low-confidence record is still data.

### 8.3 Field captures

Three captures were recorded and retained by the prototype unit `ENT-004821` on 18 and 23 June 2026, at 21:13, 22:00 and 21:08 IST. All three show the intended pattern: all four sensors reading 1, GPS coordinates present, and `uploaded: true` confirming that the store-and-forward cycle completed. The capture times cluster in the post-dusk window, which is the expected activity peak for the UV-attracted nocturnal taxa the unit targets.

### 8.4 Pipeline behaviour verified

- Offline capture followed by later upload works, with no duplication on retry.
- A restart mid-cycle does not re-upload already-synced captures.
- Registering a previously unseen `box_id` creates a box record automatically.
- A failed identification leaves the capture flagged for retry rather than silently dropping it.
- The insights endpoint returns a valid, renderable response even when the model call fails.

### 8.5 Project management

Development ran across eight commits between 17 and 26 June 2026, moving from the initial three-tier scaffold, through integration fixes across all three subsystems, to containerisation and finally to interface refinements (dynamic box updates, sign-out handling). The identification cron interval was deliberately relaxed from one minute to fifteen once correctness was established, to reduce API load — a change recorded in the commit history.

---

## 9. Evaluation and limitations

Honest evaluation is a core part of the engineering process, so the gaps between the specification and the working prototype are set out explicitly.

### 9.1 Specification versus current build

| Aspect | As described in the project's public-facing pages | As currently built |
|---|---|---|
| Trigger | Single PIR motion sensor | Four sensors (2 × IR, 2 × RCWL microwave) with unanimous agreement — **an improvement on the original design** |
| Camera | Raspberry Pi HQ 12 MP macro camera | USB webcam via OpenCV |
| Identification | On-device ML model, seconds after capture | Cloud iNaturalist computer vision, on a 15-minute batch cycle |
| Connectivity | 4G, no Wi-Fi required | Wi-Fi, with offline store-and-forward |
| Duplicate handling | Perceptual hashing to merge repeat photos of one individual | Not implemented; a 10-second cooldown is the only suppression |
| Timed release vent | Automatic timed exit vent | Not implemented in the prototype |

### 9.2 Known limitations

1. **The sensor thread is currently disabled.** In `main.py`, the `SensorReader` thread start is commented out, so a running unit depends on readings being supplied to the queue by other means. This was done for bench testing without the Arduino attached and must be re-enabled for field deployment.
2. **Only the top suggestion is stored.** iNaturalist returns a ranked list; keeping the top three with their scores would let a human reviewer resolve ambiguous cases and would support a proper accuracy audit.
3. **No ground-truth accuracy measurement.** The system's identifications have not been checked against expert determinations, so no accuracy figure can be claimed. This is the single most important next step for scientific credibility.
4. **Capture timestamps are not propagated to the interface.** The real `captured_at` value exists in Supabase but is not copied into the `Species` record, so the frontend displays placeholder dates and times. Adding a timestamp column to `Species` would fix this and would unlock genuine time-of-night analysis.
5. **Placeholder fields on the global dataset page.** Region, elevation and season are hard-coded rather than derived from the stored GPS coordinates and capture date; all three are computable from data the system already holds.
6. **`/everything` is unauthenticated.** All species records are readable without a token. It should require a valid JWT, and personal captures should be anonymised before entering the researcher-facing pool, as the project's own privacy commitment states.
7. **A live API token is committed in the test scripts.** `tests/indentifier.py`, `tests/taxon_details.py` and `tests/token_generation.py` contain a hard-coded iNaturalist token and account credentials. These should be moved to environment variables and the exposed credentials rotated before the repository is shared.
8. **Confidence scoring is not calibrated.** `combined_score` is stored directly as a percentage. It is a ranking score, not a calibrated probability, and should be described as such rather than as "94% certain".
9. **Single-site validation.** All field data comes from one unit at one location over one week. Seasonal and geographic generalisation is untested.

### 9.3 What worked well

- Decoupling capture from upload proved to be the right architectural decision: it is what makes the unit usable at a site with no reliable network, and it made every stage independently testable.
- Using `uploaded` and `status` flags as idempotency markers gave crash-safe, replayable processing with almost no code.
- Requiring unanimity across two different sensing technologies suppressed false triggers far more effectively than tuning a single sensor's sensitivity.
- Constraining the language model to a fixed JSON schema, with a schema-shaped fallback, made an inherently unpredictable component safe to put in a user-facing interface.

---

## 10. Further work

**Immediate (correctness and rigour)**

1. Re-enable the sensor reader thread and complete a full multi-night field deployment.
2. Add `captured_at`, `latitude` and `longitude` to the `Species` model so every record carries real time and place.
3. Store the top three suggestions with their scores, and validate a sample of identifications against expert determination to produce a genuine accuracy figure.
4. Move all credentials to environment variables, rotate the exposed token, and require authentication on `/everything`.

**Medium term (capability)**

5. Implement perceptual-hash duplicate detection so repeat photographs of one individual within a session collapse into a single record.
6. Derive region, season and elevation from the stored coordinates and timestamp rather than hard-coding them.
7. Add temperature, humidity and ambient-light sensors so captures can be correlated with weather — the strongest known driver of nightly insect activity.
8. Add the timed release vent to guarantee, mechanically rather than by convention, that specimens leave unharmed.

**Longer term (scale and science)**

9. Deploy a distributed network of units and analyse species richness against land use, light pollution and distance from habitat edges.
10. Evaluate an on-device quantised classifier as a first-pass filter, so obviously empty or unidentifiable frames are discarded before they consume bandwidth.
11. Publish anonymised records back to iNaturalist as observations, contributing the data to the same corpus the system depends on — the scripted observation-creation path for this already exists in `tests/indentifier.py`.

---

## 11. Safety, ethics and environmental considerations

**Animal welfare.** No insect is killed, anaesthetised or physically restrained. Specimens enter a chamber, are photographed under a brief LED flash, and leave. This is the project's central ethical commitment and the reason it can be run continuously in a location where populations are already under pressure — unlike conventional killing traps, long-term monitoring here does not itself contribute to decline.

**Light pollution.** The unit emits UV-A at night, which is itself a form of light pollution and can disrupt local insect behaviour. This is mitigated by keeping emission low-power, brief and localised, and it is an argument for duty-cycling the lure rather than running it all night — a change recommended in §10.

**Electrical safety.** The unit is low-voltage and battery-powered, weatherproofed, and designed for unattended outdoor operation. Solar charging removes any need for a mains connection in the field.

**Data privacy.** Capture records include GPS coordinates, which for a garden-deployed unit identify a home. The system's stated commitment is that records reaching the researcher dataset are anonymised and location-generalised; §9.2 notes that this is not yet enforced in code and must be before any wider release.

**Attribution.** Species identification is performed by iNaturalist's computer-vision service and taxonomic data comes from the iNaturalist API. Ecological summaries are generated by an OpenAI gpt-oss-120b model served via Groq. These are external services, not original work, and are credited as such.

---

## 12. Technical appendix

### 12.1 Repository layout

```
insect-detection/
├── raspberry_pi/            Field unit (Python 3)
│   ├── main.py              Entry point; starts the three threads
│   ├── config.py            All tunable parameters
│   ├── sensor_reader.py     Serial JSON reader
│   ├── capture_manager.py   Trigger logic, cooldown, metadata
│   ├── camera.py            OpenCV webcam capture
│   ├── uploader.py          Connectivity check + Supabase sync
│   ├── setup_supabase.sql   Cloud schema and bucket setup
│   ├── forest_trap.service  systemd unit
│   ├── requirements.txt
│   └── captures/            Local capture store
├── backend/                 API + identification pipeline (TypeScript)
│   ├── index.ts             Express app, cron job, all routes
│   ├── prisma/schema.prisma Data model
│   ├── prisma/migrations/
│   └── Dockerfile
├── frontend/                Web application (Next.js 16)
│   ├── app/                 Routes: / about auth dashboard history global-data
│   ├── components/          Navigation, chatbot, chart, modals, UI primitives
│   └── lib/auth-context.tsx Session, boxes and captures state
└── tests/                   Standalone integration scripts
```

### 12.2 Configuration parameters

| Parameter | Value | Rationale |
|---|---|---|
| `SERIAL_PORT` | `/dev/ttyUSB0` | USB-TTL adapter to the Arduino |
| `BAUD_RATE` | 9600 | Sufficient for one small JSON object per reading; robust over long cables |
| `SERIAL_TIMEOUT` | 1 s | Keeps the read loop responsive when no data arrives |
| `CAMERA_INDEX` | 0 | `/dev/video0` |
| `CAMERA_WARMUP_SEC` | 2.0 s | Auto-exposure settling; critical for night frames |
| `JPEG_QUALITY` | 85 | Detail sufficient for classification without inflating upload size |
| `COOLDOWN_SEC` | 10 s | Prevents a burst of near-identical frames from one visit |
| `WIFI_CHECK_INTERVAL_SEC` | 60 s | Balances upload latency against battery cost |
| `PING_HOST` / `PING_TIMEOUT_SEC` | `8.8.8.8` / 3 s | Cheap, reliable connectivity probe |
| Cron schedule | `*/15 * * * *`, Asia/Kolkata | Batches identification work; relaxed from 1 min after validation |
| JWT expiry | 7 days | Avoids frequent re-login on a monitoring dashboard |
| bcrypt cost | 10 | Standard work factor |

### 12.3 Environment variables

| Subsystem | Variables |
|---|---|
| Field unit | `SUPABASE_URL`, `SUPABASE_KEY`, `BOX_ID` |
| Backend | `DATABASE_URL`, `PRISMA_ACCELERATE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_STORAGE_BUCKET`, `INATURALIST_TOKEN`, `GROQ_API_KEY`, `JWT_SECRET`, `PORT` |
| Frontend | `NEXT_PUBLIC_API_URL` |

### 12.4 Deployment

**Field unit**

```bash
pip install -r raspberry_pi/requirements.txt
sudo cp raspberry_pi/forest_trap.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now forest_trap.service
journalctl -u forest_trap.service -f
```

**Backend** — containerised from `node:22-alpine`; the image installs dependencies, runs `prisma generate`, compiles TypeScript and serves `dist/index.js` on port 3000.

```bash
docker build -t entolux-backend backend/
docker run -p 3000:3000 --env-file backend/.env entolux-backend
```

**Cloud schema** — `raspberry_pi/setup_supabase.sql` creates the `captures` table with indexes on `captured_at DESC` and on `(latitude, longitude)` for time-range and geographic queries; the `wildlife-captures` storage bucket is created privately via the Supabase dashboard.

### 12.5 Technology stack

| Layer | Technology |
|---|---|
| Field unit | Python 3, OpenCV (headless), pySerial, supabase-py, python-dotenv, systemd |
| Backend | Node.js 22, Express 5, TypeScript, Prisma 7 (+ Accelerate), node-cron, jsonwebtoken, bcrypt, Docker |
| Databases | PostgreSQL (species records), Supabase Postgres + Storage (capture queue and images) |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Radix UI, Recharts, Lucide icons |
| External services | iNaturalist computer vision and taxonomy API; Groq (`openai/gpt-oss-120b`) |

---

## 13. Conclusion

Entolux demonstrates that a complete autonomous insect-monitoring pipeline — physical detection, imaging, cloud identification to species level with full taxonomy, and ecological interpretation — can be built from a Raspberry Pi, an inexpensive sensor array, and publicly available scientific APIs, with no specialist entomological training required to operate it and no harm to the insects it records.

The engineering contribution is not the classifier, which is an existing service, but the pipeline around it: a store-and-forward design that makes the unit usable at sites with no reliable network, idempotent processing that makes the whole chain crash-safe and replayable, and a multi-sensor unanimity rule that suppresses the false triggers that make single-sensor traps impractical to leave unattended.

The prototype's limitations are equally instructive. Real capture timestamps are not yet carried through to the interface, identifications have not been validated against expert determination, and several fields presented to researchers are still placeholders. These are the difference between a working demonstration and a scientific instrument, and §10 sets out the specific work needed to close that gap. What the prototype does establish is that the architecture is sound and the pipeline runs end to end — from an insect landing on a sensor in Kolkata to a named species with a taxonomy and an ecological interpretation on a dashboard, entirely unattended.
