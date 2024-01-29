import React from "react";
import "../index.css";
import SchoolSVGItem from "./schoolSVG.component";
import HWSVGItem from "./HWSVG.component";
import PlaySVGItem from "./playSVG.component";
import HygieneSVGItem from "./hygieneSVG.component";

const DayFridayItem = () => {
  return (
    <div className="wrapper flex gap-7 justify-center mt-10">
      <div className="day flex-initial w-24 ">
        <svg
          fill="#000000"
          viewBox="-0.02 0 122.88 122.88"
          version="1.1"
          id="Layer_1"
        >
          <g>
            <path d="M81.54,4.71c0-2.62,2.58-4.71,5.77-4.71c3.2,0,5.77,2.13,5.77,4.71V25.4c0,2.62-2.58,4.71-5.77,4.71 c-3.2,0-5.77-2.13-5.77-4.71V4.71L81.54,4.71z M85.39,72.65h7.98v25.73h-7.98V72.65L85.39,72.65z M55.37,98.38V72.65h13.25 c2.46,0,4.34,0.21,5.63,0.63c1.3,0.42,2.35,1.2,3.14,2.34c0.8,1.14,1.19,2.54,1.19,4.18c0,1.43-0.31,2.66-0.92,3.69 c-0.6,1.04-1.44,1.88-2.52,2.53c-0.68,0.41-1.61,0.75-2.79,1.02c0.95,0.32,1.64,0.63,2.07,0.95c0.29,0.21,0.71,0.67,1.27,1.35 c0.55,0.69,0.92,1.22,1.11,1.6l3.86,7.43h-8.98l-4.25-7.85c-0.54-1.02-1.02-1.68-1.44-1.98c-0.57-0.4-1.23-0.59-1.95-0.59h-0.7 v10.42H55.37L55.37,98.38z M63.34,83.11h3.36c0.36,0,1.07-0.12,2.11-0.35c0.53-0.1,0.96-0.37,1.29-0.81c0.34-0.44,0.5-0.93,0.5-1.5 c0-0.83-0.26-1.47-0.79-1.92c-0.53-0.45-1.52-0.67-2.97-0.67h-3.5V83.11L63.34,83.11z M29.46,72.65h19.66v5.53H37.44v4.49h9.99 v5.21h-9.99v10.49h-7.98V72.65L29.46,72.65z M29.53,4.71c0-2.62,2.58-4.71,5.77-4.71c3.2,0,5.77,2.13,5.77,4.71V25.4 c0,2.62-2.58,4.71-5.77,4.71c-3.2,0-5.77-2.13-5.77-4.71V4.71L29.53,4.71z M7.56,44.09h107.62V22.66c0-0.8-0.31-1.55-0.84-2.04 c-0.53-0.53-1.24-0.84-2.04-0.84h-9.31c-1.78,0-3.2-2.63-3.2-4.41c0-1.78,1.42-3.2,3.2-3.2h10.53c2.58,0,4.88,1.07,6.57,2.75 c1.69,1.69,2.75,4.04,2.75,6.57v92.06c0,2.58-1.07,4.88-2.75,6.57c-1.69,1.69-4.04,2.75-6.57,2.75H9.33 c-2.58,0-4.88-1.07-6.57-2.75C1.07,118.44,0,116.08,0,113.55V21.49c0-2.58,1.07-4.89,2.75-6.57c1.69-1.69,4.04-2.75,6.57-2.75 h11.28c1.78,0,3.2,1.42,3.2,3.2s-1.42,4.41-3.2,4.41H10.54c-0.8,0-1.55,0.31-2.09,0.84c-0.53,0.53-0.84,1.24-0.84,2.09v21.43 L7.56,44.09L7.56,44.09z M115.19,52.9H7.56v59.4c0,0.8,0.31,1.55,0.84,2.09c0.53,0.53,1.24,0.84,2.09,0.84h101.76 c0.8,0,1.55-0.31,2.09-0.84c0.53-0.53,0.84-1.24,0.84-2.09V52.9L115.19,52.9z M50.36,19.73c-1.78,0-3.2-2.63-3.2-4.41 c0-1.78,1.42-3.2,3.2-3.2h21.49c1.78,0,3.2,1.42,3.2,3.2c0,1.78-1.42,4.41-3.2,4.41H50.36L50.36,19.73z" />
          </g>
        </svg>
      </div>
      <PlaySVGItem></PlaySVGItem>
      <HygieneSVGItem></HygieneSVGItem>
      <SchoolSVGItem></SchoolSVGItem>
      <HWSVGItem></HWSVGItem>
    </div>
  );
};
export default DayFridayItem;
