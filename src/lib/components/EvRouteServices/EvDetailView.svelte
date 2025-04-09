<script>
    import { onMount } from 'svelte';
    
    // Props for the component
    let { vehicle, onClose } = $props();
    
    // State for the charging graph
    let chargingCanvas;
    let chargingCtx;
    
// Generate a graph of the DC charging curve based on vehicle data in database    
function generateChargingCurve(vehicle) {
  // Check if the vehicle has DC charging curve data
  if (vehicle.dc_charger && vehicle.dc_charger.charging_curve && vehicle.dc_charger.charging_curve.length > 0) {
    const batterySize = vehicle.usable_battery_size;
    const rawCurve = vehicle.dc_charger.charging_curve;
    const points = [];
    let cumulativeTimeMinutes = 0;
    
    // Sort the curve points by percentage to ensure they're in order
    const sortedCurve = [...rawCurve].sort((a, b) => a.percentage - b.percentage);
    
    // If the curve doesn't start at 0%, add a starting point
    if (sortedCurve[0].percentage > 0) {
      // Estimate power at 0% based on the first point
      const estimatedPower = sortedCurve[0].power * 0.9; // Slightly lower than first point
      sortedCurve.unshift({ percentage: 0, power: estimatedPower });
    }
    
    // If the curve doesn't end at 100%, add an ending point
    if (sortedCurve[sortedCurve.length - 1].percentage < 100) {
      // Use the last known power
      sortedCurve.push({ percentage: 100, power: sortedCurve[sortedCurve.length - 1].power });
    }
    
    // Interpolate to get points at 5% intervals
    for (let soc = 0; soc <= 100; soc += 5) {
      // Find the two points that bracket this SOC
      let lowerPoint = null;
      let upperPoint = null;
      
      for (let i = 0; i < sortedCurve.length - 1; i++) {
        if (sortedCurve[i].percentage <= soc && sortedCurve[i + 1].percentage >= soc) {
          lowerPoint = sortedCurve[i];
          upperPoint = sortedCurve[i + 1];
          break;
        }
      }
      
      // Linear interpolation between the two points
      const rangePct = upperPoint.percentage - lowerPoint.percentage;
      const pctPosition = (soc - lowerPoint.percentage) / rangePct;
      const interpolatedPower = lowerPoint.power + pctPosition * (upperPoint.power - lowerPoint.power);
      
      // Calculate time to add this 5% of charge if not the first point
      if (points.length > 0) {
        const prevPoint = points[points.length - 1];
        // Energy added in this 5% segment (kWh)
        const segmentEnergy = batterySize * 0.05;
        
        // Average power between previous and current point (kW)
        const avgPower = (prevPoint.power + interpolatedPower) / 2;
        
        // Time to add this energy (hours) = energy (kWh) / power (kW)
        const segmentTimeHours = segmentEnergy / avgPower;
        
        // Add to cumulative time (convert to minutes)
        cumulativeTimeMinutes += segmentTimeHours * 60;
      }
      
      points.push({ 
        soc, 
        power: Math.round(interpolatedPower),
        timeMinutes: Math.round(cumulativeTimeMinutes)
      });
    }
    
    return points;
  } else {
    console.log("No charging curve data available");
  }
}
    
    // Calculate charging times
    function calculateChargingTimes(batterySize, chargingCurve) {
      // Calculate time to charge from 10% to 80%
      let timeFrom10to80 = 0;
      let energyAdded = 0;
      
      for (let i = 2; i < 16; i++) {
        // Each point is 5% SOC, so we're calculating from 10% (index 2) to 80% (index 16)
        const point = chargingCurve[i];
        const nextPoint = chargingCurve[i + 1];
        
        if (nextPoint) {
          // Average power between current and next point (kW)
          const avgPower = (point.power + nextPoint.power) / 2;
          
          // Energy added in this 5% segment (kWh)
          const segmentEnergy = batterySize * 0.05;
          energyAdded += segmentEnergy;
          
          // Time to add this energy (hours) = energy (kWh) / power (kW)
          const segmentTime = segmentEnergy / avgPower;
          
          // Add to total time (convert to minutes)
          timeFrom10to80 += segmentTime * 60;
        }
      }
      
      return {
        timeFrom10to80: Math.round(timeFrom10to80),
        energyAdded: Math.round(energyAdded * 10) / 10
      };
    }

// Draw the charging graph with time information
function drawChargingGraph(canvas, chargingCurve) {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Add padding for axis labels
  const padding = {
    left: 70,
    right: 20,
    top: 20,
    bottom: 60
  };
  
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  
  // Set up scales
  const maxPower = Math.max(...chargingCurve.map(p => p.power)) * 1.1;
  const xScale = graphWidth / 100; // SOC from 0-100%
  const yScale = graphHeight / maxPower;
  
  // Dynamically determine the appropriate interval for power labels
  let powerInterval;
  if (maxPower <= 50) {
    powerInterval = 10; // For low-power vehicles, show every 10 kW
  } else if (maxPower <= 150) {
    powerInterval = 25; // For medium-power vehicles, show every 25 kW
  } else if (maxPower <= 300) {
    powerInterval = 50; // For high-power vehicles, show every 50 kW
  } else {
    powerInterval = 100; // For ultra-high-power vehicles, show every 100 kW
  }
  
  // Calculate the number of intervals to ensure we don't have too many labels
  const maxIntervals = 8;
  const calculatedInterval = Math.ceil(maxPower / maxIntervals);
  // Use the larger of our predetermined interval or calculated interval
  powerInterval = Math.max(powerInterval, calculatedInterval);
  // Round number
  powerInterval = Math.ceil(powerInterval / 10) * 10;
  
  // Draw grid
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  // Vertical grid lines (SOC)
  for (let soc = 0; soc <= 100; soc += 10) {
    ctx.beginPath();
    ctx.moveTo(padding.left + soc * xScale, padding.top);
    ctx.lineTo(padding.left + soc * xScale, height - padding.bottom);
    ctx.stroke();
  }
  
  // Horizontal grid lines (Power)
  for (let power = 0; power <= maxPower; power += powerInterval) {
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom - power * yScale);
    ctx.lineTo(width - padding.right, height - padding.bottom - power * yScale);
    ctx.stroke();
  }
  
  // Draw axes
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  
  // X-axis
  ctx.beginPath();
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();
  
  // Draw axes labels
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  
  // X-axis (SOC) labels - every 20%
  for (let soc = 0; soc <= 100; soc += 20) {
    ctx.fillText(`${soc}%`, padding.left + soc * xScale - 10, height - padding.bottom + 20);
  }
  
  // Y-axis (Power) labels - using dynamic interval
  for (let power = 0; power <= maxPower; power += powerInterval) {
    if (power > 0 || power === 0) { // Include 0 kW label
      // Align text to right for y-axis labels
      ctx.textAlign = 'right';
      ctx.fillText(`${power} kW`, padding.left - 5, height - padding.bottom - power * yScale + 5);
      ctx.textAlign = 'left';
    }
  }
  
  // Add axis titles
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  
  // X-axis title
  ctx.fillText('State of Charge (%)', width / 2, height - 5);
  
  // Y-axis title - rotated
  ctx.save();
  ctx.translate(15, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Charging Power (kW)', 0, 0);
  ctx.restore();
  
  ctx.textAlign = 'left';
  
  // Draw the charging curve
  ctx.strokeStyle = '#007bff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  // Move to first point
  ctx.moveTo(
    padding.left + chargingCurve[0].soc * xScale,
    height - padding.bottom - chargingCurve[0].power * yScale
  );
  
  // Draw line to each subsequent point
  for (let i = 1; i < chargingCurve.length; i++) {
    ctx.lineTo(
      padding.left + chargingCurve[i].soc * xScale,
      height - padding.bottom - chargingCurve[i].power * yScale
    );
  }
  
  ctx.stroke();
  
  // Highlight 10-80% charging area
  ctx.fillStyle = 'rgba(0, 123, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(padding.left + 10 * xScale, height - padding.bottom);
  
  // Draw line along the curve from 10% to 80%
  for (let i = 2; i <= 16; i++) {
    ctx.lineTo(
      padding.left + chargingCurve[i].soc * xScale,
      height - padding.bottom - chargingCurve[i].power * yScale
    );
  }
  
  // Complete the rectangle
  ctx.lineTo(padding.left + 80 * xScale, height - padding.bottom);
  ctx.closePath();
  ctx.fill();
  
  // Add labels for 10% and 80%
  ctx.fillStyle = '#007bff';
  ctx.fillText('10%', padding.left + 10 * xScale - 10, height - padding.bottom - 20);
  ctx.fillText('80%', padding.left + 80 * xScale - 10, height - padding.bottom - 20);
  
  // Add time markers for key percentages
  const timeMarkers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  // Find the closest data point for each marker
  timeMarkers.forEach(targetSoc => {
    const closestPoint = chargingCurve.reduce((prev, curr) => 
      Math.abs(curr.soc - targetSoc) < Math.abs(prev.soc - targetSoc) ? curr : prev
    );
    
    // Format time (minutes to hours and minutes)
    let timeText;
    if (closestPoint.timeMinutes < 60) {
      timeText = `${closestPoint.timeMinutes}m`;
    } else {
      const hours = Math.floor(closestPoint.timeMinutes / 60);
      const minutes = closestPoint.timeMinutes % 60;
      timeText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    
    // Draw time marker
    const x = padding.left + closestPoint.soc * xScale;
    const y = height - padding.bottom - closestPoint.power * yScale;
    
    // Draw dot at the point
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw time label (alternate above/below to avoid overlap)
    ctx.fillStyle = '#333';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    
    const isEven = (timeMarkers.indexOf(targetSoc) % 2 === 0);
    const yOffset = isEven ? -15 : 15;
    
    ctx.fillText(timeText, x, y + yOffset);
  });
  
  ctx.textAlign = 'left';
}
    
    // Generate charging curve and times when component mounts
    let chargingCurve = $state(null);
    let chargingTimes = $state(null);
    
    // Focus management for modal
    onMount(() => {
      if (vehicle) {
        chargingCurve = generateChargingCurve(vehicle);
        chargingTimes = calculateChargingTimes(vehicle.usable_battery_size, chargingCurve);
        
        // When component mounts draw the graph
        setTimeout(() => {
          let canvas = document.getElementById('charging-graph');
          if (canvas) {
            drawChargingGraph(canvas, chargingCurve);
          }
        }, 100);
        
        // Eslint Accessibilityn fix: Handle escape key 
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        const closeButton = document.querySelector('.close-button');
        if (closeButton) {
          closeButton.focus();
        }
        
        // Clean up event listeners
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }
    });
  </script>
  
  <div 
    class="ev-detail-overlay" 
    role="dialog" 
    aria-modal="true" 
  >
    <article 
      class="ev-detail-container" 
    >
      <button class="close-button" onclick={onClose} aria-label="Close details">×</button>
      
      <div class="ev-detail-header">
        <h2>{vehicle.brand} {vehicle.model} {vehicle.variant}</h2>
        <p class="ev-year">{vehicle.release_year}</p>
      </div>
      
      <div class="ev-detail-grid">
        <div class="ev-specs">
          <h3>Specifications</h3>
          <div class="spec-item">
            <span class="spec-label">Range (WLTP):</span>
            <span class="spec-value">{vehicle.wltp_range_km} km</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Battery Capacity:</span>
            <span class="spec-value">{vehicle.usable_battery_size} kWh</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Efficiency:</span>
            <span class="spec-value">
              {(vehicle.wltp_range_km / vehicle.usable_battery_size).toFixed(1)} km/kWh
            </span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Body Type:</span>
            <span class="spec-value">{vehicle.body_type}</span>
          </div>
          
          {#if vehicle.max_dc_charge_rate}
            <div class="spec-item">
              <span class="spec-label">Max DC Charging:</span>
              <span class="spec-value">{vehicle.max_dc_charge_rate} kW</span>
            </div>
          {/if}
          
          {#if vehicle.acceleration_0_100}
            <div class="spec-item">
              <span class="spec-label">0-100 km/h:</span>
              <span class="spec-value">{vehicle.acceleration_0_100} sec</span>
            </div>
          {/if}
        </div>
        
        <div class="ev-charging">
            <h3>Charging Performance</h3>
            
            {#if chargingTimes}
              <div class="charging-stats">
                <div class="charging-stat">
                  <span class="stat-value">{chargingTimes.timeFrom10to80}</span>
                  <span class="stat-label">minutes (10-80%)</span>
                </div>
                <div class="charging-stat">
                  <span class="stat-value">{chargingTimes.energyAdded}</span>
                  <span class="stat-label">kWh added</span>
                </div>
              </div>
            {/if}
            
            <div class="charging-graph-container">
              <h4>DC Fast Charging Curve</h4>
              {#if chargingCurve && chargingCurve.length > 0}
                <canvas id="charging-graph" width="500" height="300"></canvas>
                <div class="graph-legend">
                  <div class="legend-item">
                    <span class="legend-color" style="background: #007bff;"></span>
                    <span>Charging Power (kW)</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color" style="background: rgba(0, 123, 255, 0.1);"></span>
                    <span>10-80% Charging Zone</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color" style="background: #e74c3c;"></span>
                    <span>Time to Reach SOC</span>
                  </div>
                </div>
                <div class="time-explanation">
                  <p>Red dots show the time required to reach each State Of Charge (SOC) from 0%.</p>
                </div>
              {:else}
                <div class="no-data-message">
                  <p>No charging curve data has been uploaded for this vehicle, hopefully in a future EV update this will be added. Please contact EV manufacturer to request this directly if needed.</p>
                </div>
              {/if}
            </div>
          </div> 
        </div>         
      
      <div class="ev-detail-footer">
        <p class="disclaimer">
          Note: Charging curve is an approximation based on typical EV behavior.
          Actual charging speeds may vary based on temperature, charger capabilities, and battery condition.
        </p>
      </div>
    </article>
  
    <!-- Overlay close button -->
    <button 
      class="overlay-close-button" 
      onclick={onClose} 
      aria-label="Close modal"
    ></button>
  </div>
  
  <style>
    .ev-detail-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
      overflow-y: auto;
    }
    
    .overlay-close-button {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 1;
    }
    
    .ev-detail-container {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 1000px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      position: relative;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      z-index: 2;
    }
    
    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    
    .close-button:hover {
      color: #000;
    }
    
    .ev-detail-header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }
    
    .ev-detail-header h2 {
      margin: 0;
      color: #333;
    }
    
    .ev-year {
      color: #666;
      margin: 0.5rem 0 0 0;
    }
    
    .ev-detail-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }
    
    .ev-specs h3, .ev-charging h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .spec-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .spec-label {
      font-weight: bold;
      color: #555;
    }
    
    .spec-value {
      color: #333;
    }
    
    .charging-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }
    
    .charging-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      flex: 1;
    }
    
    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #007bff;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    
    .charging-graph-container {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .charging-graph-container h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #495057;
  }
  
  canvas {
    width: 100%;
    height: auto;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .graph-legend {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    justify-content: center;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .legend-color {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
  
  .ev-detail-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .time-explanation {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
    text-align: center;
    }

  
  .disclaimer {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
  }

  .no-data-message {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 4px;
    text-align: center;
    color: #666;
    border: 1px dashed #ccc;
    margin: 1rem 0;
}
  
  @media (max-width: 768px) {
    .ev-detail-grid {
      grid-template-columns: 1fr;
    }
    
    .ev-detail-container {
      padding: 1rem;
      width: 95%;
    }
    
    .charging-stats {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
