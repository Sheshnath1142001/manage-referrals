
// Type definitions for Google Maps JavaScript API 3.51
// This is a simplified version for our use case

declare interface Window {
  google: typeof google;
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    mapTypeId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    styles?: Array<MapTypeStyle>;
  }

  interface LatLngBounds {
    extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    isEmpty(): boolean;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
    toJSON(): LatLngLiteral;
    toString(): string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string | Icon | Symbol;
    label?: string | MarkerLabel;
    draggable?: boolean;
    clickable?: boolean;
    animation?: Animation;
    zIndex?: number;
  }

  interface Icon {
    url: string;
    size?: Size;
    scaledSize?: Size;
    origin?: Point;
    anchor?: Point;
    labelOrigin?: Point;
  }

  interface MarkerLabel {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }

  interface Symbol {
    path: string | SymbolPath;
    fillColor?: string;
    fillOpacity?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  enum SymbolPath {
    BACKWARD_CLOSED_ARROW,
    BACKWARD_OPEN_ARROW,
    CIRCLE,
    FORWARD_CLOSED_ARROW,
    FORWARD_OPEN_ARROW
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLng | LatLngLiteral): void;
    setTitle(title: string): void;
    setVisible(visible: boolean): void;
    setZIndex(zIndex: number): void;
    getPosition(): LatLng;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    width: number;
    height: number;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  enum Animation {
    BOUNCE,
    DROP
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map?: Map, anchor?: Marker): void;
    close(): void;
    setContent(content: string | Node): void;
  }

  interface InfoWindowOptions {
    content?: string | Node;
    disableAutoPan?: boolean;
    maxWidth?: number;
    pixelOffset?: Size;
    position?: LatLng | LatLngLiteral;
    zIndex?: number;
  }

  class Circle {
    constructor(opts?: CircleOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setRadius(radius: number): void;
    setVisible(visible: boolean): void;
    setMap(map: Map | null): void;
  }

  interface CircleOptions {
    center?: LatLng | LatLngLiteral;
    radius?: number;
    map?: Map;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    fillColor?: string;
    fillOpacity?: number;
    draggable?: boolean;
    editable?: boolean;
    visible?: boolean;
    zIndex?: number;
  }

  interface MapsEventListener {
    remove(): void;
  }

  interface MapTypeStyle {
    featureType?: string;
    elementType?: string;
    stylers: MapTypeStyler[];
  }

  interface MapTypeStyler {
    [k: string]: string | number | boolean;
  }
}
