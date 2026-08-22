import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../contexts/PropertyContext';
import './demopage.css';

const categories = ['All', 'House', 'Apartment', 'Hostel', 'Room', 'Commercial'];

const emptyForm = {
  title: '',
  type: 'House',
  price: '',
  address: '',
  area: 'Lahore',
  bedrooms: 2,
  bathrooms: 2,
  parking: 1,
  status: 'Available',
  description: '',
  image: '',
};

function DemoPage() {
  const { properties, addProperty, updateProperty, deleteProperty } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return properties.filter((property) => {
      const matchesCategory = activeCategory === 'All' || property.type === activeCategory;
      const matchesSearch =
        !term ||
        property.title?.toLowerCase().includes(term) ||
        property.address?.toLowerCase().includes(term) ||
        property.area?.toLowerCase().includes(term) ||
        property.description?.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, properties, searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title || !form.address || !form.price) {
      return;
    }

    const payload = {
      ...form,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking: Number(form.parking) || 0,
      image: form.image || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      images: [form.image || 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80'],
      location: form.address,
      address: form.address,
      availability: form.status,
      description: form.description || 'Managed through RMS live editing.',
    };

    if (editingId) {
      updateProperty(editingId, payload);
    } else {
      addProperty(payload);
    }

    resetForm();
  };

  const handleEdit = (property) => {
    setEditingId(property.id);
    setForm({
      title: property.title || '',
      type: property.type || 'House',
      price: property.price || '',
      address: property.address || property.location || '',
      area: property.area || 'Lahore',
      bedrooms: property.bedrooms ?? 2,
      bathrooms: property.bathrooms ?? 2,
      parking: property.parking ?? 1,
      status: property.status || 'Available',
      description: property.description || '',
      image: property.image || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id) => {
    deleteProperty(id);
    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="demo-heading">
          <p className="eyebrow">Property Demo</p>
          <h1>Live property management for RMS</h1>
          <p className="subtitle">
            Add, edit, and remove listings in real time. Every change updates the shared property data used across the website.
          </p>
        </div>

        <div className="demo-search-panel">
          <input
            type="search"
            placeholder="Search properties…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div className="demo-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={category === activeCategory ? 'filter-button active' : 'filter-button'}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="property-section">
        <div className="section-header">
          <div>
            <h2>Property management console</h2>
            <p>Create a new listing or update an existing one instantly.</p>
          </div>
          <span className="section-count">{properties.length} live records</span>
        </div>

        <div className="management-layout">
          <form className="management-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Property title
                <input name="title" value={form.title} onChange={handleChange} placeholder="Luxury family villa" required />
              </label>
              <label>
                Type
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Room">Room</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Price
                <input name="price" value={form.price} onChange={handleChange} placeholder="Rs 85 Lakh" required />
              </label>
              <label>
                Address
                <input name="address" value={form.address} onChange={handleChange} placeholder="Main Boulevard, Lahore" required />
              </label>
            </div>

            <div className="form-row">
              <label>
                Area
                <input name="area" value={form.area} onChange={handleChange} placeholder="DHA Lahore" />
              </label>
              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Pending">Pending</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                Bedrooms
                <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} />
              </label>
              <label>
                Bathrooms
                <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} />
              </label>
              <label>
                Parking
                <input type="number" name="parking" value={form.parking} onChange={handleChange} />
              </label>
            </div>

            <label>
              Image URL
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Describe the listing" />
            </label>

            <div className="form-actions">
              <button type="submit" className="details-button">
                {editingId ? 'Save changes' : 'Add property'}
              </button>
              <button type="button" className="secondary-button" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>

          <div className="management-preview">
            <h3>Live listings</h3>
            {filteredProperties.map((property) => (
              <article className="property-card compact" key={property.id}>
                <div className="card-image" style={{ backgroundImage: `url(${property.image})` }} />
                <div className="card-body">
                  <div className="card-meta">
                    <span className="card-type">{property.type}</span>
                    <span className={property.status === 'Available' ? 'status-badge available' : 'status-badge occupied'}>
                      {property.status}
                    </span>
                  </div>
                  <h3>{property.title}</h3>
                  <p className="location">📍 {property.address || property.location}</p>
                  <div className="card-footer">
                    <p className="price">{property.price}</p>
                    <div className="card-actions">
                      <button type="button" className="secondary-button" onClick={() => handleEdit(property)}>
                        Edit
                      </button>
                      <button type="button" className="details-button" onClick={() => handleDelete(property.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="demo-cta">
        <div>
          <p>Manage Your Residential Properties Smarter</p>
          <h2>
            RMS makes it easy to manage properties, residents, rooms, payments, and maintenance from one powerful platform.
          </h2>
        </div>
        <Link to="/contact" className="cta-button1">
          Get Started
        </Link>
      </section>
    </div>
  );
}

export default DemoPage;