"use client"

import { useRef, useEffect, useState } from "react"

interface GooglePlacesInputProps {
  value: string
  onChange: (value: string, city?: string, province?: string) => void
  placeholder?: string
  className?: string
  city?: string
  province?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any



let scriptLoaded = false
let scriptLoading = false
const callbacks: (() => void)[] = []

function loadGooglePlacesScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  if (scriptLoading) return new Promise((res) => { callbacks.push(res) })

  scriptLoading = true
  const API_KEY = "AIzaSyDLB7DwQ5cL8bLCbV_OvM98c7egkq5Sj_M"

  return new Promise((resolve, reject) => {
    callbacks.push(resolve)
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initGooglePlaces`
    script.async = true
    script.defer = true
    window.initGooglePlaces = () => {
      scriptLoaded = true
      scriptLoading = false
      callbacks.forEach((cb) => cb())
    }
    script.onerror = () => {
      scriptLoading = false
      reject(new Error("Google Places script failed"))
    }
    document.head.appendChild(script)
  })
}

export default function GooglePlacesInput({
  value,
  onChange,
  placeholder = "Start typing your address...",
  className = "",
  city,
  province,
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadGooglePlacesScript()
      .then(() => setLoaded(true))
      .catch(() => console.warn("Google Places not available"))
  }, [])

  useEffect(() => {
    if (!loaded || !window.google || !inputRef.current) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "za" },
      fields: ["address_components", "formatted_address"],
    })

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace()
      if (!place?.address_components) return

      const components = place.address_components
      const getComponent = (type: string) =>
        components.find((c) => c.types.includes(type))?.long_name || ""

      const streetNumber = getComponent("street_number")
      const route = getComponent("route")
      const streetAddress = [streetNumber, route].filter(Boolean).join(" ")

      const cityLong = getComponent("locality") || getComponent("postal_town") || getComponent("sublocality")
      const provLong = getComponent("administrative_area_level_1")

      onChange(streetAddress || place.formatted_address || "", cityLong, provLong)
    })
  }, [loaded, onChange])

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, city, province)}
        placeholder={placeholder}
        className="w-full border border-slate-700 bg-slate-900/50 h-10 px-3 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#FAD03F]"
        autoComplete="off"
      />
    </div>
  )
}
