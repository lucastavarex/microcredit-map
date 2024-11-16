import React, { useEffect, useState } from 'react';
import './SliderComponent.css';

const SliderComponent = ({ value, min, max, step, onChange }) => {
  useEffect(() => {
    const sliders = document.getElementsByClassName("tick-slider-input");
    for (let slider of sliders) {
      updateValue(slider);
      updateValuePosition(slider);
      updateLabels(slider);
      updateProgress(slider);
      setTicks(slider);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onSliderInput = (event) => {
    const slider = event.target;
    updateValue(slider);
    updateValuePosition(slider);
    updateLabels(slider);
    updateProgress(slider);
    onChange(slider.value);
  };

  const updateValue = (slider) => {
    let value = document.getElementById(slider.dataset.valueId);
    value.innerHTML = "<div>" + slider.value + "</div>";
  };

  const updateValuePosition = (slider) => {
    let value = document.getElementById(slider.dataset.valueId);
    const percent = getSliderPercent(slider);
    const sliderWidth = slider.getBoundingClientRect().width;
    const valueWidth = value.getBoundingClientRect().width;
    const handleSize = slider.dataset.handleSize;
    let left = percent * (sliderWidth - handleSize) + handleSize / 2 - valueWidth / 2;
    left = Math.min(left, sliderWidth - valueWidth);
    left = slider.value === slider.min ? 0 : left;
    value.style.left = left + "px";
  };

  const updateLabels = (slider) => {
    const value = document.getElementById(slider.dataset.valueId);
    const minLabel = document.getElementById(slider.dataset.minLabelId);
    const maxLabel = document.getElementById(slider.dataset.maxLabelId);
    const valueRect = value.getBoundingClientRect();
    const minLabelRect = minLabel.getBoundingClientRect();
    const maxLabelRect = maxLabel.getBoundingClientRect();
    const minLabelDelta = valueRect.left - (minLabelRect.left);
    const maxLabelDelta = maxLabelRect.left - valueRect.left;
    const deltaThreshold = 32;
    if (minLabelDelta < deltaThreshold) minLabel.classList.add("hidden");
    else minLabel.classList.remove("hidden");
    if (maxLabelDelta < deltaThreshold) maxLabel.classList.add("hidden");
    else maxLabel.classList.remove("hidden");
  };

  const updateProgress = (slider) => {
    let progress = document.getElementById(slider.dataset.progressId);
    const percent = getSliderPercent(slider);
    progress.style.width = percent * 100 + "%";
  };

  const getSliderPercent = (slider) => {
    const range = slider.max - slider.min;
    const absValue = slider.value - slider.min;
    return absValue / range;
  };

  const setTicks = (slider) => {
    let container = document.getElementById(slider.dataset.tickId);
    const spacing = parseFloat(slider.dataset.tickStep);
    const sliderRange = slider.max - slider.min;
    const tickCount = sliderRange / spacing + 1;
    for (let ii = 0; ii < tickCount; ii++) {
      let tick = document.createElement("span");
      tick.className = "tick-slider-tick";
      container.appendChild(tick);
    }
  };

  const onResize = () => {
    const sliders = document.getElementsByClassName("tick-slider-input");
    for (let slider of sliders) {
      updateValuePosition(slider);
    }
  };

  return (
    <div id="wrapper">
      <div id="sliderContainer">
        <div className="tick-slider">
          <div className="tick-slider-header">
            <h5><label htmlFor="radiusSlider">Raio</label></h5>
            <h5>metros</h5>
          </div>
          <div className="tick-slider-value-container">
            <div id="radiusLabelMin" className="tick-slider-label">{min}</div>
            <div id="radiusLabelMax" className="tick-slider-label">{max}</div>
            <div id="radiusValue" className="tick-slider-value"></div>
          </div>
          <div className="tick-slider-background"></div>
          <div id="radiusProgress" className="tick-slider-progress"></div>
          <div id="radiusTicks" className="tick-slider-tick-container"></div>
          <input
            id="radiusSlider"
            className="tick-slider-input"
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            data-tick-step={step}
            data-tick-id="radiusTicks"
            data-value-id="radiusValue"
            data-progress-id="radiusProgress"
            data-handle-size="18"
            data-min-label-id="radiusLabelMin"
            data-max-label-id="radiusLabelMax"
            onInput={onSliderInput}
          />
        </div>
      </div>
    </div>
  );
};

export default SliderComponent;