export const CATEGORY_SPECIFICATIONS = {
  'TV': [
    { name: 'Screen Size', type: 'number', min: 24, max: 120, unit: 'inches', required: true },
    { name: 'Resolution', type: 'dropdown', values: ['768p', 'HD', 'Full HD', '4K', '8K'], required: true },
    { name: 'Display Type', type: 'dropdown', values: ['LED', 'QLED', 'OLED'], required: true },
    { name: 'Refresh Rate', type: 'dropdown', values: ['60Hz', '120Hz', '144Hz'], required: true },
// Removed Smart TV 
    { name: 'HDMI Ports', type: 'number', min: 0, max: 10, required: true },
    { name: 'USB Ports', type: 'number', min: 0, max: 10, required: true },
    { name: 'Speaker Output', type: 'number', min: 5, max: 100, unit: 'W', required: true }
  ],
  'Fridge': [
    { name: 'Capacity', type: 'number', min: 50, max: 1000, unit: 'Litres', required: true },
    { name: 'Refrigerator Type', type: 'dropdown', values: ['Single Door', 'Double Door', 'Side-by-Side', 'French Door'], required: true },
    { name: 'Defrost Type', type: 'dropdown', values: ['Direct Cool', 'Frost Free'], required: true },
    { name: 'Energy Rating', type: 'dropdown', values: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], required: true },
    { name: 'Compressor Type', type: 'dropdown', values: ['Normal', 'Inverter'], required: true },
    { name: 'Shelves Material', type: 'dropdown', values: ['Toughened Glass', 'Wire'], required: true },
    { name: 'Number of Doors', type: 'number', min: 1, max: 4, required: true },
    { name: 'Power Consumption', type: 'number', min: 50, max: 500, unit: 'W', required: true }
  ],
  'Washing Machine': [
    { name: 'Capacity', type: 'number', min: 5, max: 20, unit: 'kg', required: true },
    { name: 'Washing Machine Type', type: 'dropdown', values: ['Top Load', 'Front Load', 'Semi Automatic'], required: true },
    { name: 'Energy Rating', type: 'dropdown', values: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], required: true },
    { name: 'Spin Speed', type: 'number', min: 400, max: 2000, unit: 'RPM', required: true },
    { name: 'Number of Wash Programs', type: 'number', min: 1, max: 50, required: true },
    { name: 'Inverter Technology', type: 'boolean', required: true },
    { name: 'Drum Material', type: 'dropdown', values: ['Stainless Steel', 'Plastic'], required: true },
    { name: 'Power Consumption', type: 'number', min: 300, max: 2000, unit: 'W', required: true }
  ],
  'AC': [
    { name: 'Capacity', type: 'dropdown', values: ['0.75 Ton', '1 Ton', '1.5 Ton', '2 Ton', '2.5 Ton'], required: true },
    { name: 'AC Type', type: 'dropdown', values: ['Split', 'Window', 'Portable'], required: true },
    { name: 'Energy Rating', type: 'dropdown', values: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], required: true },
    { name: 'Compressor Type', type: 'dropdown', values: ['Inverter', 'Non-Inverter'], required: true },
    { name: 'Cooling Capacity', type: 'number', min: 5000, max: 24000, unit: 'BTU', required: true },
    { name: 'Power Consumption', type: 'number', min: 500, max: 3000, unit: 'W', required: true },
    { name: 'Air Flow', type: 'number', min: 200, max: 1000, unit: 'CFM', required: true },
    { name: 'Refrigerant Type', type: 'dropdown', values: ['R32', 'R410A', 'R22'], required: true }
  ],
  'Microwave Oven': [
    { name: 'Capacity', type: 'number', min: 10, max: 50, unit: 'Litres', required: true },
    { name: 'Microwave Type', type: 'dropdown', values: ['Solo', 'Grill', 'Convection'], required: true },
    { name: 'Power Consumption', type: 'number', min: 500, max: 2500, unit: 'W', required: true }
  ]
};
