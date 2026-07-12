# Planning Location and Radius Contract

StatTerrain v0.3.5 uses one canonical `PlanningLocation` and one canonical radius in miles. Search results, coordinate searches, facility selections when later enabled, and map clicks must call the same `setPlanningLocation(location)` path. The same planning point and radius drive map centering, the planning marker, CMS partition selection, Haversine facility filtering, summaries, and Evidence Brief exports.

Supported typed search forms are U.S. street address, city/state, ZIP code, and latitude/longitude pairs such as `38.8977, -77.0365` or `38.8977 -77.0365`. County, landmark, and hospital-name search are not claimed in normal UI until implemented and tested.

Radius policy: one value in miles, minimum 1, maximum 250, one decimal place. Slider, text input, and 10/25/50/100-mile buttons update the same value. Text entry may be blank or partial while editing; on Enter or blur, invalid or out-of-range text restores the previous valid value and shows an inline error. Radius is straight-line Haversine planning distance, not routing or drive time.

Missing data must be described as unavailable or unmapped, never as absence of a service. Search failure must not set a default coordinate or use synthetic fallback.
