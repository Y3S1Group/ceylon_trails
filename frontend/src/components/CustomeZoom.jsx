import { Minus, Plus } from 'lucide-react';
import React from 'react'
import { useMap } from 'react-leaflet'

const CustomeZoom = () => {
    const map = useMap();

    return (
       <div className="absolute right-5 bottom-10 z-[9999] flex flex-col gap-2">
            <button
                onClick={() => map.zoomIn()}
                className="p-2 bg-white rounded-lg shadow hover:bg-teal-500 hover:text-white transition"
            >
                <Plus className="w-5 h-5" />
            </button>
            <button
                onClick={() => map.zoomOut()}
                className="p-2 bg-white rounded-lg shadow hover:bg-teal-500 hover:text-white transition"
            >
                <Minus className="w-5 h-5" />
            </button>
        </div> 
    );
}

export default CustomeZoom