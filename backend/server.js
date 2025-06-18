const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sample data - replace with your database
let locationItems = [
  {
    id: 1,
    itemId: "949",
    name: "Cheese and Corn",
    price: "$0",
    availability: "Online",
    onlinePrice: "$199",
    location: "Captain Cookes Forest Hill",
    discount: "0",
    onlineDiscount: "0",
    discountType: "Flat",
    status: "Active",
    tags: ["Burgers", "Chips"],
    modifiers: {
      sauceOptions: [
        { name: "Classic Tomato Sauce", price: "$1 / $1" },
        { name: "Garlic Butter Sauce", price: "$2 / $2" },
        { name: "White Cream Sauce", price: "$2 / $2" }
      ],
      extras: [
        { name: "Beef Pattie", price: "$2 / $2" },
        { name: "Beetroot", price: "$1 / $1" },
        { name: "Cheese", price: "$2 / $2" },
        { name: "Lettuce", price: "$2 / $2" },
        { name: "Onion", price: "$1 / $1" }
      ]
    }
  },
  // Add more sample data as needed
];

// Routes
app.get('/api/location-items', (req, res) => {
  res.json(locationItems);
});

app.get('/api/location-items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = locationItems.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  res.json(item);
});

app.put('/api/location-items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const itemIndex = locationItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Update item
  locationItems[itemIndex] = {
    ...locationItems[itemIndex],
    ...req.body
  };
  
  res.json(locationItems[itemIndex]);
});

app.put('/api/location-items/:id/modifiers', (req, res) => {
  const id = parseInt(req.params.id);
  const { modifiers } = req.body;
  const itemIndex = locationItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }
  
  // Update modifiers
  locationItems[itemIndex].modifiers = modifiers;
  
  res.json(locationItems[itemIndex]);
});

app.post('/api/location-items/clone', (req, res) => {
  const { sourceLocation, targetLocation, items } = req.body;
  
  // Clone logic - simplified for demonstration
  const newItems = [];
  
  for (const itemId of items) {
    const sourceItem = locationItems.find(item => item.id === itemId);
    
    if (sourceItem && sourceItem.location === sourceLocation) {
      // Create a new id (in a real app, this would be handled by the database)
      const newId = Math.max(...locationItems.map(item => item.id)) + 1;
      
      const newItem = {
        ...sourceItem,
        id: newId,
        location: targetLocation
      };
      
      locationItems.push(newItem);
      newItems.push(newItem);
    }
  }
  
  res.json({ 
    message: `Cloned ${newItems.length} items from ${sourceLocation} to ${targetLocation}`,
    items: newItems
  });
});

// Start server
app.listen(PORT, () => {
  
});

// Add this for easier development
console.log(`
---------------------------------------------------
🚀 API Server running at http://localhost:${PORT}
---------------------------------------------------
Endpoints:
- GET    /api/location-items
- GET    /api/location-items/:id
- PUT    /api/location-items/:id
- PUT    /api/location-items/:id/modifiers
- POST   /api/location-items/clone
---------------------------------------------------
`);
