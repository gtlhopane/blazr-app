"use client"

import { useRef, useEffect, useState } from "react"

interface GooglePlacesInputProps {
  value: string
  onChange: (value: string, city?: string, province?: string) => void
  placeholder?: string
  className?: string
}

export default function GooglePlacesInput({
  value,
  onChange,
  placeholder = "Start typing your address...",
  className = "",
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const API_KEY = "AIzaSyBKxrO8cvZlWfldbx-11QRoMMJ1ZUbyj-s"

    if (typeof window === "undefined") return

    const loadScript = () => {
      if (document.getElementById("google-places-script")) {
        initAutocomplete()
        return
      }
      const script = document.createElement("script")
      script.id = "google-places-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initGooglePlaces`
      script.async = true
      script.defer = true
      ;(window as any).initGooglePlaces = initAutocomplete
      document.head.appendChild(script)
    }

    const initAutocomplete = () => {
      if (!inputRef.current || !(window as any).google) return
      setLoaded(true)
      autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "za" },
        fields: ["address_components", "formatted_address"],
      })
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (!place?.address_components) return
        const components = place.address_components
        const get = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || ""
        const streetNumber = get("street_number")
        const route = get("route")
        const streetAddress = [streetNumber, route].filter(Boolean).join(" ")
        const cityLong = get("locality") || get("postal_town") || get("sublocality")
        const provLong = get("administrative_area_level_1")
        onChange(streetAddress || place.formatted_address || "", cityLong, provLong)
      })
    }

    if ((window as any).google?.maps?.places) {
      initAutocomplete()
    } else {
      loadScript()
    }
  }, [onChange])

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-700 bg-slate-900/50 h-10 px-3 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#FAD03F]"
        autoComplete="off"
      />
    </div>
  )
}
